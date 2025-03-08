import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDocument } from "../../types/UserType";
import { Timestamp } from "firebase/firestore";

const initState: UserDocument = {
  userUID: "",
  email: "",
  firstName: "",
  lastName: "",
  imageURL: "",
  isEmailVerified: false,
  lastLogin: new Timestamp(22222, 2233),
  creationDate: new Timestamp(2222, 11),
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: initState,
  reducers: {
    setUserDocument: (state, action: PayloadAction<UserDocument>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUserDocument } = userProfileSlice.actions;
export default userProfileSlice.reducer;
