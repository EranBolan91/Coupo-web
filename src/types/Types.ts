type Coupon = {
  id: string;
  name: string;
  description: string;
  imgUrl: string;
  code: string;
  category: string;
  expiry: Date;
  discount: string;
  createdAt: Date;
  updatedAt: Date;
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
  lastLogin: string;
  imageURL: string;
  isEmailVerified: boolean;
};

export type { Coupon, CouponBrand, CurrentUser };
