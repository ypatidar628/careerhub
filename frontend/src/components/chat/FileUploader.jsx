import { useState, useRef } from "react";
import { FiPaperclip, FiX, FiFile, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client";

export default function FileUploader({ onAttachmentUploaded, disabled }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select an image (JPG/PNG/WEBP) or document (PDF/DOC/DOCX).");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("attachment", file);

    try {
      const { data } = await client.post("/upload/attachment", formData);
      onAttachmentUploaded(data.attachment);
      toast.success("Attachment ready!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload attachment.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Attach file or image"
        title="Attach file (Images, PDF, DOC up to 10MB)"
        className={`flex items-center justify-center rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-brand dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand ${
          uploading ? "animate-pulse opacity-50" : ""
        }`}
      >
        <FiPaperclip className="text-lg" />
      </button>
    </div>
  );
}
