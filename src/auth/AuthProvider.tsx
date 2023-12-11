import {
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import toast from "react-hot-toast";
import { redirect } from "react-router-dom";

const AuthContext = createContext<any>(null);
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{} | null>(null);

  const createUserWithEmailPassword = async (
    email: string,
    password: string
  ) => {
    try {
      const newUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (newUser !== null && auth.currentUser !== null) {
        const res = await sendEmailVerification(auth.currentUser);
        if (res !== null) {
          toast.success("Email verification sent!");
          setUser(newUser);
          return auth.currentUser;
        }
      }
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  const loginUserWithEmailPassword = async (
    email: string,
    password: string
  ) => {
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
        toast.success("Logout successfully");
        setUser(null);
      })
      .catch((error) => {
        toast.error(error.message);
        throw new Error(error.message);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
