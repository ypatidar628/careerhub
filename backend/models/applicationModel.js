import mongoose from "mongoose";

const fallbackApplications = [];
export const stages = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
  "Withdrawn",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: stages, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedByName: { type: String, default: "" },
    changedByRole: { type: String, default: "" },
    note: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },
    mode: { type: String, default: "Hybrid" },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String, default: "" },
    candidateProfile: {
      location: String,
      bio: String,
      skills: [String],
      experience: String,
      education: String,
      avatarUrl: String,
      portfolioUrl: String,
      githubUrl: String,
      linkedinUrl: String,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterName: { type: String, default: "" },
    resumeUrl: String,
    resumeName: String,
    coverLetter: String,
    expectedSalary: String,
    noticePeriod: String,
    answers: [{ questionId: String, question: String, answer: String }],
    status: { type: String, enum: stages, default: "Applied" },
    statusHistory: [statusHistorySchema],
    recruiterNotes: { type: String, default: "" },
    score: { type: Number, default: 85 },
  },
  { timestamps: true },
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, status: 1 });
applicationSchema.index({ jobId: 1, createdAt: -1 });

export const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export const createApplication = async ({
  job,
  candidate,
  coverLetter,
  resumeUrl,
  resumeName,
  expectedSalary,
  noticePeriod,
  answers = [],
}) => {
  const initialHistory = [
    {
      status: "Applied",
      changedBy: candidate.id || candidate._id,
      changedByName: candidate.name,
      changedByRole: "candidate",
      note: "Application submitted",
      changedAt: new Date(),
    },
  ];

  const payload = {
    jobId: job.id || job._id,
    jobTitle: job.title,
    company: job.company,
    location: job.location || "",
    mode: job.mode || "Hybrid",
    candidateId: candidate.id || candidate._id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    candidatePhone: candidate.phone || candidate.profile?.phone || "",
    candidateProfile: {
      location: candidate.profile?.location || "",
      bio: candidate.profile?.bio || "",
      skills: candidate.profile?.skills || candidate.skills || [],
      experience: candidate.profile?.experience || "",
      education: candidate.profile?.education || "",
      avatarUrl: candidate.profile?.avatarUrl || candidate.profileImage || "",
      portfolioUrl: candidate.profile?.portfolioUrl || "",
      githubUrl: candidate.profile?.githubUrl || "",
      linkedinUrl: candidate.profile?.linkedinUrl || "",
    },
    recruiterId: job.recruiterId,
    recruiterName: job.recruiterName || "",
    resumeUrl: resumeUrl || candidate.profile?.resumeUrl || null,
    resumeName: resumeName || candidate.profile?.resumeName || "Resume.pdf",
    coverLetter: coverLetter || "",
    expectedSalary: expectedSalary || "",
    noticePeriod: noticePeriod || "",
    answers,
    status: "Applied",
    statusHistory: initialHistory,
    recruiterNotes: "",
    score: Math.floor(Math.random() * 15) + 85,
  };

  if (mongoose.connection.readyState === 1) {
    const application = await Application.create(payload);
    return { ...application.toObject(), id: String(application._id) };
  }

  const application = {
    id: `a${Date.now()}`,
    _id: `a${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fallbackApplications.push(application);
  return application;
};

export const applicationsForCandidate = async (candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const applications = await Application.find({ candidateId })
      .populate("jobId")
      .populate("recruiterId", "name email phone profile company location")
      .sort({ createdAt: -1 })
      .lean();
    return applications.map((application) => ({
      ...application,
      id: String(application._id),
      job: application.jobId ? { ...application.jobId, id: String(application.jobId._id) } : null,
    }));
  }

  return fallbackApplications
    .filter((application) => String(application.candidateId) === String(candidateId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const allApplicationsForRecruiter = async (recruiterId, filterParams = {}) => {
  const { jobId, status } = filterParams;

  if (mongoose.connection.readyState === 1) {
    const query = { recruiterId };
    if (jobId) query.jobId = jobId;
    if (status && status !== "All") query.status = status;

    const applications = await Application.find(query)
      .populate("jobId")
      .populate("candidateId", "name email phone profile skills profileImage")
      .sort({ createdAt: -1 })
      .lean();

    return applications.map((application) => ({
      ...application,
      id: String(application._id),
      job: application.jobId ? { ...application.jobId, id: String(application.jobId._id) } : null,
    }));
  }

  return fallbackApplications.filter((app) => {
    if (String(app.recruiterId) !== String(recruiterId)) return false;
    if (jobId && String(app.jobId) !== String(jobId)) return false;
    if (status && status !== "All" && app.status !== status) return false;
    return true;
  });
};

export const getApplicationById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const application = await Application.findById(id)
      .populate("jobId")
      .populate("candidateId", "name email phone profile skills profileImage")
      .populate("recruiterId", "name email phone profile company location")
      .lean();
    return application
      ? {
          ...application,
          id: String(application._id),
          job: application.jobId ? { ...application.jobId, id: String(application.jobId._id) } : null,
        }
      : null;
  }

  return fallbackApplications.find((app) => String(app.id) === String(id) || String(app._id) === String(id)) || null;
};

export const setStage = async (id, status, user, note = "") => {
  if (mongoose.connection.readyState === 1) {
    const application = await Application.findById(id);
    if (!application) return null;

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: user.id || user._id,
      changedByName: user.name,
      changedByRole: user.role,
      note: note || `Status updated to ${status}`,
      changedAt: new Date(),
    });
    if (note && user.role === "recruiter") {
      application.recruiterNotes = note;
    }
    await application.save();
    return { ...application.toObject(), id: String(application._id) };
  }

  const item = fallbackApplications.find(
    (application) => String(application.id) === String(id) || String(application._id) === String(id),
  );
  if (item) {
    item.status = status;
    item.statusHistory = item.statusHistory || [];
    item.statusHistory.push({
      status,
      changedBy: user.id,
      changedByName: user.name,
      changedByRole: user.role,
      note: note || `Status updated to ${status}`,
      changedAt: new Date().toISOString(),
    });
    item.updatedAt = new Date().toISOString();
  }
  return item;
};

export const withdraw = async (id, candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const application = await Application.findOne({ _id: id, candidateId });
    if (
      !application ||
      !["Applied", "Under Review"].includes(application.status)
    ) {
      return null;
    }
    application.status = "Withdrawn";
    application.statusHistory.push({
      status: "Withdrawn",
      changedBy: candidateId,
      changedByName: application.candidateName,
      changedByRole: "candidate",
      note: "Application withdrawn by candidate",
      changedAt: new Date(),
    });
    await application.save();
    return { ...application.toObject(), id: String(application._id) };
  }

  const item = fallbackApplications.find(
    (application) =>
      (String(application.id) === String(id) || String(application._id) === String(id)) &&
      String(application.candidateId) === String(candidateId),
  );
  if (item && ["Applied", "Under Review"].includes(item.status)) {
    item.status = "Withdrawn";
    item.statusHistory = item.statusHistory || [];
    item.statusHistory.push({
      status: "Withdrawn",
      changedBy: candidateId,
      changedByName: item.candidateName,
      changedByRole: "candidate",
      note: "Application withdrawn by candidate",
      changedAt: new Date().toISOString(),
    });
    return item;
  }
  return null;
};
