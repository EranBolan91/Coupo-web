import { doc, setDoc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { db } from "./databaseConfig";

export const getNotifications = async (userID: string) => {
  try {
    const docRef = doc(db, collectionsList.notifications, userID);
    const notificationsDoc = await getDoc(docRef);
    const notificationObj = notificationsDoc.data();

    return "";
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
