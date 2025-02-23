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
});

export type Coupon = z.infer<typeof couponSchema>;
