import {
  createJob,
  getJob,
  listJobs,
  listJobsForRecruiter,
  removeJob,
  updateJob,
} from "../models/jobModel.js";

export const jobs = async (req, res) => {
  const jobs = await listJobs(req.query.search);
  return res.json({ jobs });
};

export const recruiterJobs = async (req, res) => {
  const jobs = await listJobsForRecruiter(req.user.id);
  return res.json({ jobs });
};

export const job = async (req, res) => {
  const item = await getJob(req.params.id);
  return item
    ? res.json({ job: item })
    : res.status(404).json({ message: "Job not found." });
};

export const create = async (req, res) => {
  if (!req.body.title || !req.body.location) {
    return res
      .status(400)
      .json({ message: "Title and location are required." });
  }

  const created = await createJob(req.body, req.user);
  return res
    .status(201)
    .json({ job: created, message: "Job created successfully." });
};

export const edit = async (req, res) => {
  const item = await updateJob(req.params.id, req.body, req.user.id);
  return item
    ? res.json({ job: item })
    : res.status(404).json({ message: "Job not found or cannot be edited." });
};

export const destroy = async (req, res) => {
  const deleted = await removeJob(req.params.id, req.user.id);
  return deleted
    ? res.json({ message: "Job deleted." })
    : res.status(404).json({ message: "Job not found or cannot be deleted." });
};
