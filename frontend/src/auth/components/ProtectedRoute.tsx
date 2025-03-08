import { UserDocument } from "../../types/UserType";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../AuthProvider";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { userDocument }: { userDocument: UserDocument | null } = UserAuth();
  if (!userDocument) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
