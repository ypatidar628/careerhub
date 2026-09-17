import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
export default function ProtectedRoute() {
  return useSelector((s) => s.auth.user) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth" replace />
  );
}
