import { addDoc, collection, deleteDoc, doc, getDocsFromServer, limit, orderBy, query, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { db } from "./databaseConfig";

// Feedback/{autoId}: one message from the Feedback page. Anyone (even signed out) can send one;
// only admins can read, mark as handled or delete them (firestore.rules checks the fields).
export const feedbackTypes = [
  { value: "idea", label: "Idea for improvement" },
  { value: "missing", label: "Something missing" },
  { value: "bug", label: "Something's broken" },
  { value: "contact", label: "Contact us" },
] as const;

export type FeedbackType = (typeof feedbackTypes)[number]["value"];

export type Feedback = {
  id: string;
  type: FeedbackType;
  message: string;
  // "" when they didn't leave one.
  email: string;
  // The page they were on before opening the Feedback page ("" when unknown).
  page: string;
  // The sender's uid when signed in, otherwise null.
  uid: string | null;
  handled: boolean;
  createdAt: Timestamp;
};

export const MIN_MESSAGE = 5;
export const MAX_MESSAGE = 2000;
export const MAX_EMAIL = 200;
export const FEEDBACK_LIMIT = 1000;

export const isValidEmail = (email: string) => /^[^@\s]+@[^@\s]+[.][^@\s]+$/.test(email);

export const sendFeedback = (input: { type: FeedbackType; message: string; email: string; page: string; uid: string | null }) =>
  addDoc(collection(db, collectionsList.feedback), {
    type: input.type,
    message: input.message.trim().slice(0, MAX_MESSAGE),
    email: input.email.trim().slice(0, MAX_EMAIL),
    page: input.page.slice(0, 200),
    uid: input.uid,
    handled: false,
    createdAt: serverTimestamp(),
  });

// Admin only: the newest messages (at most FEEDBACK_LIMIT).
export const getFeedback = async (): Promise<Feedback[]> => {
  const snapshot = await getDocsFromServer(
    query(collection(db, collectionsList.feedback), orderBy("createdAt", "desc"), limit(FEEDBACK_LIMIT))
  );
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Feedback));
};

export const setFeedbackHandled = (id: string, handled: boolean) =>
  updateDoc(doc(db, collectionsList.feedback, id), { handled });

export const deleteFeedback = (id: string) => deleteDoc(doc(db, collectionsList.feedback, id));
