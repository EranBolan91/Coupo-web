import { collectionsList } from "../../firebaseCollections";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./databaseConfig";

export const getNotifications = async (userID: string) => {
  try {
    const docRef = doc(db, collectionsList.notifications, userID);
    await getDoc(docRef); // Not implemented yet

    return "";
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
