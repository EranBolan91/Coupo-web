import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDocument } from "../../types/UserType";
import { Timestamp } from "firebase/firestore";

// An empty userUID means "no signed-in user". Read it through hooks/useCurrentUser.
const initState: UserDocument = {
  userUID: "",
  email: "",
  firstName: "",
  lastName: "",
  imageURL: "",
  isEmailVerified: false,
  lastLogin: new Timestamp(0, 0),
  creationDate: new Timestamp(0, 0),
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: initState,
  reducers: {
    setUserDocument: (_state, action: PayloadAction<UserDocument>) => action.payload,
    clearUserDocument: () => initState,
  },
});

export const { setUserDocument, clearUserDocument } = userProfileSlice.actions;
export default userProfileSlice.reducer;
