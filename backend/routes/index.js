import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  refresh,
} from "../controllers/authController.js";
import {
  create,
  destroy,
  edit,
  jobs,
  job,
  recruiterJobs,
} from "../controllers/jobController.js";
import {
  apply,
  applicants,
  mine,
  updateStage,
  getOne,
  withdrawApplication,
} from "../controllers/applicationController.js";
import {
  dashboard,
  getMessages,
  getNotifications,
} from "../controllers/dashboardController.js";
import { avatar, resume, update } from "../controllers/profileController.js";
import {
  createForApplication,
  getForApplication,
  list,
  messages,
  send,
  getConversation,
  uploadAttachment,
  markRead,
} from "../controllers/conversationController.js";
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  getSavedJobIds,
} from "../controllers/savedJobController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { upload } from "../config/upload.js";
import { authRateLimiter, uploadRateLimiter } from "../middleware/security.js";

const router = Router();

// Health Check
router.get("/health", (_req, res) => res.json({ status: "ok" }));

// Auth Routes (Protected with strict brute-force rate limiter)
router.post("/auth/register", authRateLimiter, register);
router.post("/auth/login", authRateLimiter, login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);
router.post("/auth/refresh", requireAuth, refresh);

// Jobs Discovery & Management
router.get("/jobs", jobs);
router.get("/jobs/mine", requireAuth, allowRoles("recruiter"), recruiterJobs);
router.post("/jobs", requireAuth, allowRoles("recruiter"), create);
router.get("/jobs/:id", job);
router.patch("/jobs/:id", requireAuth, allowRoles("recruiter"), edit);
router.delete("/jobs/:id", requireAuth, allowRoles("recruiter"), destroy);

// Candidate Saved Jobs
router.get("/saved-jobs", requireAuth, allowRoles("candidate"), getSavedJobs);
router.get("/saved-jobs/ids", requireAuth, getSavedJobIds);
router.post("/saved-jobs/:id", requireAuth, allowRoles("candidate"), saveJob);
router.delete("/saved-jobs/:id", requireAuth, allowRoles("candidate"), unsaveJob);
router.post("/jobs/:id/save", requireAuth, allowRoles("candidate"), saveJob);
router.delete("/jobs/:id/save", requireAuth, allowRoles("candidate"), unsaveJob);

// Applications
router.post(
  "/jobs/:jobId/applications",
  requireAuth,
  allowRoles("candidate"),
  apply,
);
router.get("/applications/mine", requireAuth, allowRoles("candidate"), mine);
router.get("/applications", requireAuth, allowRoles("recruiter", "admin"), applicants);
router.get("/applications/:id", requireAuth, getOne);
router.patch(
  "/applications/:id",
  requireAuth,
  allowRoles("recruiter", "admin"),
  updateStage,
);
router.patch(
  "/applications/:id/withdraw",
  requireAuth,
  allowRoles("candidate"),
  withdrawApplication,
);

// Real-time Chat & Conversations
router.get(
  "/conversations/application/:applicationId",
  requireAuth,
  getForApplication,
);
router.post(
  "/applications/:applicationId/conversation",
  requireAuth,
  createForApplication,
);
router.get("/conversations", requireAuth, list);
router.get("/conversations/:id", requireAuth, getConversation);
router.get("/conversations/:id/messages", requireAuth, messages);
router.post("/conversations/:id/messages", requireAuth, send);
router.patch("/conversations/:id/read", requireAuth, markRead);
router.post(
  "/conversations/:id/attachments",
  requireAuth,
  uploadRateLimiter,
  upload.single("attachment"),
  uploadAttachment,
);
router.post(
  "/upload/attachment",
  requireAuth,
  uploadRateLimiter,
  upload.single("attachment"),
  uploadAttachment,
);

// Dashboard & User Profile
router.get("/notifications", requireAuth, getNotifications);
router.get("/messages", requireAuth, getMessages);
router.get("/dashboard", requireAuth, dashboard);
router.patch("/profile", requireAuth, update);
router.post("/profile/avatar", requireAuth, uploadRateLimiter, upload.single("avatar"), avatar);
router.post("/profile/resume", requireAuth, uploadRateLimiter, upload.single("resume"), resume);

export default router;
