import {
  User,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
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
  // True when the signed-in user has the `admin` custom claim (granted with functions/scripts/setAdmin.js).
  isAdmin: boolean;
  logout: () => Promise<void>;
  signinWthGoogle: () => Promise<void>;
  sendEmailVerification: (user: User, actionCodeSettings?: ActionCodeSettings | null) => Promise<void>;
  // Sends Firebase's password-reset email.
  resetPassword: (email: string) => Promise<void>;
  // True when the signed-in user can sign in with email + password (Google-only accounts can't).
  hasPassword: () => boolean;
  // Checks the current password, then sets the new one. Throws a FirebaseError (e.g. auth/invalid-credential).
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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
        setIsAdmin(false);
        dispatch(clearUserDocument());
        return;
      }

      if (signedInUID.current !== null && signedInUID.current !== user.uid) {
        queryClient.clear();
      }
      signedInUID.current = user.uid;

      try {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } catch {
        setIsAdmin(false);
      }

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

  // After setting a new password, Firebase's page shows a "Continue" button back to the login page.
  const resetPassword = (email: string) =>
    sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });

  const hasPassword = () =>
    auth.currentUser?.providerData.some((provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID) ?? false;

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("Not signed in");
    // Firebase only allows a password change right after signing in, so confirm the current password first.
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
  };

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
    try {
      const result = await signInWithPopup(auth, provider);
      await loadUserDocument(result.user);
    } catch (error: any) {
      // Log the code (e.g. auth/unauthorized-domain) and let the caller show it.
      console.error("Google sign-in failed:", error?.code, error);
      throw error;
    }
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
        isAdmin,
        logout,
        signinWthGoogle,
        sendEmailVerification,
        refreshUserDocument,
        resetPassword,
        hasPassword,
        changePassword,
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
