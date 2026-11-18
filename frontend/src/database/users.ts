import { collectionsList } from "../../firebaseCollections";
import { collection, doc, getDoc, getDocsFromServer } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "./databaseConfig";
import app from "../firebaseConfig";

// Returns undefined when there is no uid or the Users doc doesn't exist yet.
export const getUserDocument = async (
  userUID: string | undefined = getAuth().currentUser?.uid
): Promise<UserDocument | undefined> => {
  if (!userUID) {
    return undefined;
    // throw new Error("User UID is not provided");
  }
  try {
    const ref = doc(db, collectionsList.users, userUID);
    const data = await getDoc(ref);

    return data.data() as UserDocument;
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export type AdminUser = Partial<UserDocument> & { id: string };

// Admin only (Users docs are readable by their owner or an admin). Every Users doc; sorted in the
// browser because older docs may be missing creationDate, and an orderBy would drop them.
export const getAllUsers = async (): Promise<AdminUser[]> => {
  const snapshot = await getDocsFromServer(collection(db, collectionsList.users));
  return snapshot.docs.map((d) => ({ ...(d.data() as Partial<UserDocument>), id: d.id }));
};

// Admin only. Adds a Users doc for every sign-in account (Firebase Auth) that is missing one,
// e.g. Google users who signed up before this was fixed. Returns how many were added.
export const syncUsersFromAuth = async (): Promise<number> => {
  const call = httpsCallable<void, { added: number }>(getFunctions(app), "syncUsersFromAuth");
  return (await call()).data.added;
};
