import {
  createJob,
  getJob,
  listJobs,
  listJobsForRecruiter,
  removeJob,
  updateJob,
} from "../models/jobModel.js";
import { Application } from "../models/applicationModel.js";

export const jobs = async (req, res) => {
  const result = await listJobs({
    search: req.query.search,
    category: req.query.category,
    mode: req.query.mode,
    location: req.query.location,
    experience: req.query.experience,
    company: req.query.company,
    skills: req.query.skills,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res.json(result);
};

export const recruiterJobs = async (req, res) => {
  const rawJobs = await listJobsForRecruiter(req.user.id);

  // Attach applicant counts
  const jobsWithCount = await Promise.all(
    rawJobs.map(async (j) => {
      let applicantsCount = 0;
      try {
        applicantsCount = await Application.countDocuments({ jobId: j.id || j._id });
      } catch {
        applicantsCount = 0;
      }
      return { ...j, applicantsCount };
    }),
  );

  return res.json({ jobs: jobsWithCount });
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
    ? res.json({ job: item, message: "Job updated successfully." })
    : res.status(404).json({ message: "Job not found or cannot be edited." });
};

export const destroy = async (req, res) => {
  const deleted = await removeJob(req.params.id, req.user.id);
  return deleted
    ? res.json({ message: "Job deleted successfully." })
    : res.status(404).json({ message: "Job not found or cannot be deleted." });
};
