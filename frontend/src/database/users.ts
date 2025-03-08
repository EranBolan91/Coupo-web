import { collectionsList } from "../../firebaseCollections";
import { doc, getDoc } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { db } from "./databaseConfig";

export const getUserDocument = async (userUID: string | undefined): Promise<UserDocument> => {
  if (!userUID) {
    throw new Error("User UID is not provided");
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
