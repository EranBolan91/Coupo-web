import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const couponSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  likes: z.number().min(0),
  // "" on link coupons (see dealUrl).
  code: z.string(),
  // Link coupons: the discount applies when you open this link, there is no code. Read it with
  // dealLink (logic/dealLinks.ts), which allows only http(s). Missing on code coupons.
  dealUrl: z.string().optional(),
  imgUrl: z.string().url(),
  username: z.string(),
  category: z.string(),
  userID: z.string().uuid(),
  // Percent off (1-100) for "percent", the amount off for "amount", 0 for "shipping".
  discount: z.number().min(0),
  // Missing on older coupons, which are percent off. Read it with discountTypeOf (logic/discount.ts).
  discountType: z.enum(["percent", "amount", "shipping"]).optional(),
  // ISO code ("USD", "ILS"...) for the amount off and the minimum spend.
  currency: z.string().optional(),
  // Minimum order total for the code to work, in `currency`. null or missing = no minimum.
  minSpend: z.number().positive().nullable().optional(),
  dislikes: z.number().min(0),
  // null = no expiry date (the coupon never expires).
  expiry: z.instanceof(Timestamp).nullable(),
  description: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  type: z.enum(["coupon", "socialCoupon"]),
  // Optional terms (see logic/couponTerms.ts). Older coupons don't have them.
  storeUrl: z.string().optional(),
  // Old free-text minimum order ("$50"). New coupons use minSpend instead.
  minOrder: z.string().optional(),
  usableAt: z.enum(["online", "in-store", "both", ""]).optional(),
  firstOrderOnly: z.boolean().optional(),
  // Set by the vote Cloud Function: last time someone said the code worked (like) or didn't (dislike).
  lastWorkedAt: z.instanceof(Timestamp).optional(),
  lastFailedAt: z.instanceof(Timestamp).optional(),
  // Set by the syncStore Cloud Function on the public copies: the store this coupon belongs to
  // (storeSlug in logic/stores.ts). Store pages query by it.
  storeSlug: z.string().optional(),
  // Set by the copy Cloud Function: how many signed-in people (other than the sharer) copied the code.
  copies: z.number().min(0).optional(),
});

export type Coupon = z.infer<typeof couponSchema>;
