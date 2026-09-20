import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiBriefcase, FiCheckCircle } from "react-icons/fi";
import client from "../api/client";
import CustomSelect from "../components/common/CustomSelect";

const initialForm = {
  title: "",
  company: "",
  location: "",
  category: "Engineering",
  mode: "Hybrid",
  experience: "",
  salary: "",
  description: "",
  skills: "",
  requirements: "",
};

const CATEGORY_OPTIONS = [
  { label: "Engineering", value: "Engineering" },
  { label: "Design", value: "Design" },
  { label: "Product", value: "Product" },
  { label: "Data", value: "Data" },
  { label: "DevOps", value: "DevOps" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
];

const MODE_OPTIONS = [
  { label: "Hybrid", value: "Hybrid" },
  { label: "Remote", value: "Remote" },
  { label: "On-site", value: "On-site" },
];

const splitLines = (value) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function PostJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    client
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        const job = data.job;
        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          category: job.category || "Engineering",
          mode: job.mode || "Hybrid",
          experience: job.experience || "",
          salary: job.salary || "",
          description: job.description || "",
          skills: (job.skills || []).join(", "),
          requirements: (job.requirements || []).join("\n"),
        });
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Unable to load this job.",
        );
        navigate("/manage-jobs");
      })
      .finally(() => setLoading(false));
  }, [editing, id, navigate]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      toast.error("Add a job title and location.");
      return;
    }
    if (form.description.trim().length < 30) {
      toast.error("Add a description of at least 30 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        category: form.category,
        mode: form.mode,
        experience: form.experience.trim() || "Not specified",
        salary: form.salary.trim() || "Not disclosed",
        description: form.description.trim(),
        skills: splitLines(form.skills),
        requirements: splitLines(form.requirements),
        status: "Active",
      };
      const { data } = editing
        ? await client.patch(`/jobs/${id}`, payload)
        : await client.post("/jobs", payload);
      toast.success(
        editing ? "Job updated successfully." : "Job posted successfully.",
      );
      navigate(editing ? "/manage-jobs" : `/jobs/${data.job.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to post this job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand"
      >
        <FiArrowLeft /> Back to dashboard
      </button>

      <div className="overflow-hidden rounded-3xl bg-linear-to-r from-ink to-brand p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/15 p-3 text-2xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
              Recruiter workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              {editing
                ? "Keep your opportunity current."
                : "Post your next great opportunity."}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Share the details candidates need to understand the role and make
              a confident application.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading job details...</p>
      ) : (
        <form
          onSubmit={submit}
          className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
        >
          <section>
            <h2 className="text-xl font-bold dark:text-white">
              Role information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start with the essentials candidates will see first.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Job title *
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
              <label className="text-sm font-semibold">
                Company name
                <input
                  name="company"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Defaults to your name"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
              <label className="text-sm font-semibold">
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  required
                  placeholder="e.g. Bengaluru or Remote"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
              <div>
                <CustomSelect
                  label="Category"
                  value={form.category}
                  options={CATEGORY_OPTIONS}
                  onChange={(val) => updateField("category", val)}
                />
              </div>
              <div>
                <CustomSelect
                  label="Work Mode"
                  value={form.mode}
                  options={MODE_OPTIONS}
                  onChange={(val) => updateField("mode", val)}
                />
              </div>
              <label className="text-sm font-semibold">
                Experience
                <input
                  name="experience"
                  value={form.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  placeholder="e.g. 3–5 years"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
              <label className="text-sm font-semibold">
                Salary
                <input
                  name="salary"
                  value={form.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                  placeholder="e.g. ₹18–24 LPA"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <h2 className="text-xl font-bold dark:text-white">
              Role description
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block text-sm font-semibold">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  minLength={30}
                  rows={7}
                  placeholder="Describe the team, impact, responsibilities, and what success looks like."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Skills
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                    rows={4}
                    placeholder={"React, Node.js\nTypeScript"}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Separate skills with commas or new lines.
                  </span>
                </label>
                <label className="text-sm font-semibold">
                  Requirements
                  <textarea
                    name="requirements"
                    value={form.requirements}
                    onChange={(e) => updateField("requirements", e.target.value)}
                    rows={4}
                    placeholder={"3+ years of experience\nStrong communication"}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-brand dark:border-slate-600 dark:text-white"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Add one requirement per line.
                  </span>
                </label>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <FiCheckCircle className="text-emerald-500" />
              Your listing will be visible immediately.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? editing
                  ? "Saving changes..."
                  : "Posting job..."
                : editing
                  ? "Save changes"
                  : "Post job"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
