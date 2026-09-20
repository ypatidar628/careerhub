import React from "react";
import { FiFile, FiImage } from "react-icons/fi";
import StatusBadge from "../applications/StatusBadge";

export default function ConversationItem({
  conversation,
  isSelected,
  isOnline,
  currentUserId,
  onClick,
}) {
  const otherUser =
    conversation.otherUser ||
    conversation.participants?.find(
      (p) => String(p._id || p.id) !== String(currentUserId),
    );

  const displayName = otherUser?.name || "Discussion";
  const displayRole = otherUser?.role === "recruiter" ? "Recruiter" : "Candidate";
  const avatarUrl = otherUser?.profile?.avatarUrl || otherUser?.profileImage;

  // Format relative time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Preview formatting
  const getMessagePreview = () => {
    const lastMsg = conversation.lastMessage || "";
    if (!lastMsg) return "No messages yet";

    if (lastMsg.startsWith("[Attachment:")) {
      const fileName = lastMsg.replace("[Attachment:", "").replace("]", "").trim();
      const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
      return (
        <span className="flex items-center gap-1">
          {isImg ? <FiImage className="shrink-0" /> : <FiFile className="shrink-0" />}
          <span className="truncate">{fileName || "Attachment"}</span>
        </span>
      );
    }
    return lastMsg;
  };

  const appStatus =
    conversation.application?.status ||
    conversation.applicationStatus ||
    conversation.applicationId?.status;

  const unreadCount = Number(conversation.unread || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition ${
        isSelected
          ? "bg-brand/10 border-l-4 border-brand dark:bg-brand/20"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
      }`}
    >
      {/* Avatar with Online/Offline indicator */}
      <div className="relative shrink-0">
        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-brand/10 font-bold text-brand dark:bg-brand/20">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-base">{displayName[0] || "?"}</span>
          )}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 transition ${
            isOnline ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-300 dark:bg-slate-600"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`truncate text-sm ${
              unreadCount > 0
                ? "font-extrabold text-slate-900 dark:text-white"
                : "font-bold text-slate-800 dark:text-slate-200"
            }`}
          >
            {displayName}
          </h4>
          <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-brand dark:text-brand/90">
            {conversation.jobTitle || "Job Opportunity"}
          </p>
          {appStatus && (
            <span className="scale-75 origin-right">
              <StatusBadge status={appStatus} />
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={`line-clamp-1 text-xs ${
              unreadCount > 0
                ? "font-semibold text-slate-800 dark:text-slate-200"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {getMessagePreview()}
          </p>

          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
