import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUserRole } from "../auth";

export default function AddRoleRoute({ role, children }) {
  const token = getToken();
  const userRole = getUserRole();
  const location = useLocation();
  const isRegisterPage =
    location.pathname === "/student/register" || location.pathname === "/tutor/register";

  if (!token && isRegisterPage) {
    return children; // allow unauthenticated access
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}
