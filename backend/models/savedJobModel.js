import mongoose from "mongoose";

const fallbackSavedJobs = [];

const savedJobSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true },
);

savedJobSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export const SavedJob =
  mongoose.models.SavedJob || mongoose.model("SavedJob", savedJobSchema);

export const saveJobForUser = async (candidateId, jobId) => {
  if (mongoose.connection.readyState === 1) {
    const existing = await SavedJob.findOne({ candidateId, jobId });
    if (existing) return existing;
    return await SavedJob.create({ candidateId, jobId });
  }

  const existing = fallbackSavedJobs.find(
    (s) => String(s.candidateId) === String(candidateId) && String(s.jobId) === String(jobId),
  );
  if (existing) return existing;
  const newSave = {
    id: `sj_${Date.now()}`,
    candidateId,
    jobId,
    createdAt: new Date().toISOString(),
  };
  fallbackSavedJobs.push(newSave);
  return newSave;
};

export const removeSavedJobForUser = async (candidateId, jobId) => {
  if (mongoose.connection.readyState === 1) {
    const res = await SavedJob.deleteOne({ candidateId, jobId });
    return res.deletedCount > 0;
  }

  const index = fallbackSavedJobs.findIndex(
    (s) => String(s.candidateId) === String(candidateId) && String(s.jobId) === String(jobId),
  );
  if (index >= 0) {
    fallbackSavedJobs.splice(index, 1);
    return true;
  }
  return false;
};

export const getSavedJobsForUser = async (candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const items = await SavedJob.find({ candidateId })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean();

    return items
      .filter((item) => item.jobId) // filter out deleted jobs
      .map((item) => ({
        id: String(item._id),
        savedAt: item.createdAt,
        job: {
          ...item.jobId,
          id: String(item.jobId._id),
        },
      }));
  }

  return fallbackSavedJobs
    .filter((s) => String(s.candidateId) === String(candidateId))
    .map((s) => ({
      id: s.id,
      savedAt: s.createdAt,
      jobId: s.jobId,
    }));
};

export const getSavedJobIdsForUser = async (candidateId) => {
  if (mongoose.connection.readyState === 1) {
    const items = await SavedJob.find({ candidateId }).select("jobId").lean();
    return items.map((item) => String(item.jobId));
  }

  return fallbackSavedJobs
    .filter((s) => String(s.candidateId) === String(candidateId))
    .map((s) => String(s.jobId));
};
