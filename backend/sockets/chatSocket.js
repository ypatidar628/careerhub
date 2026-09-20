import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { findById } from "../models/userModel.js";
import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { Notification } from "../models/notificationModel.js";

let io = null;
// Map: userId -> Set of socket IDs
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  const allowedOrigin =
    process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findById(payload.id);
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user.id || socket.user._id);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit("user_status_changed", {
      userId,
      isOnline: true,
      onlineUserIds: Array.from(onlineUsers.keys()),
    });

    // Send current list of online users to the newly connected socket
    socket.emit("online_users_list", Array.from(onlineUsers.keys()));

    // Join a conversation room (supports string or { conversationId })
    socket.on("join_conversation", async (data) => {
      try {
        const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId).lean();
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => String(p) === userId,
        );
        if (!isParticipant) {
          socket.emit("error_message", {
            message: "Unauthorized to join this conversation",
          });
          return;
        }

        socket.join(`conversation_${conversationId}`);
      } catch (error) {
        console.error("Socket join_conversation error:", error.message);
      }
    });

    // Leave a conversation room
    socket.on("leave_conversation", (data) => {
      const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
      const userName = (typeof data === "object" && data?.userName) || socket.user.name;
      if (!conversationId) return;
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on("stop_typing", (data) => {
      const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
      if (!conversationId) return;
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        conversationId,
        userId,
      });
    });

    // Support typing_start & typing_stop alias
    socket.on("typing_start", (data) => {
      const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
      const userName = (typeof data === "object" && data?.userName) || socket.user.name;
      if (!conversationId) return;
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on("typing_stop", (data) => {
      const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
      if (!conversationId) return;
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        conversationId,
        userId,
      });
    });

    // Send real-time message via socket
    socket.on("send_message", async ({ conversationId, text = "", attachments = [] }) => {
      try {
        if (!conversationId) return;
        const trimmedText = String(text || "").trim();
        if (!trimmedText && (!attachments || !attachments.length)) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => String(p) === userId,
        );
        if (!isParticipant) return;

        const messageDoc = await Message.create({
          conversationId: conversation._id,
          senderId: socket.user.id || socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          text: trimmedText,
          attachments: Array.isArray(attachments) ? attachments : [],
          readBy: [socket.user.id || socket.user._id],
        });

        // Update conversation last message
        const preview = trimmedText || (attachments.length ? `[Attachment: ${attachments[0].fileName}]` : "");
        conversation.lastMessage = preview;
        conversation.lastMessageAt = messageDoc.createdAt;
        conversation.lastMessageSenderId = socket.user.id || socket.user._id;

        // Increment unread count for other participants
        const unreadMap = conversation.unreadCounts || new Map();
        conversation.participants.forEach((p) => {
          const pId = String(p);
          if (pId !== userId) {
            const currentCount = unreadMap.get ? (unreadMap.get(pId) || 0) : ((unreadMap[pId] || 0));
            if (unreadMap.set) {
              unreadMap.set(pId, currentCount + 1);
            } else {
              unreadMap[pId] = currentCount + 1;
            }
          }
        });
        conversation.unreadCounts = unreadMap;
        await conversation.save();

        const formattedMessage = {
          ...messageDoc.toObject(),
          id: String(messageDoc._id),
        };

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit("receive_message", {
          conversationId,
          message: formattedMessage,
        });

        // Notify other participants outside the room
        conversation.participants.forEach((p) => {
          const pId = String(p);
          if (pId !== userId) {
            notifyUser(pId, "new_message_notification", {
              conversationId,
              message: formattedMessage,
              jobTitle: conversation.jobTitle,
              senderName: socket.user.name,
            });
          }
        });
      } catch (error) {
        console.error("Socket send_message error:", error.message);
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("mark_as_read", async (data) => {
      try {
        const conversationId = typeof data === "object" && data !== null ? data.conversationId : data;
        if (!conversationId) return;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        await Message.updateMany(
          { conversationId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } },
        );

        // Reset unread count for this user
        if (conversation.unreadCounts) {
          if (conversation.unreadCounts.set) {
            conversation.unreadCounts.set(userId, 0);
          } else {
            conversation.unreadCounts[userId] = 0;
          }
          await conversation.save();
        }

        io.to(`conversation_${conversationId}`).emit("messages_marked_read", {
          conversationId,
          readByUserId: userId,
        });
      } catch (error) {
        console.error("Socket mark_as_read error:", error.message);
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("user_status_changed", {
            userId,
            isOnline: false,
            onlineUserIds: Array.from(onlineUsers.keys()),
          });
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const closeSocket = () => {
  if (io) {
    io.close();
    io = null;
  }
};

export const notifyUser = (userId, eventName, data) => {
  if (!io) return;
  const userSockets = onlineUsers.get(String(userId));
  if (userSockets && userSockets.size > 0) {
    userSockets.forEach((socketId) => {
      io.to(socketId).emit(eventName, data);
    });
  }
};
