import { addDoc, collection, deleteDoc, doc, getDocsFromServer } from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { db } from "./databaseConfig";

export type CategoryDoc = { id: string; category: string };

// Categories with their doc IDs (admin page). Everywhere else, getCategories() returns just the names.
export const getCategoryDocs = async (): Promise<CategoryDoc[]> => {
  const snapshot = await getDocsFromServer(collection(db, collectionsList.category));
  return snapshot.docs.map((d) => ({ id: d.id, category: String(d.get("category")) }));
};

export const addCategory = async (name: string) => {
  await addDoc(collection(db, collectionsList.category), { category: name });
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, collectionsList.category, id));
};
