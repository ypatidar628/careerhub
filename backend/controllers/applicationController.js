import { getJob } from "../models/jobModel.js";
import {
  allApplications,
  applicationsForCandidate,
  createApplication,
  setStage,
  stages,
  withdraw,
} from "../models/applicationModel.js";

export const apply = async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job || job.status === "Closed" || job.status === "Paused") {
    return res
      .status(404)
      .json({ message: "This job is not accepting applications." });
  }

  const existing = await allApplications();
  if (
    existing.some((a) => a.jobId === job.id && a.candidateId === req.user.id)
  ) {
    return res
      .status(409)
      .json({ message: "You have already applied for this role." });
  }

  const application = await createApplication({
    job,
    candidate: req.user,
    coverLetter: req.body.coverLetter,
    resumeUrl: req.body.resumeUrl,
    answers: req.body.answers,
  });

  return res
    .status(201)
    .json({ application, message: "Application submitted successfully." });
};

export const mine = async (req, res) => {
  const applications = await applicationsForCandidate(req.user.id);
  return res.json({ applications, stages });
};

export const applicants = async (_req, res) => {
  const applications = await allApplications();
  return res.json({ applications, stages });
};

export const updateStage = async (req, res) => {
  if (!stages.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid application stage." });
  }

  const application = await setStage(req.params.id, req.body.status);
  return application
    ? res.json({ application })
    : res.status(404).json({ message: "Application not found." });
};

export const withdrawApplication = async (req, res) => {
  const application = await withdraw(req.params.id, req.user.id);
  return application
    ? res.json({ application })
    : res
        .status(400)
        .json({ message: "This application can no longer be withdrawn." });
};
