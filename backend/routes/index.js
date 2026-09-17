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
} from "../controllers/applicationController.js";
import {
  dashboard,
  getMessages,
  getNotifications,
} from "../controllers/dashboardController.js";
import { avatar, resume, update } from "../controllers/profileController.js";
import {
  createForApplication,
  list,
  messages,
  send,
} from "../controllers/conversationController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { upload } from "../config/upload.js";
// Route group keeps public discovery endpoints separate from authenticated user actions.
const router = Router();
router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);
router.post("/auth/refresh", requireAuth, refresh);
router.get("/jobs", jobs);
router.get("/jobs/mine", requireAuth, allowRoles("recruiter"), recruiterJobs);
router.post("/jobs", requireAuth, allowRoles("recruiter"), create);
router.get("/jobs/:id", job);
router.patch("/jobs/:id", requireAuth, allowRoles("recruiter"), edit);
router.delete("/jobs/:id", requireAuth, allowRoles("recruiter"), destroy);
router.post(
  "/jobs/:jobId/applications",
  requireAuth,
  allowRoles("candidate"),
  apply,
);
router.get("/applications/mine", requireAuth, allowRoles("candidate"), mine);
router.get("/applications", requireAuth, allowRoles("recruiter"), applicants);
router.patch(
  "/applications/:id",
  requireAuth,
  allowRoles("recruiter"),
  updateStage,
);
router.post(
  "/applications/:applicationId/conversation",
  requireAuth,
  createForApplication,
);
router.get("/conversations", requireAuth, list);
router.get("/conversations/:id/messages", requireAuth, messages);
router.post("/conversations/:id/messages", requireAuth, send);
router.get("/notifications", requireAuth, getNotifications);
router.get("/messages", requireAuth, getMessages);
router.get("/dashboard", requireAuth, dashboard);
router.patch("/profile", requireAuth, update);
router.post("/profile/avatar", requireAuth, upload.single("avatar"), avatar);
router.post("/profile/resume", requireAuth, upload.single("resume"), resume);
export default router;
