import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../AuthProvider";
import { ReactNode } from "react";

// Admin pages: signed-out users go to /login, signed-in non-admins go home.
// This only hides the pages; firestore.rules and storage.rules enforce the admin check on writes.
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const userDocument = useCurrentUser();
  const { isAdmin } = UserAuth();

  if (!userDocument) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
};

export default AdminRoute;
