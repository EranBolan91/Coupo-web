import { addDoc, collection, getDocsFromServer, limit, orderBy, query, serverTimestamp, Timestamp, where } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { db } from "./databaseConfig";

// Searches/{autoId}: one doc per search someone ran on the Coupons or Social Coupons page, so the
// admin analytics page can show what people look for and what they don't find. Anyone (even signed
// out) can add one; only admins can read them (firestore.rules checks the fields).
export type SearchPage = "coupons" | "social";

export type SearchLog = {
  term: string;
  // How many live (not expired) coupons matched the search text when it was run.
  results: number;
  page: SearchPage;
  createdAt: Timestamp;
};

export const MAX_TERM_LENGTH = 60;
export const SEARCH_LOG_LIMIT = 5000;

// "  Nike   Shoes " -> "nike shoes", so the same search is counted together.
export const normalizeTerm = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_TERM_LENGTH);

export const logSearch = (term: string, results: number, page: SearchPage) =>
  addDoc(collection(db, collectionsList.searches), {
    term: normalizeTerm(term),
    results: Math.min(Math.max(0, Math.floor(results)), 100000),
    page,
    createdAt: serverTimestamp(),
  });

// Admin only: the newest searches since `since` (at most SEARCH_LOG_LIMIT).
export const getSearches = async (since: Date): Promise<SearchLog[]> => {
  const snapshot = await getDocsFromServer(
    query(
      collection(db, collectionsList.searches),
      where("createdAt", ">=", Timestamp.fromDate(since)),
      orderBy("createdAt", "desc"),
      limit(SEARCH_LOG_LIMIT)
    )
  );
  return snapshot.docs.map((d) => d.data() as SearchLog);
};
