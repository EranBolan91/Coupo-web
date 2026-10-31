import { collectionsList } from "../../firebaseCollections";
import { collection, doc, getDoc, getDocsFromServer } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { getAuth } from "firebase/auth";
import { db } from "./databaseConfig";

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
