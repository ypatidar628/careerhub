import { Router } from "express";
import {
  requireAuth,
  requireSuperAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getCandidates,
  getRecruiters,
  getAllJobs,
  deleteJobByAdmin,
  getAllApplications,
  updateApplicationStatusByAdmin,
  getActivityLogs,
} from "../controllers/superAdminController.js";

const router = Router();

// Apply auth to all super-admin / admin routes
router.use(requireAuth);

// 1. Dashboard Overview Stats (Super Admin & Admin)
router.get("/stats", requireAdminOrSuperAdmin, getDashboardStats);
router.get("/activity", requireAdminOrSuperAdmin, getActivityLogs);

// 2. Admins Management (SUPER ADMIN ONLY)
router.get("/admins", requireSuperAdmin, getAdmins);
router.post("/admins", requireSuperAdmin, createAdmin);
router.patch("/admins/:id", requireSuperAdmin, updateAdmin);
router.patch("/admins/:id/status", requireSuperAdmin, toggleUserStatus);
router.delete("/admins/:id", requireSuperAdmin, deleteAdmin);

// 3. User Management (Super Admin & Authorized Admins)
router.get("/users", requireAdminOrSuperAdmin, getAllUsers);
router.get("/users/:id", requireAdminOrSuperAdmin, getUserById);
router.post("/users", requireAdminOrSuperAdmin, createUser);
router.patch("/users/:id", requireAdminOrSuperAdmin, updateUser);
router.patch("/users/:id/status", requireAdminOrSuperAdmin, toggleUserStatus);
router.delete("/users/:id", requireAdminOrSuperAdmin, deleteUser);

// 4. Candidates Management (Super Admin & Authorized Admins)
router.get("/candidates", requireAdminOrSuperAdmin, getCandidates);

// 5. Recruiters Management (Super Admin & Authorized Admins)
router.get("/recruiters", requireAdminOrSuperAdmin, getRecruiters);

// 6. Platform Jobs Management (Super Admin & Authorized Admins)
router.get("/jobs", requireAdminOrSuperAdmin, getAllJobs);
router.delete("/jobs/:id", requireAdminOrSuperAdmin, deleteJobByAdmin);

// 7. Platform Applications Management (Super Admin & Authorized Admins)
router.get("/applications", requireAdminOrSuperAdmin, getAllApplications);
router.patch("/applications/:id/status", requireAdminOrSuperAdmin, updateApplicationStatusByAdmin);

export default router;
