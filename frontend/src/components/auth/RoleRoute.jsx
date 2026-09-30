import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ roles = [] }) {
  const user = useSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = String(user.role || "").toUpperCase();
  const normalizedAllowed = roles.map((r) => String(r).toUpperCase());

  // Super Admin has access to all Admin routes
  const hasAccess =
    userRole === "SUPER_ADMIN" ||
    normalizedAllowed.includes(userRole) ||
    (normalizedAllowed.includes("ADMIN") && userRole === "SUPER_ADMIN");

  return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
