import { initializeApp } from "firebase/app";
import { Coupon, CouponBrand } from "../types/Types";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import config from "../firebaseConfig";

// Initialize Firebase
const app = initializeApp(config.firebaseConfig);
const db = getFirestore(app);
const storage = getStorage();

const getAllCoupons = async () => {
  const coupons: Coupon[] = [];
  const getCoupons = await getDocs(collection(db, "Coupons"));
  getCoupons.forEach((coupon) => {
    coupons.push(coupon.data().coupon);
  });
  console.log(coupons);
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

// Need to find a better way to destruct the data
const getUserCoupons = async (userID: string) => {
  const coupons: Coupon[] = [];
  const ref = await getDocs(collection(db, "UsersCoupons", userID, "coupons"));
  ref.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    coupons.push({
      ...doc.data(),
      name: doc.data().name,
      description: doc.data().description,
      imgUrl: doc.data().imgUrl,
      code: doc.data().code,
      category: doc.data().category,
      expiry: doc.data().expiry,
      discount: doc.data().discount,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
    });
  });
  return coupons;
};

const saveNewCoupon = async (coupon: Coupon) => {
  await addDoc(collection(db, "Coupons"), {
    coupon,
  });
};

const saveUserNewCoupon = async (coupon: Coupon, userID: string) => {
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

export {
  getCouponsBrands,
  saveNewCoupon,
  getCategories,
  saveImageBrand,
  getAllCoupons,
  saveUserNewCoupon,
  getUserCoupons,
};
