import { Coupon } from "../types/CouponType";

// "today", "yesterday", "3 days ago", "2 weeks ago", "5 months ago".
export const timeAgo = (date: Date, now = new Date()) => {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

// The latest "Did it work?" answer on a coupon, or null if nobody has answered yet.
export const latestResult = (coupon: Partial<Coupon>): { worked: boolean; when: string } | null => {
  const worked = coupon.lastWorkedAt?.toDate?.();
  const failed = coupon.lastFailedAt?.toDate?.();
  if (!worked && !failed) return null;
  if (worked && (!failed || worked >= failed)) return { worked: true, when: timeAgo(worked) };
  return { worked: false, when: timeAgo(failed as Date) };
};

export const resultLabel = (result: { worked: boolean; when: string }) =>
  result.worked ? `Worked ${result.when}` : `Didn't work for someone ${result.when}`;
