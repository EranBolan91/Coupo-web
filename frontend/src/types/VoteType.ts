import { couponSchema } from "./CouponType";
import { z } from "zod";

const voteSchema = z.object({
  likes: z.array(couponSchema),
  dislikes: z.array(couponSchema),
});

export type Vote = z.infer<typeof voteSchema>;
