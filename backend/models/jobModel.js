import mongoose from "mongoose";
import { jobs as mockJobs } from "../data/mockData.js";

const fallbackJobs = [...mockJobs];

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    mode: {
      type: String,
      enum: ["Hybrid", "Remote", "On-site"],
      default: "Hybrid",
    },
    salary: { type: String, default: "Not disclosed" },
    experience: { type: String, default: "Not specified" },
    skills: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Active", "Paused", "Closed"],
      default: "Active",
    },
    recruiterName: String,
    postedAt: String,
  },
  { timestamps: true },
);

jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
  skills: "text",
});
jobSchema.index({ location: 1, status: 1 });

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export const seedDemoJobs = async () => {
  if (mongoose.connection.readyState !== 1 || (await Job.exists({}))) {
    return;
  }

  const recruiter = await mongoose
    .model("User")
    .findOne({ role: "recruiter" })
    .select("_id name")
    .lean();

  if (!recruiter) return;

  await Job.insertMany(
    mockJobs.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      mode: job.mode,
      salary: job.salary,
      experience: job.experience,
      skills: job.skills || [],
      requirements: job.requirements || [],
      status: "Active",
      recruiterId: recruiter._id,
      recruiterName: recruiter.name,
      postedAt: job.postedAt,
    })),
  );
};

export const listJobs = async (query = "") => {
  const keyword = String(query || "")
    .trim()
    .toLowerCase();

  if (mongoose.connection.readyState === 1) {
    const filter = keyword
      ? {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { company: { $regex: keyword, $options: "i" } },
            { location: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { skills: { $in: [new RegExp(keyword, "i")] } },
          ],
        }
      : {};

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    return jobs.map((job) => ({ ...job, id: String(job._id) }));
  }

  const jobs = fallbackJobs.filter((job) => {
    if (!keyword) return true;
    return [
      job.title,
      job.company,
      job.location,
      job.description,
      ...(job.skills || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  return jobs;
};

export const listJobsForRecruiter = async (recruiterId) => {
  if (mongoose.connection.readyState === 1) {
    const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 }).lean();
    return jobs.map((job) => ({ ...job, id: String(job._id) }));
  }

  return fallbackJobs.filter(
    (job) => !job.recruiterId || job.recruiterId === recruiterId,
  );
};

export const getJob = async (id) => {
  if (mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const job = await Job.findById(id).lean();
    return job ? { ...job, id: String(job._id) } : null;
  }

  return fallbackJobs.find((job) => job.id === id) || null;
};

export const createJob = async (data, recruiter) => {
  const payload = {
    recruiterId: recruiter.id,
    recruiterName: recruiter.name,
    company: data.company || recruiter.name,
    title: data.title,
    location: data.location,
    description: data.description || "",
    mode: data.mode || "Hybrid",
    salary: data.salary || "Not disclosed",
    experience: data.experience || "Not specified",
    skills: data.skills || [],
    requirements: data.requirements || [],
    status: data.status || "Active",
    postedAt: "Just now",
  };

  if (mongoose.connection.readyState === 1) {
    const job = await Job.create(payload);
    return { ...job.toObject(), id: String(job._id) };
  }

  const job = { id: `j${Date.now()}`, ...payload };
  fallbackJobs.unshift(job);
  return job;
};

export const updateJob = async (id, data, recruiterId) => {
  if (mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const job = await Job.findById(id).lean();
    if (
      !job ||
      (job.recruiterId && String(job.recruiterId) !== String(recruiterId))
    )
      return null;
    const updated = await Job.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).lean();
    return updated ? { ...updated, id: String(updated._id) } : null;
  }

  const job = fallbackJobs.find((entry) => entry.id === id);
  if (!job || (job.recruiterId && job.recruiterId !== recruiterId)) return null;
  Object.assign(job, data);
  return job;
};

export const removeJob = async (id, recruiterId) => {
  if (mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const job = await Job.findById(id);
    if (
      !job ||
      (job.recruiterId && String(job.recruiterId) !== String(recruiterId))
    )
      return false;
    await Job.deleteOne({ _id: id });
    return true;
  }

  const index = fallbackJobs.findIndex(
    (job) =>
      job.id === id && (!job.recruiterId || job.recruiterId === recruiterId),
  );
  if (index < 0) return false;
  fallbackJobs.splice(index, 1);
  return true;
};
