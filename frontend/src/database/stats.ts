import { collection, getCountFromServer, query, Timestamp, where } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { db } from "./databaseConfig";

// Admin only (Users docs are readable by their owner or an admin). Counts Users docs, which
// every signed-up account has once it has logged in or saved its profile.
export const getUserCounts = async (since: Date) => {
  const users = collection(db, collectionsList.users);
  const [total, recent] = await Promise.all([
    getCountFromServer(users),
    getCountFromServer(query(users, where("creationDate", ">=", Timestamp.fromDate(since)))),
  ]);
  return { total: total.data().count, recent: recent.data().count };
};
