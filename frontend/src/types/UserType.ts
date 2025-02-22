import { Timestamp } from "firebase/firestore";
import { z } from "zod";

const userSchema = z.object({
  userUID: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  imageURL: z.string().url(),
  isEmailVerified: z.boolean(),
  birthday: z.instanceof(Timestamp).optional(),
  lastLogin: z.instanceof(Timestamp),
  creationDate: z.instanceof(Timestamp),
});

export type User = z.infer<typeof userSchema>;
