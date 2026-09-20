import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiFile,
} from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "./MessageBubble";
import FileUploader from "./FileUploader";

export default function ApplicationChat({
  application,
  conversationId: directConversationId,
  otherPartyName,
  jobTitle,
  onClose,
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const {
    socket,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitStopTyping,
    typingUsers,
    isUserOnline,
  } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load conversation & history
  useEffect(() => {
    let active = true;

    const initChat = async () => {
      try {
        setLoading(true);
        let convData = null;

        if (application?.id || application?._id) {
          const appId = application.id || application._id;
          const { data } = await client.post(`/applications/${appId}/conversation`);
          convData = data.conversation;
        } else if (directConversationId) {
          const { data } = await client.get(`/conversations/${directConversationId}`);
          convData = data.conversation;
        }

        if (!active || !convData) return;

        setConversation(convData);

        const convId = convData.id || convData._id;
        const msgRes = await client.get(`/conversations/${convId}/messages`);
        if (active) {
          setMessages(msgRes.data.messages || []);
          joinConversation(convId);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error.response?.data?.message || "Unable to open conversation.",
          );
          if (onClose) onClose();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initChat();

    return () => {
      active = false;
      if (conversation?.id || conversation?._id) {
        const cId = conversation.id || conversation._id;
        leaveConversation(cId);
      }
    };
  }, [application, directConversationId, joinConversation, leaveConversation, onClose]);

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !conversation) return;
    const convId = conversation.id || conversation._id;

    const handleReceiveMessage = (data) => {
      if (data.conversationId === convId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => (m.id || m._id) === (data.message.id || data.message._id))) {
            return prev;
          }
          return [...prev, data.message];
        });
        // Auto mark as read
        socket.emit("mark_as_read", { conversationId: convId });
      }
    };

    const handleMessagesRead = (data) => {
      if (data.conversationId === convId) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            readBy: Array.from(new Set([...(m.readBy || []), data.readByUserId])),
          })),
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_marked_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_marked_read", handleMessagesRead);
    };
  }, [socket, conversation]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!conversation) return;
    const convId = conversation.id || conversation._id;

    emitTyping(convId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(convId);
    }, 2000);
  };

  const handleAttachmentUploaded = (attachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !attachments.length) || !conversation || sending) return;

    const convId = conversation.id || conversation._id;
    emitStopTyping(convId);
    setSending(true);

    const payload = {
      text: text.trim(),
      attachments,
    };

    try {
      const { data } = await client.post(
        `/conversations/${convId}/messages`,
        payload,
      );

      // Add to messages locally if not already received via socket
      setMessages((prev) => {
        if (prev.some((m) => (m.id || m._id) === (data.message.id || data.message._id))) {
          return prev;
        }
        return [...prev, data.message];
      });

      setText("");
      setAttachments([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const otherUser =
    conversation?.otherUser ||
    conversation?.participants?.find(
      (p) => String(p._id || p.id) !== String(currentUser?.id || currentUser?._id),
    );

  const displayPartyName =
    otherPartyName ||
    otherUser?.name ||
    (currentUser?.role === "recruiter"
      ? application?.candidateName
      : application?.recruiterName || "Recruiter");

  const displayRole =
    otherUser?.role ||
    (currentUser?.role === "recruiter" ? "Candidate" : "Recruiter");

  const otherUserId = otherUser?._id || otherUser?.id || (currentUser?.role === "recruiter" ? application?.candidateId : application?.recruiterId);
  const online = isUserOnline(otherUserId);

  const activeTyping = conversation ? typingUsers[conversation.id || conversation._id] : null;

  return (
    <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl transition dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 font-bold text-brand dark:bg-brand/20">
              {displayPartyName ? displayPartyName[0] : <FiMessageCircle />}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${
                online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
              title={online ? "Online" : "Offline"}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {displayPartyName}
              </h3>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {displayRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {jobTitle || application?.jobTitle || "Role Discussion"} ·{" "}
              <span className={online ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                {online ? "Active now" : "Offline"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close conversation"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex h-80 min-h-[280px] flex-col space-y-3 overflow-y-auto p-4 sm:p-5">
        {loading && (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-xs">Loading message history...</p>
          </div>
        )}

        {!loading && !messages.length && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <div className="mb-2 rounded-2xl bg-brand/10 p-4 text-2xl text-brand">
              <FiMessageCircle />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No messages yet
            </p>
            <p className="max-w-xs text-xs text-slate-500">
              Send a message or share documents directly to coordinate next steps.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const msgSenderId = String(
            message.senderId?._id ||
              message.senderId?.id ||
              message.senderId ||
              message.sender?._id ||
              message.sender?.id ||
              message.sender ||
              "",
          );
          const currentUserId = String(
            currentUser?._id || currentUser?.id || "",
          );
          const isOwn = Boolean(
            currentUserId && msgSenderId && msgSenderId === currentUserId,
          );
          return (
            <div
              key={message.id || message._id}
              className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <MessageBubble
                message={message}
                isOwn={isOwn}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {activeTyping && (
          <div className="flex items-center gap-2 text-xs italic text-slate-500 dark:text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0.4s]" />
            </span>
            <span>{activeTyping.userName || "Someone"} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-800">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs text-brand dark:bg-brand/10"
            >
              <FiFile />
              <span className="max-w-[120px] truncate">{att.fileName}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="ml-1 text-slate-400 hover:text-rose-500"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800"
      >
        <FileUploader
          onAttachmentUploaded={handleAttachmentUploaded}
          disabled={loading || sending}
        />

        <input
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Write a message... (Press Enter to send)"
          maxLength={2000}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-900"
        />

        <button
          type="submit"
          disabled={
            loading ||
            sending ||
            (!text.trim() && !attachments.length) ||
            !conversation
          }
          aria-label="Send message"
          className="flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend className="text-base" />
        </button>
      </form>
    </div>
  );
}
