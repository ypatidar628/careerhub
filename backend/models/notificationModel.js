import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["application_status", "new_message", "new_application", "general"],
      default: "general",
    },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export const createNotification = async ({ userId, title, message, type = "general", link = "" }) => {
  if (mongoose.connection.readyState === 1) {
    return await Notification.create({ userId, title, message, type, link });
  }
  return null;
};

export const getNotificationsForUser = async (userId) => {
  if (mongoose.connection.readyState === 1) {
    const items = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return items.map((n) => ({ ...n, id: String(n._id) }));
  }
  return [];
};
