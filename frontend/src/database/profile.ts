import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { collectionsList } from "../../firebaseCollections";
import { doc, updateDoc } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { db, storage } from "./databaseConfig";

type UserDocumentWithoutImage = Omit<UserDocument, "imageURL">;

export const updatePersonalDocument = async (userDocument: Partial<UserDocumentWithoutImage>) => {
  try {
    const userDocRef = doc(db, collectionsList.users, userDocument.userUID!);
    await updateDoc(userDocRef, {
      ...userDocument,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const saveProfileImage = async (imgFile: any, imageName: string, user: UserDocument) => {
  try {
    const storageRef = ref(storage, `ProfileImage/${user.userUID}/${imageName}.svg`);
    const uploadTask = uploadBytesResumable(storageRef, imgFile);
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => console.log(error),
      async () => {
        const downloadImgURL = await getDownloadURL(uploadTask.snapshot.ref);
        updateDoc(doc(db, `Users/${user.userUID}`), { imageURL: downloadImgURL }).catch((err) => {
          throw new Error(err);
        });
      }
    );
  } catch (error: any) {
    throw new Error(error);
  }
};
