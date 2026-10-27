import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { UserDocument } from "../types/UserType";

// The signed-in user's Firestore document, or null when nobody is signed in
// (or the user hasn't verified their email yet). Filled by AuthProvider.
export const useCurrentUser = (): UserDocument | null => {
  const profile = useSelector((state: RootState) => state.profile);
  return profile.userUID ? profile : null;
};
