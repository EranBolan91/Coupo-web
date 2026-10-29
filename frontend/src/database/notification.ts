import { collectionsList } from "../../firebaseCollections";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./databaseConfig";

// notifications/{uid} = { seen: { [notificationKey]: true } }. The notifications themselves are
// worked out in the browser (see hooks/useNotifications); only "already seen" is stored.
export const getSeenNotifications = async (userID: string): Promise<string[]> => {
  const snapshot = await getDoc(doc(db, collectionsList.notifications, userID));
  return Object.keys(snapshot.get("seen") ?? {});
};

// Replaces the list with the keys of the current notifications, so it never grows past them.
export const saveSeenNotifications = async (userID: string, keys: string[]) => {
  const seen = Object.fromEntries(keys.slice(0, 200).map((key) => [key, true]));
  await setDoc(doc(db, collectionsList.notifications, userID), { seen });
};
