import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiCheck,
  FiX,
  FiFileText,
  FiUpload,
  FiEye,
  FiDownload,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiBookmark,
} from "react-icons/fi";
import client from "../api/client";
import { updateUser } from "../store/authSlice";
import ProfileSummary from "../components/profile/ProfileSummary";
import PersonalInformation from "../components/profile/PersonalInformation";
import ContactInformation from "../components/profile/ContactInformation";
import SkillsSection from "../components/profile/SkillsSection";
import AboutSection from "../components/profile/AboutSection";
import ResumePreviewModal, { getFullResumeUrl } from "../components/common/ResumePreviewModal";
import SavedJobs from "../components/jobs/SavedJobs";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const resumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(""); // "avatar" | "resume"
  const [deletingResume, setDeletingResume] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeView, setActiveView] = useState("profile"); // "profile" | "saved"

  // Platform statistics
  const [stats, setStats] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
    enrollmentNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    skills: [],
    bio: "",
  });

  const [preview, setPreview] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Sync user state into form
  const populateForm = useCallback(() => {
    if (!user) return;
    const profile = user.profile || {};
    setForm({
      name: user.name || "",
      phone: user.phone || profile.phone || "",
      department: profile.department || profile.education || "",
      enrollmentNumber: profile.enrollmentNumber || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      postalCode: profile.postalCode || "",
      skills: profile.skills?.length > 0 ? profile.skills : user.skills || [],
      bio: profile.bio || user.bio || "",
    });
    setPreview(profile.avatarUrl || user.profileImage || "");
    setResumeName(profile.resumeName || user.resume?.fileName || "");
    setResumeUrl(profile.resumeUrl || user.resume?.url || "");
    setErrors({});
  }, [user]);

  useEffect(() => {
    populateForm();
  }, [populateForm]);

  // Load real user stats from dashboard
  useEffect(() => {
    let isMounted = true;
    client
      .get("/dashboard")
      .then(({ data }) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddSkill = (skill) => {
    if (!form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleRemoveSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (form.phone && !/^[+0-9\s-()]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelEdit = () => {
    populateForm();
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Please resolve validation errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        enrollmentNumber: form.enrollmentNumber.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
        skills: form.skills,
        bio: form.bio.trim(),
        location:
          form.city && form.country
            ? `${form.city}, ${form.country}`
            : form.city || form.country || "",
      };

      const { data } = await client.patch("/profile", payload);
      dispatch(updateUser(data.user));
      setIsEditing(false);
      toast.success("✓ Profile updated successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!imageTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a JPG, PNG, WEBP, or GIF image under 5 MB.");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading("avatar");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { data } = await client.post("/profile/avatar", formData);
      setPreview(data.url);
      dispatch(updateUser(data.user));
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to upload photo. Please try again.",
      );
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validType =
      resumeTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx)$/i);
    const validSize = file.size <= 10 * 1024 * 1024;

    if (!validType || !validSize) {
      toast.error("Choose a PDF, DOC, or DOCX file under 10 MB.");
      event.target.value = "";
      return;
    }

    setUploading("resume");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await client.post("/profile/resume", formData);
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
      toast.success("Resume uploaded successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Resume upload failed. Please try again.",
      );
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;
    setDeletingResume(true);
    try {
      const { data } = await client.delete("/profile/resume");
      setResumeName("");
      setResumeUrl("");
      dispatch(updateUser(data.user));
      toast.success("Resume removed successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove resume.",
      );
    } finally {
      setDeletingResume(false);
    }
  };

  const isCandidate = user?.role === "candidate";

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* 2-Column Responsive Layout: Left: Profile Summary, Right: Account Information */}
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* LEFT COLUMN: Profile Summary Card */}
        <aside className="space-y-6">
          <ProfileSummary
            user={user}
            stats={stats}
            preview={preview}
            uploading={uploading}
            onImageChange={handleImageChange}
          />
        </aside>

        {/* RIGHT COLUMN: Account Information Card */}
        <main className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Account Card Header with Edit/Save Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                  CareerHub Account
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                  My Account
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Manage your personal details, contact coordinates, and qualifications.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90 active:scale-95"
                  >
                    <FiEdit2 className="text-sm" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <FiX className="text-sm" />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                    >
                      <FiCheck className="text-sm" />
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Form Sections */}
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-8">
              {/* 1. Personal Information */}
              <PersonalInformation
                form={form}
                user={user}
                isEditing={isEditing}
                onChange={handleChange}
                errors={errors}
              />

              {/* 2. Contact Information */}
              <ContactInformation
                form={form}
                isEditing={isEditing}
                onChange={handleChange}
              />

              {/* 3. Skills Section */}
              <SkillsSection
                skills={form.skills}
                isEditing={isEditing}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />

              {/* 4. About Me */}
              <AboutSection
                bio={form.bio}
                isEditing={isEditing}
                onChange={handleChange}
              />

              {/* Save changes footer button when editing on mobile */}
              {isEditing && (
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand/90 disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Candidate Resume Section (Only for Candidate role) */}
          {isCandidate && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Candidate Resume
                  </h3>
                  <p className="text-xs text-slate-400">
                    Attached automatically when applying for new positions.
                  </p>
                </div>

                {resumeUrl && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="text-[11px]" /> Active Resume
                  </span>
                )}
              </div>

              <div className="mt-5">
                {resumeUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xl font-bold text-brand dark:bg-brand/20">
                        <FiFileText />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200" title={resumeName}>
                          {resumeName || "Uploaded Resume"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          Ready for 1-click job applications
                        </p>
                      </div>
                    </div>

                    {/* Resume actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalOpen(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
                        >
                          <FiEye /> View Resume
                        </button>

                        <a
                          href={getFullResumeUrl(resumeUrl)}
                          download={resumeName || "Resume.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <FiDownload /> Download
                        </a>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-brand dark:text-slate-400 dark:hover:text-brand">
                          <FiUpload />
                          <span>{uploading === "resume" ? "Uploading..." : "Replace Resume"}</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            disabled={Boolean(uploading)}
                            onChange={handleResumeUpload}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          disabled={deletingResume}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 transition hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-50"
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                    <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-xl text-brand dark:bg-brand/20">
                      <FiFileText />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No resume uploaded yet
                    </p>
                    <p className="mt-1 max-w-sm text-[11px] text-slate-400">
                      Upload your latest resume (PDF, DOC, DOCX) to apply to active jobs instantly.
                    </p>

                    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90">
                      <FiUpload />
                      <span>{uploading === "resume" ? "Uploading..." : "Upload Resume"}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        disabled={Boolean(uploading)}
                        onChange={handleResumeUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved Jobs Section (Candidate only) */}
          {isCandidate && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Saved Opportunities
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jobs bookmarked for later review and application.
                  </p>
                </div>
              </div>
              <SavedJobs />
            </div>
          )}
        </main>
      </div>

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
