import { z } from "zod";

const couponBrandSchema = z.object({
  brand: z.string(),
  imgURL: z.string().url(),
});

export type CouponBrand = z.infer<typeof couponBrandSchema>;
