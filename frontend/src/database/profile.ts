import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collectionsList } from "../../firebaseCollections";
import { doc, setDoc } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { db, storage } from "./databaseConfig";

// Saves fields of the user's own Users/{uid} doc. Uses set + merge, not update, so it also creates the
// doc when it's missing (some older accounts never got one). The rules require userUID in the doc.
export const updatePersonalDocument = async (fields: Partial<UserDocument> & { userUID: string }) => {
  // Firestore rejects undefined values; leave those fields as they are.
  const defined = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  await setDoc(doc(db, collectionsList.users, fields.userUID), defined, { merge: true });
};

export const maxProfileImageBytes = 5 * 1024 * 1024; // same limit as storage.rules

// Uploads the profile picture to ProfileImage/{uid}/profile.svg (always this name, whatever the type)
// and saves its URL on the user's doc. Returns the URL.
export const saveProfileImage = async (file: File, userUID: string) => {
  const storageRef = ref(storage, `ProfileImage/${userUID}/profile.svg`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  // The file name never changes, so add a version to the URL or browsers keep showing the old picture.
  const imageURL = `${await getDownloadURL(storageRef)}&v=${Date.now()}`;
  await updatePersonalDocument({ userUID, imageURL });
  return imageURL;
};
