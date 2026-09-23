import { getJob } from "../models/jobModel.js";
import {
  allApplicationsForRecruiter,
  applicationsForCandidate,
  createApplication,
  getApplicationById,
  setStage,
  stages,
  withdraw,
  Application,
} from "../models/applicationModel.js";
import { notifyUser } from "../sockets/chatSocket.js";
import { createNotification } from "../models/notificationModel.js";

export const apply = async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job || job.status === "Closed" || job.status === "Paused") {
    return res
      .status(400)
      .json({ message: "This job is not accepting applications." });
  }

  // Check if candidate already applied
  try {
    const existing = await Application.findOne({
      jobId: job.id || job._id,
      candidateId: req.user.id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already applied for this role." });
    }
  } catch (err) {
    console.error("Duplicate check error:", err);
  }

  const application = await createApplication({
    job,
    candidate: req.user,
    coverLetter: req.body.coverLetter || "",
    resumeUrl: req.body.resumeUrl,
    resumeName: req.body.resumeName,
    expectedSalary: req.body.expectedSalary || "",
    noticePeriod: req.body.noticePeriod || "",
    answers: req.body.answers,
  });

  // Notify recruiter
  if (job.recruiterId) {
    const notifMsg = `${req.user.name} applied for ${job.title}`;
    await createNotification({
      userId: job.recruiterId,
      title: "New Job Application",
      message: notifMsg,
      type: "new_application",
      link: `/applications`,
    });
    notifyUser(job.recruiterId, "new_application", {
      application,
      message: notifMsg,
    });
  }

  return res
    .status(201)
    .json({ application, message: "Application submitted successfully." });
};

export const mine = async (req, res) => {
  const applications = await applicationsForCandidate(req.user.id);
  return res.json({ applications, stages });
};

export const applicants = async (req, res) => {
  const applications = await allApplicationsForRecruiter(req.user.id, {
    jobId: req.query.jobId,
    status: req.query.status,
  });
  return res.json({ applications, stages });
};

export const getOne = async (req, res) => {
  const application = await getApplicationById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  const isCandidate = String(application.candidateId?._id || application.candidateId) === String(req.user.id);
  const isRecruiter = String(application.recruiterId?._id || application.recruiterId) === String(req.user.id);
  const isAdmin = req.user.role === "admin";

  if (!isCandidate && !isRecruiter && !isAdmin) {
    return res.status(403).json({ message: "Access denied." });
  }

  return res.json({ application });
};

export const updateStage = async (req, res) => {
  const { status, note } = req.body;
  if (!stages.includes(status)) {
    return res.status(400).json({ message: "Invalid application stage." });
  }

  const application = await setStage(req.params.id, status, req.user, note);
  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  // Real-time notification to candidate
  const candidateId = String(application.candidateId?._id || application.candidateId);
  const notifMsg = `Your application for "${application.jobTitle}" is now "${status}".`;
  
  await createNotification({
    userId: candidateId,
    title: "Application Status Updated",
    message: notifMsg,
    type: "application_status",
    link: `/applications`,
  });

  notifyUser(candidateId, "application_status_updated", {
    applicationId: application.id || application._id,
    jobTitle: application.jobTitle,
    status,
    note,
    statusHistory: application.statusHistory,
    message: notifMsg,
  });

  return res.json({
    application,
    message: `Application status updated to ${status}`,
  });
};

export const withdrawApplication = async (req, res) => {
  const application = await withdraw(req.params.id, req.user.id);
  if (!application) {
    return res
      .status(400)
      .json({ message: "This application can no longer be withdrawn." });
  }

  // Notify recruiter
  const recruiterId = String(application.recruiterId?._id || application.recruiterId);
  if (recruiterId) {
    const notifMsg = `${application.candidateName} withdrew their application for "${application.jobTitle}".`;
    await createNotification({
      userId: recruiterId,
      title: "Application Withdrawn",
      message: notifMsg,
      type: "application_status",
      link: `/applications`,
    });
    notifyUser(recruiterId, "application_withdrawn", {
      applicationId: application.id || application._id,
      message: notifMsg,
    });
  }

  return res.json({
    application,
    message: "Application withdrawn successfully.",
  });
};
