// Points for sharers, kept in SharerStats/{uid} (world-readable, written only by Cloud Functions).
// Points come from what other people do with a sharer's codes, not from posting, so spam doesn't pay:
// someone else copies the code (+1, once per person per coupon) or says it worked (+5, taken back if
// they remove that vote).

export const POINTS = {copy: 1, worked: 5};

export type SharerStats = {
  name: string;
  points: number; // all time
  copies: number; // all time, people other than the sharer
  worked: number; // all time, "it worked" votes currently standing
  month: string; // "YYYY-MM" (UTC) that the month* fields belong to
  monthPoints: number;
  monthCopies: number;
  monthWorked: number;
};

export type StatsChange = {copies?: number; worked?: number};

// UTC month key, the same one the leaderboard query uses in the browser.
export const monthKey = (date: Date) => date.toISOString().slice(0, 7);

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const atLeastZero = (value: number) => Math.max(0, value);

// The SharerStats doc after a change. Month counters start again from 0 in a new month.
// Nothing goes below 0 (e.g. a "worked" vote from last month taken back this month).
export const applyChange = (
  current: Record<string, unknown> | undefined,
  change: StatsChange,
  now: Date,
  name?: string
): SharerStats => {
  const copies = change.copies ?? 0;
  const worked = change.worked ?? 0;
  const points = copies * POINTS.copy + worked * POINTS.worked;
  const month = monthKey(now);
  const sameMonth = current?.month === month;
  const storedName = typeof current?.name === "string" ? current.name : "";

  return {
    name: name?.trim() || storedName || "Coupo member",
    points: atLeastZero(num(current?.points) + points),
    copies: atLeastZero(num(current?.copies) + copies),
    worked: atLeastZero(num(current?.worked) + worked),
    month,
    monthPoints: atLeastZero((sameMonth ? num(current?.monthPoints) : 0) + points),
    monthCopies: atLeastZero((sameMonth ? num(current?.monthCopies) : 0) + copies),
    monthWorked: atLeastZero((sameMonth ? num(current?.monthWorked) : 0) + worked),
  };
};
