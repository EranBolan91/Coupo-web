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
} from "firebase/auth";
import toast from "react-hot-toast";

const AuthContext = createContext<any>(null);
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{} | null>(null);

  const createUserWithEmailPassword = async (
    email: string,
    password: string
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log(res);
    // .then((userCredential) => {

    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  };

  const SigninWthGoogle = async () => {
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
    console.log(res);
    return res;
  };

  const Logout = async () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, SigninWthGoogle, createUserWithEmailPassword, Logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
