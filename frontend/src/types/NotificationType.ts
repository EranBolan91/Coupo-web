import { z } from "zod";

const notificationSchema = z.object({
  content: z.string(),
  isRead: z.boolean(),
});

export type Notification = z.infer<typeof notificationSchema>;
