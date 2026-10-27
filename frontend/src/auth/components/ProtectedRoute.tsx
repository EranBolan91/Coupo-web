import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const userDocument = useCurrentUser();
  if (!userDocument) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
