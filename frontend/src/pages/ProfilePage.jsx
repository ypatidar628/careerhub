import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiFileText,
  FiMapPin,
  FiUpload,
  FiBookmark,
  FiSettings,
  FiPhone,
  FiEye,
  FiDownload,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";
import client from "../api/client";
import { updateUser } from "../store/authSlice";
import SavedJobs from "../components/jobs/SavedJobs";
import ResumePreviewModal, { getFullResumeUrl } from "../components/common/ResumePreviewModal";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const resumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const profile = user?.profile || {};

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "saved"
  const [form, setForm] = useState({
    phone: user?.phone || "",
    location: profile.location || "",
    experience: profile.experience || "",
    bio: profile.bio || "",
    skills: (profile.skills || []).join(", "),
  });
  const [preview, setPreview] = useState(
    profile.avatarUrl || user?.profileImage,
  );
  const [resumeName, setResumeName] = useState(profile.resumeName || "");
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || "");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [deletingResume, setDeletingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || "",
        location: user.profile?.location || "",
        experience: user.profile?.experience || "",
        bio: user.profile?.bio || "",
        skills: (user.profile?.skills || user.skills || []).join(", "),
      });
      setPreview(user.profile?.avatarUrl || user.profileImage);
      setResumeName(user.profile?.resumeName || "");
      setResumeUrl(user.profile?.resumeUrl || "");
    }
  }, [user]);

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      const { data } = await client.patch("/profile", payload);
      dispatch(updateUser(data.user));
      toast.success("Profile saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const upload = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isAvatar = kind === "avatar";
    const validType = isAvatar
      ? imageTypes.includes(file.type)
      : resumeTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx)$/i);
    const validSize = file.size <= (isAvatar ? 5 : 10) * 1024 * 1024;

    if (!validType || !validSize) {
      toast.error(
        isAvatar
          ? "Choose a JPG, PNG, or WEBP image under 5 MB."
          : "Choose a PDF, DOC, or DOCX file under 10 MB.",
      );
      event.target.value = "";
      return;
    }

    if (isAvatar) setPreview(URL.createObjectURL(file));
    setUploading(kind);
    const formData = new FormData();
    formData.append(kind, file);

    try {
      const { data } = await client.post(`/profile/${kind}`, formData);
      if (isAvatar) {
        setPreview(data.url);
        dispatch(updateUser(data.user));
      } else {
        setResumeName(data.name);
        setResumeUrl(data.url);
        dispatch(
          updateUser(
            data.user || {
              ...user,
              profile: {
                ...user.profile,
                resumeUrl: data.url,
                resumeName: data.name,
              },
            },
          ),
        );
      }
      toast.success(`${isAvatar ? "Profile image" : "Resume"} uploaded.`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const removeResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;
    setDeletingResume(true);
    try {
      const { data } = await client.delete("/profile/resume");
      setResumeName("");
      setResumeUrl("");
      dispatch(updateUser(data.user));
      toast.success("Resume removed successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove resume.",
      );
    } finally {
      setDeletingResume(false);
    }
  };

  const isCandidate = user?.role === "candidate";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="overflow-hidden rounded-3xl bg-linear-to-r from-brand to-cyan-600 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {user?.role?.toUpperCase()} ACCOUNT
            </span>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {user?.name}'s Profile
            </h1>
            <p className="mt-1 max-w-xl text-xs text-white/80 sm:text-sm">
              Keep your experience, skills, and portfolio up to date for recruiters.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-semibold backdrop-blur-xs">
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-300" /> Account Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "profile"
              ? "bg-brand text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <FiSettings /> Personal Profile
        </button>

        {isCandidate && (
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "saved"
                ? "bg-brand text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <FiBookmark /> Saved Jobs
          </button>
        )}
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === "profile" && (
        <form
          onSubmit={saveProfile}
          className="grid gap-6 lg:grid-cols-[1fr_320px]"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                General Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Manage your public resume information and contact points.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
                <input
                  value={user?.name || ""}
                  readOnly
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                />
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
                <input
                  value={user?.email || ""}
                  readOnly
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                />
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phone Number
                <span className="relative block mt-1.5">
                  <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
                  />
                </span>
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Location
                <span className="relative block mt-1.5">
                  <FiMapPin className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    name="location"
                    value={form.location}
                    onChange={change}
                    placeholder="Bengaluru, India"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
                  />
                </span>
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">
                Years of Experience
                <input
                  name="experience"
                  value={form.experience}
                  onChange={change}
                  placeholder="e.g. 4+ years of Full Stack Development"
                  className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
                />
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">
                Skills (comma-separated)
                <input
                  name="skills"
                  value={form.skills}
                  onChange={change}
                  placeholder="React, Node.js, TypeScript, Tailwind CSS, PostgreSQL"
                  className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
                />
              </label>

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">
                Professional Bio
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={change}
                  rows="4"
                  placeholder="Share a short overview of your background, achievements, and what you are looking for in your next role."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 rounded-2xl bg-brand px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </section>

          {/* Right column: Avatar & Resume */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-brand/20 bg-brand/10 text-3xl font-bold text-brand">
                {preview ? (
                  <img
                    className="h-full w-full object-cover"
                    src={preview}
                    alt="Profile preview"
                  />
                ) : (
                  user?.name?.[0]
                )}
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {user?.role === "recruiter" ? "Recruiter / Hiring Manager" : "Candidate"}
              </p>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand bg-brand/5 px-4 py-2.5 text-xs font-bold text-brand transition hover:bg-brand/10 dark:border-brand dark:bg-brand/15">
                <FiUpload />
                {uploading === "avatar" ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={Boolean(uploading)}
                  onChange={(event) => upload(event, "avatar")}
                />
              </label>
              <p className="mt-2 text-[10px] text-slate-400">
                JPG, PNG, WEBP, or GIF under 5 MB
              </p>
            </section>

            {isCandidate && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Candidate Resume
                  </h3>
                  {resumeUrl && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <FiCheckCircle className="text-[11px]" /> Active
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {resumeUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
                          <FiFileText className="text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={resumeName}>
                            {resumeName || "Uploaded Resume"}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Attached to job applications
                          </p>
                        </div>
                      </div>

                      {/* Resume actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewModalOpen(true)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
                        >
                          <FiEye /> Preview
                        </button>

                        <a
                          href={getFullResumeUrl(resumeUrl)}
                          download={resumeName || "Resume.pdf"}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <FiDownload /> Download
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand dark:text-slate-400 dark:hover:text-brand">
                          <FiUpload />
                          <span>{uploading === "resume" ? "Uploading..." : "Replace Resume"}</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            disabled={Boolean(uploading)}
                            onChange={(event) => upload(event, "resume")}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeResume}
                          disabled={deletingResume}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 transition hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-50"
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-xl text-brand dark:bg-brand/20">
                        <FiFileText />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No resume uploaded
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Upload your resume to easily apply to jobs with one click.
                      </p>

                      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90">
                        <FiUpload />
                        {uploading === "resume" ? "Uploading..." : "Upload Resume"}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          disabled={Boolean(uploading)}
                          onChange={(event) => upload(event, "resume")}
                        />
                      </label>
                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        PDF, DOC, or DOCX under 10 MB
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </aside>
        </form>
      )}

      {/* Tab 2: Saved Jobs */}
      {activeTab === "saved" && isCandidate && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Bookmarked Jobs
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Review and apply to jobs you've saved.
              </p>
            </div>
          </div>
          <SavedJobs />
        </section>
      )}

      {/* Resume Preview Modal */}
      {isCandidate && resumeUrl && (
        <ResumePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          resumeUrl={resumeUrl}
          resumeName={resumeName || "Candidate Resume.pdf"}
        />
      )}
    </div>
  );
}
