import { Timestamp } from "firebase/firestore";

type Coupon = {
  id: string;
  name: string;
  description: string;
  imgUrl: string;
  code: string;
  category: string;
  expiry: Timestamp;
  discount: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
  dislikes: number;
};

type CouponBrand = {
  brand: string;
  imgURL: string;
};

type CurrentUser = {
  userUID: string;
  email: string;
  firstName: string;
  lastName: string;
  imageURL: string;
  isEmailVerified: boolean;
  birthday?: Timestamp;
  lastLogin: Timestamp;
  creationDate: Timestamp;
};

type VoteObject = {
  likes: Coupon[];
  dislikes: Coupon[];
};

type WishList = string[];

type Notification = {
  content: string;
  isRead: boolean;
};

export type { Coupon, CouponBrand, CurrentUser, VoteObject, WishList, Notification };
