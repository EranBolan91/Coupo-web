// Sharer points and badges. Points are counted by Cloud Functions (functions/src/sharerPoints.ts) and
// stored in SharerStats/{uid}; badges are worked out here from those numbers and the sharer's coupons.

export const POINTS = { copy: 1, worked: 5 };

export type SharerStats = {
  userID: string;
  name: string;
  points: number; // all time
  copies: number;
  worked: number;
  month: string; // "YYYY-MM" (UTC) the month* fields belong to
  monthPoints: number;
  monthCopies: number;
  monthWorked: number;
};

// UTC, the same month key the Cloud Functions use.
export const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

export const monthName = (date = new Date()) => date.toLocaleDateString(undefined, { month: "long", timeZone: "UTC" });

// This month's numbers, or 0 when the stats were last touched in an earlier month.
export const thisMonth = (stats: SharerStats | null | undefined) => {
  const current = !!stats && stats.month === monthKey();
  return {
    points: current ? stats.monthPoints : 0,
    copies: current ? stats.monthCopies : 0,
    worked: current ? stats.monthWorked : 0,
  };
};

export type BadgeInput = {
  couponsShared: number;
  copies: number; // all time
  worked: number; // "it worked" votes
  failed: number; // "didn't work" votes
  monthRank?: number; // place on this month's leaderboard
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress: number; // 0..1 towards earning it
  hint: string; // what's left, for badges not earned yet
};

const ratio = (value: number, goal: number) => Math.min(1, value / goal);
const left = (value: number, goal: number, what: string) => `${Math.max(0, goal - value)} more ${what}`;

export const badges = ({ couponsShared, copies, worked, failed, monthRank }: BadgeInput): Badge[] => {
  const votes = worked + failed;
  const rate = votes === 0 ? 0 : worked / votes;
  const list: Omit<Badge, "earned">[] = [
    {
      id: "first-share",
      name: "First share",
      description: "Shared a first coupon.",
      progress: ratio(couponsShared, 1),
      hint: "Share a coupon",
    },
    {
      id: "helper",
      name: "Helper",
      description: "A code of theirs worked for someone.",
      progress: ratio(worked, 1),
      hint: "Get your first \"it worked\"",
    },
    {
      id: "crowd-pleaser",
      name: "Crowd pleaser",
      description: "Codes copied 50 times.",
      progress: ratio(copies, 50),
      hint: left(copies, 50, "copies"),
    },
    {
      id: "money-saver",
      name: "Money saver",
      description: "Codes worked for 25 people.",
      progress: ratio(worked, 25),
      hint: left(worked, 25, "\"it worked\" votes"),
    },
    {
      id: "trusted",
      name: "Trusted sharer",
      description: "At least 80% said it worked, from 10 or more answers.",
      progress: votes >= 10 ? (rate >= 0.8 ? 1 : rate) : ratio(votes, 10) * 0.8,
      hint: votes >= 10 ? "Over 80% saying it worked" : left(votes, 10, "answers to \"Did it work?\""),
    },
    {
      id: "top-three",
      name: "Top 3 this month",
      description: "On this month's podium.",
      progress: monthRank && monthRank <= 3 ? 1 : 0,
      hint: "Reach the top 3 this month",
    },
  ];
  return list.map((badge) => ({ ...badge, earned: badge.progress >= 1 }));
};

const times = (n: number) => (n === 1 ? "once" : `${n} times`);
const people = (n: number) => (n === 1 ? "1 person" : `${n} people`);

// "Copied 34 times and worked for 12 people."
export const impactSentence = (coupon: { copies?: number; likes?: number }) => {
  const copies = coupon.copies ?? 0;
  const worked = coupon.likes ?? 0;
  if (copies === 0 && worked === 0) return "Nobody has used it yet.";
  if (worked === 0) return `Copied ${times(copies)}.`;
  if (copies === 0) return `Worked for ${people(worked)}.`;
  return `Copied ${times(copies)} and worked for ${people(worked)}.`;
};
