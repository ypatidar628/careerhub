import mongoose from "mongoose";

const fallbackActivities = [];

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    details: { type: String, default: "" },
    category: {
      type: String,
      enum: ["USER", "ADMIN", "JOB", "APPLICATION", "SYSTEM", "SECURITY"],
      default: "SYSTEM",
    },
    performedBy: {
      id: String,
      name: String,
      email: String,
      role: String,
    },
    targetUser: {
      id: String,
      name: String,
      email: String,
      role: String,
    },
    ipAddress: { type: String, default: "" },
    status: { type: String, enum: ["SUCCESS", "FAILED", "WARNING"], default: "SUCCESS" },
  },
  { timestamps: true },
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ category: 1, createdAt: -1 });

export const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export const logActivity = async ({
  action,
  details = "",
  category = "SYSTEM",
  performedBy = null,
  targetUser = null,
  ipAddress = "",
  status = "SUCCESS",
}) => {
  const payload = {
    action,
    details,
    category,
    performedBy: performedBy
      ? {
          id: String(performedBy.id || performedBy._id || ""),
          name: performedBy.name || "System",
          email: performedBy.email || "",
          role: String(performedBy.role || "").toUpperCase(),
        }
      : { id: "system", name: "System", email: "", role: "SYSTEM" },
    targetUser: targetUser
      ? {
          id: String(targetUser.id || targetUser._id || ""),
          name: targetUser.name || "",
          email: targetUser.email || "",
          role: String(targetUser.role || "").toUpperCase(),
        }
      : null,
    ipAddress,
    status,
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const doc = await Activity.create(payload);
      return { ...doc.toObject(), id: String(doc._id) };
    }
  } catch (err) {
    console.error("Failed to persist activity log:", err.message);
  }

  const inMem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  fallbackActivities.unshift(inMem);
  if (fallbackActivities.length > 200) fallbackActivities.pop();
  return inMem;
};

export const listRecentActivities = async (limit = 20) => {
  if (mongoose.connection.readyState === 1) {
    const list = await Activity.find().sort({ createdAt: -1 }).limit(limit).lean();
    return list.map((a) => ({ ...a, id: String(a._id) }));
  }
  return fallbackActivities.slice(0, limit);
};
