import mongoose from "mongoose";
import { Application } from "../models/applicationModel.js";
import { Conversation } from "../models/conversationModel.js";
import { Job } from "../models/jobModel.js";
import { Message } from "../models/messageModel.js";

const isMember = (conversation, userId) =>
  conversation.participants.some(
    (participant) => String(participant) === String(userId),
  );

export const createForApplication = async (req, res) => {
  let application = await Application.findById(req.params.applicationId).lean();
  if (!application)
    return res.status(404).json({ message: "Application not found." });

  let recruiterId = application.recruiterId;
  if (!recruiterId) {
    const job = await Job.findById(application.jobId)
      .select("recruiterId")
      .lean();
    recruiterId = job?.recruiterId;
  }

  const allowed = [application.candidateId, recruiterId].some(
    (id) => String(id) === String(req.user.id),
  );
  if (!allowed)
    return res
      .status(403)
      .json({ message: "You cannot access this conversation." });

  if (!application.recruiterId && recruiterId) {
    await Application.updateOne(
      { _id: application._id },
      { $set: { recruiterId } },
    );
    application = { ...application, recruiterId };
  }

  let conversation = await Conversation.findOne({
    applicationId: application._id,
  }).lean();
  if (!conversation) {
    conversation = await Conversation.create({
      applicationId: application._id,
      jobTitle: application.jobTitle,
      participants: [application.candidateId, recruiterId],
    });
    conversation = conversation.toObject();
  }

  return res.json({
    conversation: { ...conversation, id: String(conversation._id) },
  });
};

export const list = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .sort({ lastMessageAt: -1 })
    .lean();
  return res.json({
    conversations: conversations.map((conversation) => ({
      ...conversation,
      id: String(conversation._id),
    })),
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
  return res.json({
    messages: items.map((message) => ({ ...message, id: String(message._id) })),
  });
};

export const send = async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text || text.length > 2000) {
    return res
      .status(400)
      .json({ message: "Message must be between 1 and 2000 characters." });
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
    text,
    readBy: [req.user.id],
  });
  conversation.lastMessage = text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();
  return res
    .status(201)
    .json({ message: { ...message.toObject(), id: String(message._id) } });
};
