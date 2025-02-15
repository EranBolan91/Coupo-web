import {
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
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Coupon, CouponBrand, CurrentUser } from "../types/Types";
import { collectionsList } from "../../firebaseCollections";
import { orderBy } from "firebase/firestore/lite";
import { db, storage } from "./databaseConfig";

let documentCoursor: any = {};

export const getPaginatedCoupons = async (queryParam: string, pageParam: any) => {
  const dataLimit = 10;
  try {
    const coupons: Coupon[] = [];
    let documentSnapshots: QuerySnapshot<DocumentData>;
    let fetchQuery: Query;

    if (pageParam === null) {
      if (queryParam === "") {
        fetchQuery = query(collection(db, collectionsList.coupons), orderBy("createdAt", "desc"), limit(dataLimit));
      } else {
        fetchQuery = query(
          collection(db, collectionsList.coupons),
          orderBy("createdAt", "desc"),
          where("name", "==", queryParam),
          limit(dataLimit)
        );
      }
    } else {
      if (queryParam === "") {
        fetchQuery = query(
          collection(db, collectionsList.coupons),
          orderBy("createdAt", "desc"),
          startAfter(documentCoursor),
          limit(dataLimit)
        );
      } else {
        fetchQuery = query(
          collection(db, collectionsList.coupons),
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

export const getPaginatedCouponsByCategory = async (pageParam: any, categoryName: string | undefined) => {
  const dataLimit = 10;
  try {
    const coupons: Coupon[] = [];
    let documentSnapshots: QuerySnapshot<DocumentData>;
    let fetchQuery: Query;

    if (categoryName !== undefined) {
      if (pageParam === null) {
        fetchQuery = query(
          collection(db, collectionsList.coupons),
          orderBy("createdAt", "desc"),
          where("category", "==", categoryName),
          limit(dataLimit)
        );
      } else {
        fetchQuery = query(
          collection(db, collectionsList.coupons),
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
  const getCoupons = await getDocs(collection(db, collectionsList.coupons));
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
  const getCoupons = await getDocs(collection(db, collectionsList.brands));
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
  const getCategories = await getDocs(collection(db, collectionsList.category));
  getCategories.forEach((category) => {
    categories.push(category.data().category);
  });
  return categories;
};

export const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const today = new Date();

  const couponsRef = collection(db, collectionsList.userCoupons, userID, collectionsList.coupons);
  const q = query(couponsRef, where("expiry", ">=", today));
  const ref = await getDocs(q);

  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

export const getExpiredCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const today = new Date();

  const couponsRef = collection(db, collectionsList.userCoupons, userID, collectionsList.coupons);
  const q = query(couponsRef, where("expiry", "<", today));
  const ref = await getDocs(q);

  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

export const removeUserCoupon = async (userID: string, couponID: string) => {
  const ref = doc(db, collectionsList.userCoupons, userID, collectionsList.coupons, couponID);
  await deleteDoc(ref);
};

export const saveNewCoupon = async (coupon: Coupon) => {
  coupon.createdAt = Timestamp.fromDate(new Date());
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, collectionsList.coupons), {
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
    async () => {
      const downloadImgURL = await getDownloadURL(uploadTask.snapshot.ref);
      addDoc(collection(db, collectionsList.brands), {
        brand: imageName.split(".")[0],
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

    const docRef = doc(db, collectionsList.userVotes, userID, subCollectionName, coupon.id);
    await setDoc(docRef, coupon);
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
  const docRef = doc(db, collectionsList.userCoupons, userID, collectionsList.coupons, couponID);
  await updateDoc(docRef, {
    category: category,
    discount: discount,
    description: description,
  });
};

export const saveUserToDatabase = async (user: CurrentUser) => {
  const ref = doc(db, `${collectionsList.users}/${user.userUID}`);
  await setDoc(ref, user);
};

export const getUserDetails = async (userUID: string): Promise<CurrentUser | null> => {
  try {
    const userDocRef = doc(db, collectionsList.users, userUID);
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

export const getUserLikesVotes = async (userID: string): Promise<Coupon[] | []> => {
  try {
    const coupons: Coupon[] = [];
    const ref = collection(db, collectionsList.userVotes, userID, "likes");
    const data = await getDocs(ref);

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
    const data = await getDocs(ref);

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
