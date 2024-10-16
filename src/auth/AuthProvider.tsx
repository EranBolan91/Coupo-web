import { useState, createContext, ReactNode, useContext, useEffect } from "react";
import {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebaseConfig";
import { redirect } from "react-router-dom";
import { saveUserToDatabase } from "../database/databaseCalls";
import { Timestamp } from "firebase/firestore";

const AuthContext = createContext<any>(null);
const provider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if (currentUser?.emailVerified === true) {
        setUser(currentUser);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const createUserWithEmailPassword = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthday: string
  ) => {
    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);

      if (newUser !== null && auth.currentUser !== null) {
        await sendEmailVerification(newUser.user);
        const userEmail = newUser.user.email ?? "";
        const userUID = newUser.user.uid;

        await saveUserToDatabase({
          userUID: userUID,
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          isEmailVerified: newUser.user.emailVerified,
          imageURL: "",
          lastLogin: Timestamp.fromDate(new Date()),
          creationDate: Timestamp.fromDate(new Date()),
          birthday: Timestamp.fromDate(new Date(birthday)),
        });

        toast.success("Email verification sent!");
      } else {
        return null;
      }
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const loginUserWithEmailPassword = async (email: string, password: string) => {
    try {
      const loginUser = await signInWithEmailAndPassword(auth, email, password);
      if (loginUser !== null) {
        setUser(loginUser.user);
        redirect("/profile");
        return loginUser.user;
      }
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const signinWthGoogle = async () => {
    const res = await signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        setUser(user);
        return user;
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        setUser(null);
        return error;
      });
    return res;
  };

  const logout = async () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        toast.error(error.message);
        throw new Error(error.message);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signinWthGoogle,
        createUserWithEmailPassword,
        loginUserWithEmailPassword,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
