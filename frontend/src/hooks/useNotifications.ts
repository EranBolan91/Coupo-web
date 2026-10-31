import { getSeenNotifications, saveSeenNotifications } from "../database/notification";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserWishlistCoupons } from "../logic/logic";
import { getUserCoupons } from "../database/databaseCalls";
import { impactSentence } from "../logic/points";
import { couponPath } from "../logic/couponLinks";
import { UserAuth } from "../auth/AuthProvider";
import { useCurrentUser } from "./useCurrentUser";
import { Coupon } from "../types/CouponType";
import { useCallback, useMemo } from "react";
import useReports from "./useReports";

export type AppNotification = {
  key: string; // stable ID, stored once seen
  title: string;
  text: string;
  href: string;
  kind: "expiring" | "reports" | "impact";
};

const DAY = 24 * 60 * 60 * 1000;
const EXPIRING_WITHIN_DAYS = 3;

// Calendar days from today until the coupon's expiry day (0 = today).
const daysLeft = (expiry: Date, now: Date) => {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(expiry) - startOfDay(now)) / DAY);
};

// A sharer hears about a coupon's impact each time it passes one of these numbers.
const COPY_MILESTONES = [5, 10, 25, 50, 100, 250, 500, 1000];
const WORKED_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
const level = (value: number, milestones: number[]) => milestones.filter((m) => value >= m).length;
const MAX_IMPACT_NOTES = 5;

const brand = (name: string) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : "");

const expiresText = (days: number) => (days <= 0 ? "expires today" : days === 1 ? "expires tomorrow" : `expires in ${days} days`);

// Notifications are worked out from data the app already has: saved coupons that expire within
// 3 days, and (for admins) coupons with open reports. Only "seen" is stored, in notifications/{uid}.
const useNotifications = () => {
  const userDocument = useCurrentUser();
  const uid = userDocument?.userUID;
  const { isAdmin } = UserAuth();
  const queryClient = useQueryClient();

  // Same key and function as the Saved tab on the profile, so they share one cache.
  const saved = useQuery<Coupon[]>({
    queryKey: ["userWishlist"],
    queryFn: () => getUserWishlistCoupons(uid ?? ""),
    enabled: !!uid,
  });
  // Same key and function as the My coupons tab.
  const mine = useQuery<Coupon[]>({
    queryKey: ["usercoupons"],
    queryFn: () => getUserCoupons(uid ?? ""),
    enabled: !!uid,
  });
  const reports = useReports(!!uid && isAdmin);
  const seen = useQuery({
    queryKey: ["seenNotifications", uid],
    queryFn: () => getSeenNotifications(uid as string),
    enabled: !!uid,
  });

  const items = useMemo<AppNotification[]>(() => {
    if (!uid) return [];
    const now = new Date();
    const list: AppNotification[] = [];

    if (isAdmin && reports.data?.length) {
      const reported = new Set(reports.data.map((r) => r.couponID)).size;
      const newest = reports.data[0]?.createdAt?.toMillis?.() ?? 0;
      list.push({
        key: `reports-${reports.data.length}-${newest}`,
        kind: "reports",
        title: reported === 1 ? "1 coupon was reported" : `${reported} coupons were reported`,
        text: "Check them on the Reports page.",
        href: "/admin/reports",
      });
    }

    (saved.data ?? [])
      .map((coupon) => ({ coupon, expiry: coupon.expiry?.toDate?.() }))
      .filter(({ expiry }) => expiry && expiry.getTime() >= now.getTime() && expiry.getTime() - now.getTime() <= EXPIRING_WITHIN_DAYS * DAY)
      .sort((a, b) => a.expiry!.getTime() - b.expiry!.getTime())
      .forEach(({ coupon, expiry }) =>
        list.push({
          key: `expiring-${coupon.id}`,
          kind: "expiring",
          title: `Your saved ${brand(coupon.name)} coupon ${expiresText(daysLeft(expiry!, now))}`,
          text: `${coupon.discount}% off with ${coupon.code}. Use it before it's gone.`,
          href: couponPath(coupon),
        })
      );

    // "Your Zara code was copied 34 times and worked for 12 people." The key changes when a coupon
    // passes the next milestone, so the note comes back as unseen.
    (mine.data ?? [])
      .map((coupon) => ({ coupon, copies: level(coupon.copies ?? 0, COPY_MILESTONES), worked: level(coupon.likes ?? 0, WORKED_MILESTONES) }))
      .filter(({ copies, worked }) => copies + worked > 0)
      .sort((a, b) => b.copies + b.worked - (a.copies + a.worked))
      .slice(0, MAX_IMPACT_NOTES)
      .forEach(({ coupon, copies, worked }) =>
        list.push({
          key: `impact-${coupon.id}-${copies}-${worked}`,
          kind: "impact",
          title: `Your ${brand(coupon.name)} code is helping people`,
          text: impactSentence(coupon),
          href: "/profile",
        })
      );

    return list;
  }, [uid, isAdmin, reports.data, saved.data, mine.data]);

  const seenKeys = useMemo(() => new Set(seen.data ?? []), [seen.data]);
  const unseenCount = items.filter((item) => !seenKeys.has(item.key)).length;

  // Marks everything currently listed as seen. Stores only current keys, so the list stays small.
  const markAllSeen = useCallback(async () => {
    if (!uid || unseenCount === 0) return;
    const keys = items.map((item) => item.key);
    queryClient.setQueryData(["seenNotifications", uid], keys);
    try {
      await saveSeenNotifications(uid, keys);
    } catch {
      queryClient.invalidateQueries({ queryKey: ["seenNotifications", uid] });
    }
  }, [uid, unseenCount, items, queryClient]);

  return { items, unseenCount, seenKeys, markAllSeen };
};

export default useNotifications;
