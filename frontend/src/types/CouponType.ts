import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const couponSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  likes: z.number().min(0),
  code: z.string(),
  imgUrl: z.string().url(),
  username: z.string(),
  category: z.string(),
  userID: z.string().uuid(),
  discount: z.number().min(1).max(100),
  dislikes: z.number().min(0),
  expiry: z.instanceof(Timestamp),
  description: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  type: z.enum(["coupon", "socialCoupon"]),
  // Optional terms (see logic/couponTerms.ts). Older coupons don't have them.
  storeUrl: z.string().optional(),
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
