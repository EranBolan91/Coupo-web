import {Timestamp} from "firebase-admin/firestore";

export type Coupon = {
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

export type CurrentUser = {
  userUID: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLogin: string;
  imageURL: string;
  isEmailVerified: boolean;
  birthday?: Timestamp;
  creationDate: Timestamp;
};
