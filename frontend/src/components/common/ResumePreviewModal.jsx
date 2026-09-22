import React, { useState, useEffect } from "react";
import {
  FiX,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

/**
 * Returns full URL for a given relative or absolute file path.
 */
export const getFullResumeUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function ResumePreviewModal({
  isOpen,
  onClose,
  resumeUrl,
  resumeName = "Resume.pdf",
}) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setHasError(false);
      // Disable body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, resumeUrl]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !resumeUrl) return null;

  const fullUrl = getFullResumeUrl(resumeUrl);
  const isPdf =
    resumeName.toLowerCase().endsWith(".pdf") ||
    resumeUrl.toLowerCase().includes(".pdf");
  const isDoc =
    resumeName.toLowerCase().endsWith(".doc") ||
    resumeName.toLowerCase().endsWith(".docx") ||
    resumeUrl.toLowerCase().includes(".doc");

  // For doc/docx, we can offer Google Docs viewer if it's a publicly accessible HTTPS link
  const isHttpUrl = fullUrl.startsWith("http://") || fullUrl.startsWith("https://");
  const docViewerUrl =
    isDoc && isHttpUrl
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
      : null;

  const previewSource = isPdf
    ? `${fullUrl}#toolbar=1&navpanes=0`
    : docViewerUrl || fullUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/20">
              <FiFileText className="text-xl" />
            </div>
            <div className="min-w-0">
              <h2
                id="resume-preview-title"
                className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base"
                title={resumeName}
              >
                {resumeName || "Resume Preview"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPdf ? "PDF Document" : isDoc ? "Word Document" : "Attached Document"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand"
              title="Open in new tab"
            >
              <FiExternalLink />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <a
              href={fullUrl}
              download={resumeName || "Resume.pdf"}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
              title="Download Resume"
            >
              <FiDownload />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="relative flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950">
          {loading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90">
              <FiLoader className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Loading document preview...
              </p>
            </div>
          )}

          {hasError ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <FiAlertCircle />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Unable to display preview directly
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                Your browser or document format might not support direct embedded viewing.
                You can still download or open the resume in a new tab.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <FiExternalLink /> Open in Tab
                </a>
                <a
                  href={fullUrl}
                  download={resumeName || "Resume"}
                  className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90"
                >
                  <FiDownload /> Download File
                </a>
              </div>
            </div>
          ) : isPdf ? (
            <iframe
              src={previewSource}
              title={resumeName || "Resume Document"}
              className="h-full w-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setHasError(true);
              }}
            />
          ) : isDoc && docViewerUrl ? (
            <iframe
              src={docViewerUrl}
              title={resumeName || "Resume Document"}
              className="h-full w-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setHasError(true);
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-3xl text-brand dark:bg-brand/20">
                <FiFileText />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {resumeName}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Word documents can be viewed by downloading or opening in Word / Google Docs.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={fullUrl}
                  download={resumeName || "Resume"}
                  className="flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90"
                >
                  <FiDownload /> Download Resume
                </a>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <FiExternalLink /> Open File Directly
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
