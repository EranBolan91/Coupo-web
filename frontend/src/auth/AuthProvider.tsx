import { useState, createContext, ReactNode, useContext, useEffect } from "react";
import {
  User,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebaseConfig";
import { redirect } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { saveUserToDatabase } from "../database/databaseCalls";

const AuthContext = createContext<any>(null);
const provider = new GoogleAuthProvider();

export enum AuthMSG {
  VerifyEmailError,
  GlobalError,
  Good,
}

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
    fullName: string,
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
          firstName: fullName.split(" ")[0],
          lastName: fullName.split(" ")[1],
          email: userEmail,
          isEmailVerified: newUser.user.emailVerified,
          imageURL: "",
          lastLogin: Timestamp.fromDate(new Date()),
          creationDate: Timestamp.fromDate(new Date()),
          birthday: Timestamp.fromDate(new Date(birthday)),
        });

        setUser(newUser.user);
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
        if (loginUser.user.emailVerified === true) {
          setUser(loginUser.user);
          redirect("/profile");
          return AuthMSG.Good;
        } else {
          setUser(loginUser.user);
          return AuthMSG.VerifyEmailError;
        }
      } else {
        return AuthMSG.GlobalError;
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
        console.log("AuthProvider", credential);
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
        logout,
        signinWthGoogle,
        sendEmailVerification,
        loginUserWithEmailPassword,
        createUserWithEmailPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
