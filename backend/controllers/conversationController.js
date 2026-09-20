import mongoose from "mongoose";
import { Application } from "../models/applicationModel.js";
import { Conversation } from "../models/conversationModel.js";
import { Job } from "../models/jobModel.js";
import { Message } from "../models/messageModel.js";
import { uploadFile } from "../services/uploadService.js";
import { getIO, notifyUser } from "../sockets/chatSocket.js";

const isMember = (conversation, userId) =>
  conversation.participants.some(
    (participant) => String(participant._id || participant) === String(userId),
  );

export const getForApplication = async (req, res) => {
  const { applicationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(404).json({ message: "Invalid application ID." });
  }

  const application = await Application.findById(applicationId).lean();
  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  const candidateId = application.candidateId?._id || application.candidateId;
  const recruiterId = application.recruiterId?._id || application.recruiterId;
  const currentUserId = String(req.user.id);

  const allowed = [String(candidateId), String(recruiterId)].includes(currentUserId);
  if (!allowed && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  let conversation = await Conversation.findOne({
    applicationId: application._id,
  })
    .populate("participants", "name email role profile profileImage")
    .populate("candidateId", "name email profile profileImage")
    .populate("recruiterId", "name email profile profileImage")
    .populate("jobId", "title company location mode status category salary")
    .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
    .lean();

  if (!conversation) {
    return res.status(404).json({ message: "No conversation found for this application." });
  }

  const otherUser = conversation.participants.find(
    (p) => String(p._id) !== String(req.user.id),
  );

  return res.json({
    conversation: {
      ...conversation,
      id: String(conversation._id),
      otherUser,
      application,
    },
  });
};

export const createForApplication = async (req, res) => {
  const { applicationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(404).json({ message: "Invalid application ID." });
  }

  let application = await Application.findById(applicationId).lean();
  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  let recruiterId = application.recruiterId?._id || application.recruiterId;
  if (!recruiterId) {
    const job = await Job.findById(application.jobId)
      .select("recruiterId")
      .lean();
    recruiterId = job?.recruiterId;
  }

  const candidateId = application.candidateId?._id || application.candidateId;
  const currentUserId = String(req.user.id);

  const allowed = [String(candidateId), String(recruiterId)].includes(currentUserId);
  if (!allowed && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  let conversation = await Conversation.findOne({
    applicationId: application._id,
  })
    .populate("participants", "name email role profile profileImage")
    .populate("candidateId", "name email profile profileImage")
    .populate("recruiterId", "name email profile profileImage")
    .populate("jobId", "title company location mode status category salary")
    .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
    .lean();

  if (!conversation) {
    try {
      const newConv = await Conversation.create({
        applicationId: application._id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        candidateId,
        recruiterId,
        participants: [candidateId, recruiterId].filter(Boolean),
      });

      conversation = await Conversation.findById(newConv._id)
        .populate("participants", "name email role profile profileImage")
        .populate("candidateId", "name email profile profileImage")
        .populate("recruiterId", "name email profile profileImage")
        .populate("jobId", "title company location mode status category salary")
        .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
        .lean();
    } catch (err) {
      // Catch duplicate key error if created simultaneously
      if (err.code === 11000) {
        conversation = await Conversation.findOne({
          applicationId: application._id,
        })
          .populate("participants", "name email role profile profileImage")
          .populate("candidateId", "name email profile profileImage")
          .populate("recruiterId", "name email profile profileImage")
          .populate("jobId", "title company location mode status category salary")
          .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
          .lean();
      } else {
        throw err;
      }
    }
  }

  const otherUser = conversation?.participants?.find(
    (p) => String(p._id) !== String(req.user.id),
  );

  return res.json({
    conversation: {
      ...conversation,
      id: String(conversation._id),
      otherUser,
      application,
    },
  });
};

export const list = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  })
    .populate("participants", "name email role profile profileImage")
    .populate("candidateId", "name email profile profileImage")
    .populate("recruiterId", "name email profile profileImage")
    .populate("jobId", "title company location mode status category salary")
    .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
    .sort({ lastMessageAt: -1 })
    .lean();

  const formatted = conversations.map((c) => {
    const otherUser = c.participants.find(
      (p) => String(p._id) !== String(req.user.id),
    );
    const unreadMap = c.unreadCounts || {};
    const unread = unreadMap[String(req.user.id)] || 0;

    return {
      ...c,
      id: String(c._id),
      otherUser,
      unread,
      application: c.applicationId,
    };
  });

  return res.json({ conversations: formatted });
};

export const getConversation = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  const conversation = await Conversation.findById(req.params.id)
    .populate("participants", "name email role profile profileImage")
    .populate("candidateId", "name email profile profileImage")
    .populate("recruiterId", "name email profile profileImage")
    .populate("jobId", "title company location mode status category salary")
    .populate("applicationId", "status candidateProfile notes resumeUrl resumeName createdAt")
    .lean();

  if (!conversation || !isMember(conversation, req.user.id)) {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  const otherUser = conversation.participants.find(
    (p) => String(p._id) !== String(req.user.id),
  );

  return res.json({
    conversation: {
      ...conversation,
      id: String(conversation._id),
      otherUser,
      application: conversation.applicationId,
    },
  });
};

export const messages = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  const conversation = await Conversation.findById(req.params.id).lean();
  if (!conversation || !isMember(conversation, req.user.id)) {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  const items = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .lean();

  // Mark unread messages as read for this user
  await Message.updateMany(
    { conversationId: conversation._id, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } },
  );

  // Reset unread count for this user
  if (conversation.unreadCounts) {
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } },
    );
  }

  return res.json({
    messages: items.map((message) => ({
      ...message,
      id: String(message._id),
    })),
  });
};

export const send = async (req, res) => {
  const text = String(req.body.text || "").trim();
  const attachments = Array.isArray(req.body.attachments)
    ? req.body.attachments
    : [];

  if (!text && !attachments.length) {
    return res
      .status(400)
      .json({ message: "Message text or attachment is required." });
  }

  if (text.length > 2000) {
    return res
      .status(400)
      .json({ message: "Message cannot exceed 2000 characters." });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !isMember(conversation, req.user.id)) {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    text,
    attachments,
    readBy: [req.user.id],
  });

  const preview = text || (attachments.length ? `[Attachment: ${attachments[0].fileName}]` : "");
  conversation.lastMessage = preview;
  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessageSenderId = req.user.id;

  // Increment unread counts
  conversation.participants.forEach((p) => {
    const pId = String(p);
    if (pId !== String(req.user.id)) {
      const current = conversation.unreadCounts?.get?.(pId) || conversation.unreadCounts?.[pId] || 0;
      if (conversation.unreadCounts?.set) {
        conversation.unreadCounts.set(pId, current + 1);
      } else {
        conversation.unreadCounts = conversation.unreadCounts || {};
        conversation.unreadCounts[pId] = current + 1;
      }
    }
  });

  await conversation.save();

  const formatted = {
    ...message.toObject(),
    id: String(message._id),
  };

  // Socket broadcast
  const io = getIO();
  if (io) {
    io.to(`conversation_${conversation._id}`).emit("receive_message", {
      conversationId: String(conversation._id),
      message: formatted,
    });

    conversation.participants.forEach((p) => {
      const pId = String(p);
      if (pId !== String(req.user.id)) {
        notifyUser(pId, "new_message_notification", {
          conversationId: String(conversation._id),
          message: formatted,
          jobTitle: conversation.jobTitle,
          senderName: req.user.name,
        });
      }
    });
  }

  return res.status(201).json({ message: formatted });
};

export const uploadAttachment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file attached." });
  }

  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      message: "Unsupported file type. Please upload an image, PDF, or Word document.",
    });
  }

  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ message: "Attachment must be under 10 MB." });
  }

  try {
    const result = await uploadFile(req.file, "attachments");
    return res.json({
      attachment: {
        url: result.url,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error("Attachment upload error:", error);
    return res
      .status(500)
      .json({ message: "Failed to upload file attachment." });
  }
};

export const markRead = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !isMember(conversation, req.user.id)) {
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });
  }

  await Message.updateMany(
    { conversationId: conversation._id, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } },
  );

  if (conversation.unreadCounts) {
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } },
    );
  }

  const io = getIO();
  if (io) {
    io.to(`conversation_${conversation._id}`).emit("messages_marked_read", {
      conversationId: String(conversation._id),
      readByUserId: String(req.user.id),
    });
  }

  return res.json({ message: "Marked as read." });
};
