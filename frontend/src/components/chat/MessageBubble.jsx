import { useState } from "react";
import {
  FiFile,
  FiDownload,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiCornerUpLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function MessageBubble({ message, isOwn, onReply }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFullFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${backendUrl}${url}`;
  };

  const copyText = (e) => {
    e.stopPropagation();
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      toast.success("Message copied to clipboard");
    }
  };

  const timeString = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isRead = message.readBy && message.readBy.length > 1;

  return (
    <>
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={`group relative flex flex-col ${
          isOwn ? "items-end" : "items-start"
        } max-w-[80%] sm:max-w-[70%] message-bubble-animate`}
      >
        {!isOwn && (
          <span className="mb-0.5 px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {message.senderName || "Recruiter"}
          </span>
        )}

        <div className="relative flex items-center gap-1.5">
          {/* Action buttons (Reply, Copy) */}
          {showActions && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur-xs transition dark:border-slate-700 dark:bg-slate-800/95 ${
                isOwn ? "-left-16" : "-right-16"
              }`}
            >
              {message.text && (
                <button
                  type="button"
                  onClick={copyText}
                  title="Copy text"
                  aria-label="Copy text"
                  className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-brand dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand"
                >
                  <FiCopy className="text-xs" />
                </button>
              )}
              {onReply && (
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  title="Reply to message"
                  aria-label="Reply to message"
                  className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-brand dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand"
                >
                  <FiCornerUpLeft className="text-xs" />
                </button>
              )}
            </div>
          )}

          <div
            className={`rounded-2xl px-3.5 py-2 text-sm shadow-xs transition ${
              isOwn
                ? "rounded-br-xs bg-brand text-white"
                : "rounded-bl-xs border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            }`}
          >
            {/* Message Text */}
            {message.text && (
              <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                {message.text}
              </p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div
                className={`space-y-1.5 ${
                  message.text ? "mt-2 pt-2 border-t" : ""
                } ${
                  isOwn
                    ? "border-white/20"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {message.attachments.map((att, idx) => {
                  const isImage =
                    att.fileType?.startsWith("image/") ||
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(att.fileName);
                  const fileUrl = getFullFileUrl(att.url);

                  if (isImage) {
                    return (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl cursor-pointer"
                        onClick={() => setPreviewImage(fileUrl)}
                      >
                        <img
                          src={fileUrl}
                          alt={att.fileName || "Image preview"}
                          className="max-h-56 max-w-full rounded-lg object-cover transition hover:opacity-95"
                          loading="lazy"
                        />
                      </div>
                    );
                  }

                  return (
                    <a
                      key={idx}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.fileName}
                      className={`flex items-center gap-2.5 rounded-xl p-2 text-xs font-medium transition ${
                        isOwn
                          ? "bg-white/15 hover:bg-white/25 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700/70 dark:hover:bg-slate-700 dark:text-slate-100"
                      }`}
                    >
                      <div className="rounded-lg bg-black/10 p-1.5 dark:bg-white/10">
                        <FiFile className="text-base" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{att.fileName}</p>
                        <p className="text-[10px] opacity-75">
                          {formatFileSize(att.fileSize)}
                        </p>
                      </div>
                      <FiDownload className="shrink-0 text-sm" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp and Read Status */}
        <div className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
          <time>{timeString}</time>
          {isOwn && (
            <span title={isRead ? "Read" : "Sent"}>
              {isRead ? (
                <span className="flex items-center text-emerald-400" title="Read">
                  <FiCheck className="-mr-1 text-[11px]" />
                  <FiCheck className="text-[11px]" />
                </span>
              ) : (
                <FiCheck className="text-[11px] text-slate-400" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Lightbox / Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
