import { PersonalInfoForm } from "../pages/profile/components/PersonalInfo/ModalPersonalInfo";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { collectionsList } from "../../firebaseCollections";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "./databaseConfig";
import { User } from "../types/UserType";

export const updatePersonalUserDetails = async (userUID: string, userDetails: Omit<PersonalInfoForm, "imageURL">) => {
  try {
    const userDocRef = doc(db, collectionsList.users, userUID);
    await updateDoc(userDocRef, {
      ...userDetails,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const saveProfileImage = async (imgFile: any, imageName: string, user: User) => {
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
