import { Coupon, CouponBrand } from "../types/Types";
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
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebaseConfig";
import { orderBy } from "firebase/firestore/lite";

// Initialize Firebase
const db = getFirestore(app);
const storage = getStorage();

let documentCoursor: any = {};

const getPaginatedCoupons = async (limitPage: number, lastDoc: any = {}) => {
  try {
    const coupons: Coupon[] = [];
    let documentSnapshots: QuerySnapshot<DocumentData>;
    let fetchQuery: Query;
    if (Object.keys(lastDoc).length === 0) {
      fetchQuery = query(
        collection(db, "Coupons"),
        orderBy("createdAt"),
        limit(limitPage)
      );
    } else {
      fetchQuery = query(
        collection(db, "Coupons"),
        orderBy("createdAt", "desc"),
        startAfter(documentCoursor),
        limit(limitPage)
      );
    }
    documentSnapshots = await getDocs(fetchQuery);
    documentCoursor = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    documentSnapshots.docs.forEach((doc) => {
      coupons.push({
        id: doc.id,
        ...doc.data().coupon,
      });
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

//TODO: Need to find a better way to destruct the data
const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const ref = await getDocs(collection(db, "UsersCoupons", userID, "coupons"));
  ref.forEach((doc) => {
    coupons.push({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      imgUrl: doc.data().imgUrl,
      code: doc.data().code,
      category: doc.data().category,
      expiry: doc.data().expiry,
      discount: doc.data().discount,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
      likes: doc.data().likes,
      dislikes: doc.data().dislikes,
    });
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
    coupon,
  });
};

const saveUserNewCoupon = async (coupon: Coupon, userID: string) => {
  coupon.createdAt = new Date();
  coupon.likes = 0;
  coupon.dislikes = 0;
  await addDoc(collection(db, "Coupons"), {
    coupon,
  });
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

const saveCouponVote = async (
  couponID: string,
  userID: string,
  vote: number
) => {
  let subCollectionName = "";
  if (vote) {
    subCollectionName = "Likes";
  } else {
    subCollectionName = "Dislikes";
  }
  const ref = doc(db, "CouponVoting", couponID);
  const colRef = collection(ref, subCollectionName);
  addDoc(colRef, { userID });
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
  saveCouponVote,
  getAllCoupons,
  getCategories,
  saveNewCoupon,
  saveUserVote,
};
