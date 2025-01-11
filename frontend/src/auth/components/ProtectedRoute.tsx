import { Navigate } from "react-router-dom";
import { UserAuth } from "../AuthProvider";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user }: any = UserAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
