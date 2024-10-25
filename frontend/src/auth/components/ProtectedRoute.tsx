import { ReactNode } from "react";
import { UserAuth } from "../AuthProvider";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user }: any = UserAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
