import { Coupon } from "../types/CouponType";

export type Sharer = {
  userID: string;
  name: string; // from their newest coupon, since coupons keep the name they were shared under
  coupons: Coupon[]; // newest first
  activeCount: number;
  likes: number;
  dislikes: number;
  firstSharedAt: number; // ms
  rank: number; // 1 = top
};

// Everyone who shared at least one coupon, ranked by likes received, then coupons shared.
// Built only from the public coupon feeds (Users docs are private). Coupons published by
// Coupo itself (no userID) don't count.
export const rankSharers = (coupons: Coupon[], now = Date.now()): Sharer[] => {
  const byUser = new Map<string, Coupon[]>();
  for (const coupon of coupons) {
    if (!coupon.userID) continue;
    const list = byUser.get(coupon.userID) ?? [];
    list.push(coupon);
    byUser.set(coupon.userID, list);
  }

  const created = (c: Coupon) => c.createdAt?.toMillis?.() ?? 0;
  const sharers = [...byUser.entries()].map(([userID, list]) => {
    const sorted = [...list].sort((a, b) => created(b) - created(a));
    return {
      userID,
      name: sorted.find((c) => c.username?.trim())?.username?.trim() || "Coupo member",
      coupons: sorted,
      activeCount: sorted.filter((c) => (c.expiry?.toMillis?.() ?? Infinity) >= now).length,
      likes: sorted.reduce((sum, c) => sum + (c.likes ?? 0), 0),
      dislikes: sorted.reduce((sum, c) => sum + (c.dislikes ?? 0), 0),
      firstSharedAt: Math.min(...sorted.map(created)),
      rank: 0,
    };
  });

  sharers.sort((a, b) => b.likes - a.likes || b.coupons.length - a.coupons.length || a.name.localeCompare(b.name));
  sharers.forEach((sharer, i) => (sharer.rank = i + 1));
  return sharers;
};

// Share of votes that said the code worked, or null when nobody voted yet.
export const workedRate = (sharer: Pick<Sharer, "likes" | "dislikes">) => {
  const votes = sharer.likes + sharer.dislikes;
  return votes === 0 ? null : Math.round((sharer.likes / votes) * 100);
};

export const sharerPath = (userID: string) => `/users/${userID}`;
