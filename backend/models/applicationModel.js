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

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeUrl: String,
    coverLetter: String,
    answers: [{ questionId: String, question: String, answer: String }],
    status: { type: String, enum: stages, default: "Applied" },
    recruiterNotes: { type: String, default: "" },
    score: { type: Number, default: 78 },
  },
  { timestamps: true },
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, status: 1 });

export const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export const createApplication = async ({
  job,
  candidate,
  coverLetter,
  resumeUrl,
  answers = [],
}) => {
  const payload = {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    recruiterId: job.recruiterId,
    resumeUrl: resumeUrl || candidate.profile?.resumeUrl || null,
    coverLetter,
    answers,
    status: "Applied",
    recruiterNotes: "",
    score: 78,
  };

  if (mongoose.connection.readyState === 1) {
    const application = await Application.create(payload);
    return { ...application.toObject(), id: String(application._id) };
  }

  const application = {
    id: `a${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  fallbackApplications.push(application);
  return application;
};

export const applicationsForCandidate = async (candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const applications = await Application.find({ candidateId })
      .sort({ createdAt: -1 })
      .lean();
    return applications.map((application) => ({
      ...application,
      id: String(application._id),
    }));
  }

  return fallbackApplications.filter(
    (application) => application.candidateId === candidateId,
  );
};

export const allApplications = async () => {
  if (mongoose.connection.readyState === 1) {
    const applications = await Application.find({})
      .sort({ createdAt: -1 })
      .lean();
    return applications.map((application) => ({
      ...application,
      id: String(application._id),
    }));
  }

  return fallbackApplications;
};

export const setStage = async (id, status) => {
  if (mongoose.connection.readyState === 1) {
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();
    return application ? { ...application, id: String(application._id) } : null;
  }

  const item = fallbackApplications.find(
    (application) => application.id === id,
  );
  if (item) item.status = status;
  return item;
};

export const withdraw = async (id, candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const application = await Application.findOne({ _id: id, candidateId });
    if (
      !application ||
      !["Applied", "Under Review"].includes(application.status)
    )
      return null;
    application.status = "Withdrawn";
    await application.save();
    return { ...application.toObject(), id: String(application._id) };
  }

  const item = fallbackApplications.find(
    (application) =>
      application.id === id && application.candidateId === candidateId,
  );
  if (item && ["Applied", "Under Review"].includes(item.status)) {
    item.status = "Withdrawn";
  }
  return item;
};
