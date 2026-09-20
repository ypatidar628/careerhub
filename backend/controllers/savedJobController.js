import {
  saveJobForUser,
  removeSavedJobForUser,
  getSavedJobsForUser,
  getSavedJobIdsForUser,
} from "../models/savedJobModel.js";
import { getJob } from "../models/jobModel.js";

export const saveJob = async (req, res) => {
  const jobId = req.params.id;
  const job = await getJob(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found." });
  }

  await saveJobForUser(req.user.id, jobId);
  return res.json({ message: "Job saved successfully.", saved: true });
};

export const unsaveJob = async (req, res) => {
  const jobId = req.params.id;
  await removeSavedJobForUser(req.user.id, jobId);
  return res.json({ message: "Job removed from saved.", saved: false });
};

export const getSavedJobs = async (req, res) => {
  const savedJobs = await getSavedJobsForUser(req.user.id);
  return res.json({ savedJobs });
};

export const getSavedJobIds = async (req, res) => {
  const ids = await getSavedJobIdsForUser(req.user.id);
  return res.json({ ids });
};
