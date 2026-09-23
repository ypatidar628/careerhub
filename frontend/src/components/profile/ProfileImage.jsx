import { FiCamera, FiUpload } from "react-icons/fi";

export default function ProfileImage({
  imageUrl,
  name,
  uploading,
  onImageChange,
}) {
  return (
    <div className="relative mx-auto flex flex-col items-center">
      {/* Circular Avatar */}
      <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-tr from-brand to-indigo-600 shadow-xl dark:border-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || "Profile avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl sm:text-4xl font-black text-white">
            {name?.[0]?.toUpperCase() || "U"}
          </span>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white backdrop-blur-2xs">
            Uploading...
          </div>
        )}
      </div>

      {/* Change Photo Trigger */}
      <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand">
        <FiCamera className="text-sm" />
        <span>{uploading ? "Uploading..." : "Change Photo"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={Boolean(uploading)}
          onChange={onImageChange}
        />
      </label>
    </div>
  );
}
