import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiArrowLeft,
  FiFileText,
  FiChevronDown,
  FiBriefcase,
} from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import StatusBadge from "../applications/StatusBadge";
import ApplicationDetailsModal from "../applications/ApplicationDetailsModal";

export default function ChatWindow({
  conversation,
  messages,
  loading,
  currentUser,
  onSendMessage,
  onBack,
}) {
  const [replyTo, setReplyTo] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const {
    emitTyping,
    emitStopTyping,
    typingUsers,
    isUserOnline,
  } = useSocket();

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  const convId = conversation?.id || conversation?._id;
  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const otherUser =
    conversation?.otherUser ||
    conversation?.participants?.find(
      (p) => String(p._id || p.id) !== currentUserId,
    );

  const otherUserId = otherUser?._id || otherUser?.id;
  const isOnline = isUserOnline(otherUserId);
  const avatarUrl = otherUser?.profile?.avatarUrl || otherUser?.profileImage;

  const activeTyping = convId ? typingUsers[convId] : null;

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = "";

    const getDateLabel = (dateStr) => {
      const msgDate = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (msgDate.toDateString() === today.toDateString()) {
        return "Today";
      }
      if (msgDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
      return msgDate.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year:
          msgDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      });
    };

    messages.forEach((msg) => {
      const dateLabel = getDateLabel(msg.createdAt || Date.now());
      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ type: "date-separator", label: dateLabel });
      }
      groups.push({ type: "message", data: msg });
    });

    return groups;
  }, [messages]);

  // Scroll detection
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > 150) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
      setNewMessagesCount(0);
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
    setNewMessagesCount(0);
  };

  // Scroll to bottom on conversation change
  useEffect(() => {
    scrollToBottom(false);
    prevMessagesLength.current = messages.length;
  }, [convId]);

  // Handle auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 160;

        if (isNearBottom) {
          scrollToBottom(true);
        } else {
          setNewMessagesCount((prev) => prev + (messages.length - prevMessagesLength.current));
        }
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleTypingStart = useCallback(() => {
    if (convId) emitTyping(convId);
  }, [convId, emitTyping]);

  const handleTypingStop = useCallback(() => {
    if (convId) emitStopTyping(convId);
  }, [convId, emitStopTyping]);

  const appStatus =
    conversation?.application?.status ||
    conversation?.applicationStatus ||
    conversation?.applicationId?.status;

  const appData = conversation?.application || conversation?.applicationId;

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950 transition">
      {/* 1. Sticky Chat Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mr-1 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
              aria-label="Back to conversations"
            >
              <FiArrowLeft className="text-lg" />
            </button>
          )}

          {/* User Avatar with Status Indicator */}
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-brand/10 font-bold text-brand dark:bg-brand/20">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={otherUser?.name || "Participant"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{otherUser?.name ? otherUser.name[0] : "?"}</span>
              )}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 transition ${
                isOnline ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-300 dark:bg-slate-600"
              }`}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {otherUser?.name || "Discussion"}
              </h3>
              {appStatus && (
                <span className="scale-80 origin-left">
                  <StatusBadge status={appStatus} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{conversation?.jobTitle || "CareerHub Role"}</span>
              <span>·</span>
              <span
                className={`font-semibold ${
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </p>
          </div>
        </div>

        {/* View Application button */}
        {appData && (
          <button
            type="button"
            onClick={() => setShowAppModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-brand/10 dark:border-brand/40 dark:bg-brand/15 dark:hover:bg-brand/25"
          >
            <FiFileText className="text-xs" />
            <span className="hidden sm:inline">View Application</span>
            <span className="sm:hidden">Application</span>
          </button>
        )}
      </div>

      {/* 2. Application Context Bar */}
      {conversation?.jobTitle && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white/70 px-4 py-2 text-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              <FiBriefcase className="text-brand text-xs" />
              {conversation.jobTitle}
            </span>
            {conversation.jobId?.company && (
              <span>@ {conversation.jobId.company}</span>
            )}
            {conversation.jobId?.mode && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium dark:bg-slate-800">
                {conversation.jobId.mode}
              </span>
            )}
          </div>

          {appStatus && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span>Stage:</span>
              <b className="text-slate-700 dark:text-slate-200">{appStatus}</b>
            </div>
          )}
        </div>
      )}

      {/* 3. Messages Stream Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto chat-scrollbar p-4 space-y-3"
      >
        {loading && (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-xs">Loading conversation history...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl text-brand dark:bg-brand/20">
              <FiBriefcase />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Conversation Started
            </h4>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Send a greeting, schedule an interview, or share project updates.
            </p>
          </div>
        )}

        {/* Message Items with Date Separators */}
        {groupedMessages.map((item, idx) => {
          if (item.type === "date-separator") {
            return (
              <div
                key={`sep-${item.label}-${idx}`}
                className="my-3 flex items-center justify-center"
              >
                <span className="rounded-full bg-slate-200/80 px-3 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.data;
          const msgSenderId = String(
            msg.senderId?._id ||
              msg.senderId?.id ||
              msg.senderId ||
              msg.sender?._id ||
              msg.sender?.id ||
              msg.sender ||
              "",
          );
          const isOwn = Boolean(
            currentUserId && msgSenderId && msgSenderId === currentUserId,
          );

          return (
            <div
              key={msg.id || msg._id || idx}
              className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                onReply={(m) => setReplyTo(m)}
              />
            </div>
          );
        })}

        {/* Typing Indicator */}
        {activeTyping && (
          <div className="flex w-full justify-start">
            <TypingIndicator userName={activeTyping.userName} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 z-20 flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-brand/90 hover:scale-105 active:scale-95"
        >
          <FiChevronDown />
          <span>New messages {newMessagesCount > 0 ? `(${newMessagesCount})` : ""}</span>
        </button>
      )}

      {/* 4. Chat Input Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        onTyping={handleTypingStart}
        onStopTyping={handleTypingStop}
        disabled={loading}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* Application Details Modal */}
      {showAppModal && appData && (
        <ApplicationDetailsModal
          isOpen={showAppModal}
          onClose={() => setShowAppModal(false)}
          application={appData}
        />
      )}
    </div>
  );
}
