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
};

export type { Coupon };
