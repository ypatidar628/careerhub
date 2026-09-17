import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiFileText,
  FiMapPin,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import client from "../api/client";
import { updateUser } from "../store/authSlice";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const resumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const profile = user.profile || {};
  const [form, setForm] = useState({
    phone: user.phone || "",
    location: profile.location || "",
    experience: profile.experience || "",
    bio: profile.bio || "",
  });
  const [preview, setPreview] = useState(
    profile.avatarUrl || user.profileImage,
  );
  const [resume, setResume] = useState(profile.resumeName);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    setForm({
      phone: user.phone || "",
      location: user.profile?.location || "",
      experience: user.profile?.experience || "",
      bio: user.profile?.bio || "",
    });
    setPreview(user.profile?.avatarUrl || user.profileImage);
    setResume(user.profile?.resumeName);
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
      const { data } = await client.patch("/profile", form);
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
    const validType = (isAvatar ? imageTypes : resumeTypes).includes(file.type);
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
        setResume(data.name);
        dispatch(
          updateUser({
            ...user,
            profile: {
              ...user.profile,
              resumeUrl: data.url,
              resumeName: data.name,
            },
          }),
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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-cyan-500 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
              Candidate profile
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Make your next move count.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Keep your details current so recruiters can quickly understand
              your experience.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur">
            <span className="block text-white/70">Profile status</span>
            <strong className="mt-1 flex items-center gap-2">
              <FiCheckCircle /> Active
            </strong>
          </div>
        </div>
      </div>

      <form
        onSubmit={saveProfile}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]"
      >
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold dark:text-white">
              Personal details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tell employers where you are and what you do best.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Full name
              <input
                value={user.name}
                readOnly
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold">
              Email address
              <input
                value={user.email}
                readOnly
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold">
              Phone number
              <input
                name="phone"
                value={form.phone}
                onChange={change}
                placeholder="+91 98765 43210"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600"
              />
            </label>
            <label className="text-sm font-semibold">
              Location
              <span className="relative block">
                <FiMapPin className="absolute left-3 top-4 text-slate-400" />
                <input
                  name="location"
                  value={form.location}
                  onChange={change}
                  placeholder="Bengaluru, India"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 pl-10 outline-none focus:border-brand dark:border-slate-600"
                />
              </span>
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Years of experience
              <input
                name="experience"
                value={form.experience}
                onChange={change}
                placeholder="e.g. 5 years"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600"
              />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Professional bio
              <textarea
                name="bio"
                value={form.bio}
                onChange={change}
                rows="5"
                placeholder="Share a short introduction about your strengths and goals."
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-brand/20 bg-brand/10 text-4xl font-bold text-brand">
              {preview ? (
                <img
                  className="h-full w-full object-cover"
                  src={preview}
                  alt="Profile preview"
                />
              ) : (
                user.name?.[0]
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold dark:text-white">
              {user.name}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500">
              <FiUser /> {user.role}
            </p>
            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand px-4 py-3 text-sm font-bold text-brand transition hover:bg-brand/5">
              <FiUpload />
              {uploading === "avatar" ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={Boolean(uploading)}
                onChange={(event) => upload(event, "avatar")}
              />
            </label>
            <p className="mt-3 text-xs text-slate-500">
              JPG, PNG, or WEBP up to 5 MB
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <FiFileText />
              </div>
              <div>
                <h2 className="font-bold dark:text-white">Resume</h2>
                <p className="text-xs text-slate-500">
                  {resume || "No resume uploaded yet"}
                </p>
              </div>
            </div>
            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200">
              <FiUpload />
              {uploading === "resume" ? "Uploading..." : "Upload resume"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={Boolean(uploading)}
                onChange={(event) => upload(event, "resume")}
              />
            </label>
            <p className="mt-3 text-xs text-slate-500">
              PDF, DOC, or DOCX up to 10 MB
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}
