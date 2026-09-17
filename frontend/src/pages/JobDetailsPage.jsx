import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import client from "../api/client";
import { jobs } from "../data/mockData";
// Candidate-only form gathers the application context before calling the protected API.
export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(jobs.find((j) => j.id === id));
  const [saved, setSaved] = useState(
    JSON.parse(localStorage.getItem("saved_jobs") || "[]").includes(id),
  );
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const user = useSelector((s) => s.auth.user);
  const nav = useNavigate();
  useEffect(() => {
    client
      .get(`/jobs/${id}`)
      .then(({ data }) => setJob(data.job))
      .catch(() => {});
  }, [id]);
  if (!job) return <main className="p-10">Role not found.</main>;
  const toggle = () => {
    const list = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
    localStorage.setItem(
      "saved_jobs",
      JSON.stringify(saved ? list.filter((x) => x !== id) : [...list, id]),
    );
    setSaved(!saved);
    toast.success(saved ? "Removed from saved jobs" : "Job saved");
  };
  const apply = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/jobs/${id}/applications`, {
        coverLetter,
        resumeUrl: user.profile?.resumeUrl,
      });
      toast.success("Application submitted — good luck!");
      setApplying(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to submit application.",
      );
    }
  };
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="font-bold text-brand">{job.company}</p>
      <h1 className="mt-2 text-4xl font-bold dark:text-white">{job.title}</h1>
      <p className="mt-3 text-slate-500">
        {job.location} · {job.mode} · {job.experience} · {job.salary}
      </p>
      <div className="mt-7 flex gap-3">
        <button
          onClick={() =>
            !user
              ? nav("/auth")
              : user.role !== "candidate"
                ? toast.error("Only candidate accounts can apply.")
                : setApplying(true)
          }
          className="rounded-xl bg-brand px-6 py-3 font-bold text-white"
        >
          Apply now
        </button>
        <button
          onClick={toggle}
          className="rounded-xl border border-slate-300 px-5 py-3 dark:border-slate-700"
        >
          {saved ? "Saved" : "Save job"}
        </button>
      </div>
      {applying && (
        <form
          onSubmit={apply}
          className="mt-7 rounded-2xl border border-brand/30 bg-brand/5 p-6"
        >
          <h2 className="text-xl font-bold">Complete application</h2>
          <p className="mt-1 text-sm text-slate-500">
            Resume:{" "}
            {user.profile?.resumeName ||
              "No resume uploaded — add one in your profile."}
          </p>
          <label className="mt-4 block text-sm font-medium">
            Cover letter
            <textarea
              required
              minLength="30"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-white p-3 dark:bg-slate-800"
              rows="5"
              placeholder="Tell the hiring team why you are a great fit."
            />
          </label>
          <button className="mt-4 rounded-xl bg-brand px-5 py-3 font-bold text-white">
            Submit application
          </button>
        </form>
      )}
      <section className="mt-10 rounded-2xl border border-slate-200 p-7 dark:border-slate-700">
        <h2 className="text-xl font-bold dark:text-white">About the role</h2>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          {job.description}
        </p>
        <h2 className="mt-8 text-xl font-bold dark:text-white">
          What you’ll bring
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-slate-600 dark:text-slate-300">
          {(
            job.requirements || [
              "A drive to build excellent work",
              "Collaborative communication",
              "Relevant role experience",
            ]
          ).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
