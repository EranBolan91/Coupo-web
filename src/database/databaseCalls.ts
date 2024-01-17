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
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebaseConfig";
import { orderBy } from "firebase/firestore/lite";
import { Coupon, CouponBrand } from "../types/Types";

// Initialize Firebase
const db = getFirestore(app);
const storage = getStorage();

let documentCoursor: any = {};

const getPaginatedCoupons = async (queryParam: string, pageParam: any) => {
  const dataLimit = 10;
  console.log("queryParam", queryParam);
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

const getAllCoupons = async () => {
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

const getCouponsBrands = async () => {
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

const getCategories = async () => {
  const categories: string[] = [];
  const getCategories = await getDocs(collection(db, "Category"));
  getCategories.forEach((category) => {
    categories.push(category.data().category);
  });
  return categories;
};

const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const ref = await getDocs(collection(db, "UsersCoupons", userID, "coupons"));
  ref.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });
  return coupons;
};

const removeUserCoupon = async (userID: string, couponID: string) => {
  const ref = doc(db, "UsersCoupons", userID, "coupons", couponID);
  await deleteDoc(ref);
};

const saveNewCoupon = async (coupon: Coupon) => {
  coupon.createdAt = new Date();
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, "Coupons"), {
    ...coupon,
  });
};

const saveUserNewCoupon = async (coupon: Coupon, userID: string) => {
  coupon.createdAt = new Date();
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, "Coupons"), coupon);
  await saveCouponToUsersCoupon(coupon, userID);
};

// This should be in cloud functions
// Saving coupon to users document
const saveCouponToUsersCoupon = async (coupon: Coupon, userID: string) => {
  const ref = doc(db, "UsersCoupons", userID);
  const colRef = collection(ref, "coupons");
  addDoc(colRef, coupon);
};

const saveImageBrand = async (imgFile: any, imageName: string) => {
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

const saveUserVote = async (coupon: Coupon, userID: string, vote: boolean) => {
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

export {
  getPaginatedCoupons,
  saveUserNewCoupon,
  getCouponsBrands,
  removeUserCoupon,
  saveImageBrand,
  getUserCoupons,
  getAllCoupons,
  getCategories,
  saveNewCoupon,
  saveUserVote,
};
