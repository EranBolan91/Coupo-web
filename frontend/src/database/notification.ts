import { collectionsList } from "../../firebaseCollections";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./databaseConfig";

export const getNotifications = async (userID: string) => {
  try {
    const docRef = doc(db, collectionsList.notifications, userID);
    const notificationsDoc = await getDoc(docRef);
    const notificationObj = notificationsDoc.data();
    console.log(notificationObj);

    return "";
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
