import { Routes, Route, Outlet } from "react-router-dom";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PostJobPage from "./pages/PostJobPage";
import ManageJobsPage from "./pages/ManageJobsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardShell from "./components/dashboard/DashboardShell";
import RoleRoute from "./components/auth/RoleRoute";
function Layout() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
      <SiteHeader />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route element={<RoleRoute roles={["recruiter"]} />}>
              <Route path="/post-job" element={<PostJobPage />} />
              <Route path="/manage-jobs" element={<ManageJobsPage />} />
              <Route path="/post-job/:id" element={<PostJobPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
