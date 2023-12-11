import { initializeApp } from "firebase/app";
import { Coupon, CouponBrand } from "../types/Types";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
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

const saveNewCoupon = async (coupon: Coupon) => {
  await addDoc(collection(db, "Coupons"), {
    coupon,
  });
};

const saveImageBrand = async (imgFile: any, imageName: string) => {
  const storageRef = ref(storage, imageName + ".svg");
  const uploadTask = uploadBytesResumable(storageRef, imgFile);
  uploadTask.on(
    "state_changed",
    (snapshot) => {},
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
};
