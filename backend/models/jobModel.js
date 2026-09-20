import mongoose from "mongoose";
import { jobs as mockJobs } from "../data/mockData.js";

const fallbackJobs = mockJobs.map((j, i) => ({
  id: `j${i + 1}`,
  _id: `j${i + 1}`,
  ...j,
  status: "Active",
  postedAt: j.postedAt || "Recently",
}));

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterName: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: {
      type: String,
      default: "Engineering",
      trim: true,
    },
    mode: {
      type: String,
      enum: ["Hybrid", "Remote", "On-site"],
      default: "Hybrid",
    },
    salary: { type: String, default: "Not disclosed" },
    minSalary: { type: Number, default: 0 },
    maxSalary: { type: Number, default: 0 },
    experience: { type: String, default: "Not specified" },
    skills: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Paused", "Closed"],
      default: "Active",
    },
    postedAt: { type: String, default: "Just now" },
  },
  { timestamps: true },
);

jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
  skills: "text",
  location: "text",
});
jobSchema.index({ location: 1, status: 1, category: 1, mode: 1 });
jobSchema.index({ recruiterId: 1, createdAt: -1 });

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export const seedDemoJobs = async () => {
  if (mongoose.connection.readyState !== 1) return;

  const count = await Job.countDocuments();
  if (count >= 5) return;

  const recruiter = await mongoose
    .model("User")
    .findOne({ role: "recruiter" })
    .select("_id name")
    .lean();

  if (!recruiter) return;

  for (const job of mockJobs) {
    const exists = await Job.findOne({ title: job.title, company: job.company });
    if (!exists) {
      await Job.create({
        title: job.title,
        company: job.company,
        location: job.location,
        category: job.category || "Engineering",
        description: job.description,
        mode: job.mode,
        salary: job.salary,
        experience: job.experience,
        skills: job.skills || [],
        requirements: job.requirements || [],
        status: "Active",
        recruiterId: recruiter._id,
        recruiterName: recruiter.name,
        postedAt: job.postedAt || "Just now",
      });
    }
  }
};

export const listJobs = async (params = {}) => {
  const {
    search = "",
    category = "",
    mode = "",
    location = "",
    experience = "",
    company = "",
    skills = "",
    sort = "newest",
    page = 1,
    limit = 9,
    status = "Active",
  } = params;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
  const skip = (pageNum - 1) * limitNum;

  if (mongoose.connection.readyState === 1) {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { title: regex },
        { company: regex },
        { location: regex },
        { description: regex },
        { category: regex },
        { skills: { $in: [regex] } },
      ];
    }

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (mode && mode !== "All") {
      filter.mode = mode;
    }

    if (location && location !== "All") {
      filter.location = new RegExp(location.trim(), "i");
    }

    if (experience && experience !== "All") {
      filter.experience = new RegExp(experience.trim(), "i");
    }

    if (company && company !== "All") {
      filter.company = new RegExp(company.trim(), "i");
    }

    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length) {
        filter.skills = {
          $in: skillsArray.map((s) => new RegExp(s, "i")),
        };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "title_asc") sortOption = { title: 1 };
    if (sort === "salary_high") sortOption = { salary: -1, createdAt: -1 };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return {
      jobs: jobs.map((job) => ({ ...job, id: String(job._id) })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  // Fallback in-memory query
  let filtered = [...fallbackJobs];
  if (status) {
    filtered = filtered.filter((j) => (j.status || "Active") === status);
  }

  if (search && search.trim()) {
    const keyword = search.trim().toLowerCase();
    filtered = filtered.filter((j) =>
      [
        j.title,
        j.company,
        j.location,
        j.category,
        j.description,
        ...(j.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }

  if (category && category !== "All") {
    filtered = filtered.filter(
      (j) => (j.category || "Engineering").toLowerCase() === category.toLowerCase(),
    );
  }

  if (mode && mode !== "All") {
    filtered = filtered.filter((j) => j.mode === mode);
  }

  if (location && location !== "All") {
    filtered = filtered.filter((j) =>
      (j.location || "").toLowerCase().includes(location.toLowerCase()),
    );
  }

  const total = filtered.length;
  const paged = filtered.slice(skip, skip + limitNum);

  return {
    jobs: paged,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

export const listJobsForRecruiter = async (recruiterId) => {
  if (mongoose.connection.readyState === 1) {
    const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 }).lean();
    return jobs.map((job) => ({ ...job, id: String(job._id) }));
  }

  return fallbackJobs.filter(
    (job) => !job.recruiterId || String(job.recruiterId) === String(recruiterId),
  );
};

export const getJob = async (id) => {
  if (mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const job = await Job.findById(id).lean();
    return job ? { ...job, id: String(job._id) } : null;
  }

  return fallbackJobs.find((job) => String(job.id) === String(id) || String(job._id) === String(id)) || null;
};

export const createJob = async (data, recruiter) => {
  const payload = {
    recruiterId: recruiter.id || recruiter._id,
    recruiterName: recruiter.name,
    company: data.company || recruiter.name,
    title: data.title,
    location: data.location,
    category: data.category || "Engineering",
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

  const job = { id: `j${Date.now()}`, _id: `j${Date.now()}`, ...payload };
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

  const job = fallbackJobs.find((entry) => String(entry.id) === String(id));
  if (!job || (job.recruiterId && String(job.recruiterId) !== String(recruiterId))) return null;
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
      String(job.id) === String(id) && (!job.recruiterId || String(job.recruiterId) === String(recruiterId)),
  );
  if (index < 0) return false;
  fallbackJobs.splice(index, 1);
  return true;
};
