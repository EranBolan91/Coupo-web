import { collection, doc, getDocFromServer, getDocsFromServer, limit, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { monthKey, SharerStats } from "../logic/points";
import { db } from "./databaseConfig";

// UserCopies/{uid}/coupons/{couponId}: "this user copied this code". The rules allow it once per person
// per coupon; a Cloud Function then counts it on the coupon and gives the sharer a point.
// Copying again fails on the rules (the doc exists), which is fine, so errors are ignored.
const recorded = new Set<string>();
export const recordCopy = (userID: string, couponID: string) => {
  const key = `${userID}/${couponID}`;
  if (recorded.has(key)) return;
  recorded.add(key);
  setDoc(doc(db, collectionsList.userCopies, userID, "coupons", couponID), { copiedAt: serverTimestamp() }).catch(() => {});
};

const toStats = (userID: string, data: Record<string, unknown>): SharerStats => ({
  userID,
  name: typeof data.name === "string" && data.name ? data.name : "Coupo member",
  points: Number(data.points) || 0,
  copies: Number(data.copies) || 0,
  worked: Number(data.worked) || 0,
  month: typeof data.month === "string" ? data.month : "",
  monthPoints: Number(data.monthPoints) || 0,
  monthCopies: Number(data.monthCopies) || 0,
  monthWorked: Number(data.monthWorked) || 0,
});

// SharerStats/{uid}, written only by Cloud Functions. null when the user has no points yet.
export const getSharerStats = async (userID: string): Promise<SharerStats | null> => {
  const snapshot = await getDocFromServer(doc(db, collectionsList.sharerStats, userID));
  return snapshot.exists() ? toStats(userID, snapshot.data()) : null;
};

// Everyone with points this month, most first (needs the SharerStats month + monthPoints index).
export const getMonthLeaderboard = async (max = 50): Promise<SharerStats[]> => {
  const snapshot = await getDocsFromServer(
    query(collection(db, collectionsList.sharerStats), where("month", "==", monthKey()), orderBy("monthPoints", "desc"), limit(max))
  );
  return snapshot.docs.map((d) => toStats(d.id, d.data())).filter((s) => s.monthPoints > 0);
};
