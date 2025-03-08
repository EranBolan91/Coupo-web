import {
  User,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  ActionCodeSettings,
  getAuth,
} from "firebase/auth";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { getUserDocument } from "../database/users";
import { updatePersonalDocument } from "../database/profile";
import { saveUserToDatabase } from "../database/databaseCalls";
import { useState, createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader from "../components/loader/Loader";

interface AuthProviderProps {
  userDocument: UserDocument | null;
  logout: () => Promise<void>;
  signinWthGoogle: () => Promise<void>;
  sendEmailVerification: (user: User, actionCodeSettings?: ActionCodeSettings | null) => Promise<void>;
  handleUpdateUserDocument: (userDocument: UserDocument) => void;
  loginUserWithEmailPassword: (email: string, password: string) => Promise<AuthMSG>;
  createUserWithEmailPassword: (
    email: string,
    password: string,
    fullName: string,
    birthday: Date
  ) => Promise<null | undefined>;
}

const AuthContext = createContext<AuthProviderProps | undefined>(undefined);
const provider = new GoogleAuthProvider();

export enum AuthMSG {
  VerifyEmailError,
  GlobalError,
  Good,
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const auth = getAuth();

  const { data, isLoading, isSuccess } = useQuery<UserDocument>({
    queryKey: ["UserDocument"],
    queryFn: () => getUserDocument(auth.currentUser?.uid),
    staleTime: Infinity,
  });

  const handleUpdateUserDocument = (userDocument: Partial<UserDocument>) => {
    setUserDocument((prev) => {
      if (prev === null) return null;
      return { ...prev, ...userDocument };
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("user", user);
      if (user) {
        if (user.emailVerified === true) {
          // const resUserDocument: UserDocument = await getUserDocument(user.uid);
          if (data !== undefined) {
            if (data.isEmailVerified === false) {
              updatePersonalDocument({ isEmailVerified: true, userUID: user.uid });
              data.isEmailVerified = true;
            }
            setUserDocument(data);
          }
        }
      } else {
        setUserDocument(null);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSuccess, data]);

  const createUserWithEmailPassword = async (email: string, password: string, fullName: string, birthday: Date) => {
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
          return AuthMSG.Good;
        } else {
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
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        // setUser(user);
        return user;
      })
      .catch((error) => {
        // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log("AuthProvider", credential);
        // ...
        setUserDocument(null);
        return error;
      });
    return res;
  };

  const logout = async () => {
    signOut(auth)
      .then(() => {
        setUserDocument(null);
      })
      .catch((error) => {
        toast.error(error.message);
        throw new Error(error.message);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        userDocument,
        logout,
        signinWthGoogle,
        sendEmailVerification,
        handleUpdateUserDocument,
        loginUserWithEmailPassword,
        createUserWithEmailPassword,
      }}
    >
      {/* {!loading && children} */}
      {isLoading === true ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within an AuthProvider");
  }
  return context;
};
