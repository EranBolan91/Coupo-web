import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { Coupon } from "../types/CouponType";
import { db } from "./databaseConfig";

export const reportReasons = [
  { value: "not-working", label: "The code doesn't work" },
  { value: "expired", label: "It has expired" },
  { value: "spam", label: "Spam or misleading" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof reportReasons)[number]["value"];

export type Report = {
  id: string;
  couponID: string;
  couponType: Coupon["type"];
  reason: ReportReason;
  details: string;
  reporterUID: string;
  createdAt: Timestamp;
};

// Reports/{couponId}_{uid}: the ID makes it one report per user per coupon (firestore.rules checks it).
const reportID = (couponID: string, userID: string) => `${couponID}_${userID}`;

export const reportCoupon = async (coupon: Coupon, userID: string, reason: ReportReason, details: string) => {
  await setDoc(doc(db, collectionsList.reports, reportID(coupon.id, userID)), {
    couponID: coupon.id,
    couponType: coupon.type ?? "coupon",
    reason,
    details: details.trim().slice(0, 500),
    reporterUID: userID,
    createdAt: serverTimestamp(),
  });
};

export const hasReported = async (couponID: string, userID: string) =>
  (await getDoc(doc(db, collectionsList.reports, reportID(couponID, userID)))).exists();

// Admin only.
export const getReports = async (): Promise<Report[]> => {
  const snapshot = await getDocsFromServer(query(collection(db, collectionsList.reports), orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Report));
};

// Admin only: removes every report about one coupon (after fixing or deleting it, or when they were wrong).
export const dismissReports = async (couponID: string) => {
  const snapshot = await getDocsFromServer(query(collection(db, collectionsList.reports), where("couponID", "==", couponID)));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

export const deleteReport = (id: string) => deleteDoc(doc(db, collectionsList.reports, id));
