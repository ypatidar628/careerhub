import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation, Navigate } from "react-router-dom";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PostJobPage from "./pages/PostJobPage";
import ManageJobsPage from "./pages/ManageJobsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardShell from "./components/dashboard/DashboardShell";
import RoleRoute from "./components/auth/RoleRoute";

// Super Admin & Admin Portal Imports
import SuperAdminLayout from "./components/super-admin/SuperAdminLayout";
import SuperAdminDashboardPage from "./pages/super-admin/SuperAdminDashboardPage";
import SuperAdminUsersPage from "./pages/super-admin/SuperAdminUsersPage";
import SuperAdminAdminsPage from "./pages/super-admin/SuperAdminAdminsPage";
import SuperAdminCandidatesPage from "./pages/super-admin/SuperAdminCandidatesPage";
import SuperAdminRecruitersPage from "./pages/super-admin/SuperAdminRecruitersPage";
import SuperAdminJobsPage from "./pages/super-admin/SuperAdminJobsPage";
import SuperAdminApplicationsPage from "./pages/super-admin/SuperAdminApplicationsPage";

function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // slight delay to allow smooth dom rendering if page transition happened
      const timer = setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-slate-50/50 text-slate-800 transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
      <SiteHeader />
      <div key={location.pathname} className="page-transition min-w-0 flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Super Admin & Admin System Workspace (Dedicated layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={["ADMIN", "SUPER_ADMIN"]} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route element={<RoleRoute roles={["SUPER_ADMIN"]} />}>
              <Route path="admins" element={<SuperAdminAdminsPage />} />
            </Route>
            <Route path="candidates" element={<SuperAdminCandidatesPage />} />
            <Route path="recruiters" element={<SuperAdminRecruitersPage />} />
            <Route path="jobs" element={<SuperAdminJobsPage />} />
            <Route path="applications" element={<SuperAdminApplicationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Main CareerHub Web App */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route element={<RoleRoute roles={["RECRUITER", "recruiter"]} />}>
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
