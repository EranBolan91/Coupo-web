import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import app from "../firebaseConfig";

// Initialize Firebase
export const db = getFirestore(app);
export const storage = getStorage();
