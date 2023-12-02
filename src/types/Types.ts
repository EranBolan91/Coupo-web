type Coupon = {
  name: string;
  description: string;
  imgUrl: string;
  code: string;
  category: string;
  expiry: Date;
  discount: string;
  createdAt: Date;
  updatedAt: Date;
};

type CouponBrand = {
  brand: string;
  imgURL: string;
};

export type { Coupon, CouponBrand };
