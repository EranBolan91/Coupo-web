import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  limit,
  query,
  QuerySnapshot,
  DocumentData,
  startAfter,
  Query,
  where,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Coupon, CouponBrand, CurrentUser } from "../types/Types";
import { orderBy } from "firebase/firestore/lite";
import app from "../firebaseConfig";

// Initialize Firebase
const db = getFirestore(app);
const storage = getStorage();

let documentCoursor: any = {};

export const getPaginatedCoupons = async (queryParam: string, pageParam: any) => {
  const dataLimit = 10;
  try {
    const coupons: Coupon[] = [];
    let documentSnapshots: QuerySnapshot<DocumentData>;
    let fetchQuery: Query;

    if (pageParam === null) {
      if (queryParam === "") {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          limit(dataLimit)
        );
      } else {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          where("name", "==", queryParam),
          limit(dataLimit)
        );
      }
    } else {
      if (queryParam === "") {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          startAfter(documentCoursor),
          limit(dataLimit)
        );
      } else {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          where("name", "==", queryParam),
          startAfter(documentCoursor),
          limit(dataLimit)
        );
      }
    }

    documentSnapshots = await getDocs(fetchQuery);
    documentCoursor = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    documentSnapshots.docs.forEach((doc) => {
      const coupon = { id: doc.id, ...doc.data() };
      coupons.push(coupon as Coupon);
    });

    return coupons?.length > 0 ? coupons : [];
  } catch (err) {
    console.log(err);
  }
};

export const getPaginatedCouponsByCategory = async (
  pageParam: any,
  categoryName: string | undefined
) => {
  const dataLimit = 10;
  try {
    const coupons: Coupon[] = [];
    let documentSnapshots: QuerySnapshot<DocumentData>;
    let fetchQuery: Query;

    if (categoryName !== undefined) {
      if (pageParam === null) {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          where("category", "==", categoryName),
          limit(dataLimit)
        );
      } else {
        fetchQuery = query(
          collection(db, "Coupons"),
          orderBy("createdAt", "desc"),
          where("category", "==", categoryName),
          startAfter(documentCoursor),
          limit(dataLimit)
        );
      }

      documentSnapshots = await getDocs(fetchQuery);
      documentCoursor = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      documentSnapshots.docs.forEach((doc) => {
        const coupon = { id: doc.id, ...doc.data() };
        coupons.push(coupon as Coupon);
      });
    }

    return coupons?.length > 0 ? coupons : [];
  } catch (err) {
    console.log(err);
  }
};

export const getAllCoupons = async () => {
  const coupons: Coupon[] = [];
  const getCoupons = await getDocs(collection(db, "Coupons"));
  getCoupons.forEach((coupon) => {
    coupons.push({
      id: coupon.id,
      ...coupon.data().coupon,
    });
  });
  return coupons;
};

export const getCouponsBrands = async () => {
  const couponsBrands: CouponBrand[] = [];
  const getCoupons = await getDocs(collection(db, "Brands"));
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
  const getCategories = await getDocs(collection(db, "Category"));
  getCategories.forEach((category) => {
    categories.push(category.data().category);
  });
  return categories;
};

export const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const ref = await getDocs(collection(db, "UsersCoupons", userID, "coupons"));
  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

export const getExpiredCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const today = new Date();

  const couponsRef = collection(db, "UsersCoupons", userID, "coupons");
  const q = query(couponsRef, where("expiry", "<", today));
  const ref = await getDocs(q);

  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

export const removeUserCoupon = async (userID: string, couponID: string) => {
  const ref = doc(db, "UsersCoupons", userID, "coupons", couponID);
  await deleteDoc(ref);
};

export const saveNewCoupon = async (coupon: Coupon) => {
  coupon.createdAt = Timestamp.fromDate(new Date());
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, "Coupons"), {
    ...coupon,
  });
};

export const saveUserNewCoupon = async (coupon: Coupon, userID: string) => {
  try {
    coupon.createdAt = Timestamp.fromDate(new Date());
    coupon.likes = 0;
    coupon.dislikes = 0;
    const expiryDate = new Date(coupon.expiry.toString());
    coupon.expiry = Timestamp.fromDate(expiryDate);

    const userCouponsRef = collection(db, `UsersCoupons/${userID}/coupons/`);
    await addDoc(userCouponsRef, coupon);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const saveImageBrand = async (imgFile: any, imageName: string) => {
  const storageRef = ref(storage, imageName + ".svg");
  const uploadTask = uploadBytesResumable(storageRef, imgFile);
  uploadTask.on(
    "state_changed",
    () => {},
    (error) => console.log(error),
    async () => {
      const downloadImgURL = await getDownloadURL(uploadTask.snapshot.ref);
      addDoc(collection(db, "Brands"), {
        brand: imageName,
        imgUrl: downloadImgURL,
      }).catch((err) => {
        throw new Error(err);
      });
    }
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

    await setDoc(doc(db, "UserVoting", userID, subCollectionName, coupon.id), {
      coupon,
    });
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
};

export const updateCoupon = async (
  category: string,
  discount: string,
  description: string,
  couponID: string,
  userID: string
) => {
  const docRef = doc(db, "UsersCoupons", userID, "coupons", couponID);
  await updateDoc(docRef, {
    category: category,
    discount: discount,
    description: description,
  });
};

export const saveUserToDatabase = async (user: CurrentUser) => {
  const ref = doc(db, `Users/${user.userUID}`);
  await setDoc(ref, user);
};

export const getUserDetails = async (userUID: string): Promise<CurrentUser | null> => {
  try {
    const userDocRef = doc(db, "Users", userUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as CurrentUser; // Fetch the document data
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const updatePersonalUserDetails = async (
  userUID: string,
  userDetails: { [key: string]: any }
) => {
  try {
    const userDocRef = doc(db, "Users", userUID);
    await updateDoc(userDocRef, {
      ...userDetails,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
