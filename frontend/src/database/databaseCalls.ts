import { CouponTerms } from "../logic/couponTerms";
import { isExpired } from "../logic/couponFilters";
import {
  collection,
  getDocsFromServer,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  limit,
  query,
  where,
  updateDoc,
  getDoc,
  Timestamp,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";

// Lists are read with getDocsFromServer, not getDocs: when Firestore can't reach the server, getDocs
// quietly returns an empty list instead of failing, and the app would cache "nothing here" forever.
import { collectionsList } from "../../firebaseCollections";
import { CouponBrand } from "../types/CouponBrandType";
import { db, storage } from "./databaseConfig";
import { Coupon } from "../types/CouponType";
import { UserDocument } from "../types/UserType";

// Every coupon in a public feed (Coupons or SocialCoupons), newest first. The pages search, filter, sort
// and page through it in the browser, so search can match part of a word in any field.
// Fine for hundreds of coupons; with many thousands this needs a search service instead.
export const getCouponFeed = async (collectionName: string): Promise<Coupon[]> => {
  const type = collectionName === collectionsList.socialCoupons ? "socialCoupon" : "coupon";
  const snapshot = await getDocsFromServer(query(collection(db, collectionName), orderBy("createdAt", "desc")));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id, type } as Coupon));
};

// Newest public coupons, for previews (home page).
export const getLatestCoupons = async (count: number): Promise<Coupon[]> => {
  const snapshot = await getDocsFromServer(
    query(collection(db, collectionsList.coupons), orderBy("createdAt", "desc"), limit(count))
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coupon));
};

export const getCouponsBrands = async () => {
  const couponsBrands: CouponBrand[] = [];
  const getCoupons = await getDocsFromServer(collection(db, collectionsList.brands));
  getCoupons.forEach((coupon) => {
    couponsBrands.push({
      brand: coupon.data().brand,
      imgURL: coupon.data().imgUrl,
    });
  });
  return couponsBrands;
};

export const getCategories = async () => {
  const categories: string[] = [];
  const getCategories = await getDocsFromServer(collection(db, collectionsList.category));
  getCategories.forEach((category) => {
    categories.push(category.data().category);
  });
  return categories;
};

export const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const today = new Date();

  const socialCouponsRef = collection(db, collectionsList.userCoupons, userID, collectionsList.socialCoupons);
  const couponsRef = collection(db, collectionsList.userCoupons, userID, collectionsList.coupons);
  // Not filtered in the query: where("expiry", ">=", today) would also leave out coupons with no
  // expiry date (null). Expired ones are dropped below instead.
  const [couponsSnap, socialCouponsSnap] = await Promise.all([getDocsFromServer(couponsRef), getDocsFromServer(socialCouponsRef)]);

  couponsSnap.forEach((doc) => {
    const coupon = { id: doc.id, type: "coupon", ...doc.data() };
    coupons.push(coupon as Coupon);
  });

  socialCouponsSnap.forEach((doc) => {
    const coupon = { id: doc.id, type: "socialCoupon", ...doc.data() };
    coupons.push(coupon as Coupon);
  });

  return coupons.filter((coupon) => !isExpired(coupon, today.getTime()));
};

// Coupons with no expiry date (null) are left out by the query, which is what we want here.
export const getExpiredCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const today = new Date();

  const couponsRef = collection(db, collectionsList.userCoupons, userID, collectionsList.coupons);
  const q = query(couponsRef, where("expiry", "<", today));
  const ref = await getDocsFromServer(q);

  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

// The owner's copy lives in a different subcollection for each coupon type.
const userCouponsSubcollection = (type: Coupon["type"] | undefined) =>
  type === "socialCoupon" ? collectionsList.socialCoupons : collectionsList.coupons;

export const removeUserCoupon = async (userID: string, couponID: string, type?: Coupon["type"]) => {
  const ref = doc(db, collectionsList.userCoupons, userID, userCouponsSubcollection(type), couponID);
  await deleteDoc(ref);
};

export const saveNewCoupon = async (coupon: Omit<Coupon, "id">) => {
  coupon.createdAt = Timestamp.fromDate(new Date());
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, collectionsList.coupons), {
    ...coupon,
  });
};

export const saveUserNewCoupon = async (coupon: Omit<Coupon, "id">, userID: string) => {
  try {
    coupon.createdAt = Timestamp.fromDate(new Date());
    coupon.likes = 0;
    coupon.dislikes = 0;
    // Accept a Timestamp (CouponForm), null (no expiry date) or a date string (older callers).
    if (coupon.expiry && !(coupon.expiry instanceof Timestamp)) {
      coupon.expiry = Timestamp.fromDate(new Date(String(coupon.expiry)));
    }
    if (!coupon.expiry) coupon.expiry = null;

    const userCouponsRef = collection(db, `${collectionsList.userCoupons}/${userID}/${collectionsList.coupons}/`);
    await addDoc(userCouponsRef, coupon);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const saveImageBrand = async (imgFile: File, imageName: string) => {
  const storageRef = ref(storage, `Brands/${imageName}`);
  const uploadTask = uploadBytesResumable(storageRef, imgFile);
  uploadTask.on(
    "state_changed",
    () => {},
    (error) => console.log(error),
    // The uploadImage Cloud Function creates the Brands doc { brand, imgUrl } once the upload finishes.
    () => {}
  );
};

export const saveUserVote = async (coupon: Coupon, userID: string, vote: boolean) => {
  try {
    let subCollectionName = "";
    if (vote) {
      subCollectionName = "likes";
    } else {
      subCollectionName = "dislikes";
    }

    const docRef = doc(db, collectionsList.userVotes, userID, subCollectionName, coupon.id);
    // votedAt makes a re-saved vote a real change, so the vote trigger refreshes "last worked".
    await setDoc(docRef, { ...coupon, votedAt: serverTimestamp() });
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
};

export const updateCoupon = async (
  category: string,
  discount: number,
  description: string,
  couponID: string,
  userID: string,
  type?: Coupon["type"],
  terms?: CouponTerms
) => {
  const docRef = doc(db, collectionsList.userCoupons, userID, userCouponsSubcollection(type), couponID);
  await updateDoc(docRef, {
    category: category,
    discount: discount,
    description: description,
    ...terms,
  });
};

export const saveUserToDatabase = async (user: UserDocument) => {
  const ref = doc(db, `${collectionsList.users}/${user.userUID}`);
  await setDoc(ref, user);
};

export const getUserDetails = async (userUID: string): Promise<UserDocument | null> => {
  try {
    const userDocRef = doc(db, collectionsList.users, userUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserDocument; // Fetch the document data
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getUserLikesVotes = async (userID: string): Promise<Coupon[] | []> => {
  try {
    const coupons: Coupon[] = [];
    const ref = collection(db, collectionsList.userVotes, userID, "likes");
    const data = await getDocsFromServer(ref);

    data.forEach((doc) => {
      const coupon = { id: doc.id, ...doc.data() };
      coupons.push(coupon as Coupon);
    });
    return coupons;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserDislikesVotes = async (userID: string): Promise<Coupon[] | []> => {
  try {
    const coupons: Coupon[] = [];
    const ref = collection(db, collectionsList.userVotes, userID, "dislikes");
    const data = await getDocsFromServer(ref);

    data.forEach((doc) => {
      const coupon = { id: doc.id, ...doc.data() };
      coupons.push(coupon as Coupon);
    });
    return coupons;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const removeUserVote = async (userID: string, couponID: string, voteType: boolean) => {
  try {
    const likesOrDislikes = voteType === true ? "likes" : "dislikes";
    const ref = doc(db, collectionsList.userVotes, userID, likesOrDislikes, couponID);
    await deleteDoc(ref);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
