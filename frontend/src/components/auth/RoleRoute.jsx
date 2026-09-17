import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
export default function RoleRoute({ roles }) {
  const user = useSelector((s) => s.auth.user);
  return roles.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
