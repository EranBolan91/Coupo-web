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
import { useDispatch } from "react-redux";
import { Timestamp } from "firebase/firestore";
import { UserDocument } from "../types/UserType";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../components/loader/Loader";
import { getUserDocument } from "../database/users";
import { updatePersonalDocument } from "../database/profile";
import { saveUserToDatabase } from "../database/databaseCalls";
import { clearUserDocument, setUserDocument } from "../redux/reducers/profileReducer";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

interface AuthProviderProps {
  logout: () => Promise<void>;
  signinWthGoogle: () => Promise<void>;
  sendEmailVerification: (user: User, actionCodeSettings?: ActionCodeSettings | null) => Promise<void>;
  // Re-reads Users/{uid} from Firestore into Redux (call after editing the profile).
  refreshUserDocument: () => Promise<void>;
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

// Used when the Users doc doesn't exist yet. For Google sign-ups the doc is
// created by the createNewUserInUsersCollection Cloud Function, which can
// finish after the client is already signed in.
const userDocumentFromAuthUser = (user: User): UserDocument => ({
  userUID: user.uid,
  email: user.email ?? "",
  firstName: user.displayName?.split(" ")[0] ?? "",
  lastName: user.displayName?.split(" ")[1] ?? "",
  imageURL: user.photoURL ?? "",
  isEmailVerified: user.emailVerified,
  lastLogin: Timestamp.now(),
  creationDate: Timestamp.fromDate(new Date(user.metadata.creationTime ?? Date.now())),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authReady, setAuthReady] = useState<boolean>(false);
  const signedInUID = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const auth = getAuth();

  // Loads Users/{uid} into Redux. Users with an unverified email are treated as signed out.
  const loadUserDocument = useCallback(
    async (user: User | null) => {
      if (!user || !user.emailVerified) {
        if (signedInUID.current !== null) {
          // Signed out (or switched account): drop the previous user's cached data.
          queryClient.clear();
        }
        signedInUID.current = null;
        dispatch(clearUserDocument());
        return;
      }

      if (signedInUID.current !== null && signedInUID.current !== user.uid) {
        queryClient.clear();
      }
      signedInUID.current = user.uid;

      try {
        const userDocument = await getUserDocument(user.uid);
        if (userDocument === undefined) {
          dispatch(setUserDocument(userDocumentFromAuthUser(user)));
          return;
        }
        if (userDocument.isEmailVerified === false) {
          updatePersonalDocument({ isEmailVerified: true, userUID: user.uid });
          userDocument.isEmailVerified = true;
        }
        dispatch(setUserDocument(userDocument));
      } catch (error: any) {
        console.log(error.message);
        dispatch(setUserDocument(userDocumentFromAuthUser(user)));
      }
    },
    [dispatch, queryClient]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await loadUserDocument(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [auth, loadUserDocument]);

  const refreshUserDocument = async () => {
    await loadUserDocument(auth.currentUser);
  };

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
          // Load the profile before returning so the caller can navigate to a protected route.
          await loadUserDocument(loginUser.user);
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
      .then(async (result) => {
        const user = result.user;
        await loadUserDocument(user);
        return user;
      })
      .catch((error) => {
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log("AuthProvider", credential);
        return error;
      });
    return res;
  };

  const logout = async () => {
    signOut(auth).catch((error) => {
      toast.error(error.message);
      throw new Error(error.message);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        logout,
        signinWthGoogle,
        sendEmailVerification,
        refreshUserDocument,
        loginUserWithEmailPassword,
        createUserWithEmailPassword,
      }}
    >
      {authReady ? children : <Loader />}
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
