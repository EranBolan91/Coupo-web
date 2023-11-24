import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { Coupon } from "../types/Types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getCouponsBrands = async () => {
  const couponsBrands: string[] = [];
  const getCoupons = await getDocs(collection(db, "Brands"));
  getCoupons.forEach((coupon) => {
    couponsBrands.push(coupon.data().brand);
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

export { getCouponsBrands, saveNewCoupon, getCategories };
