import { Link } from "react-router-dom";
import { FiMapPin, FiBookmark } from "react-icons/fi";
export default function JobCard({ job }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-[0_22px_45px_-20px_rgba(99,91,255,.5)] dark:border-slate-700 dark:bg-slate-800">
      <div className="flex justify-between">
        <div>
          <p className="font-mono-display text-xs font-semibold text-brand">
            {job.company}
          </p>
          <h3 className="mt-1 text-xl font-bold dark:text-white">
            {job.title}
          </h3>
        </div>
        <FiBookmark className="text-slate-400 transition group-hover:scale-110 group-hover:text-brand" />
      </div>
      <p className="mt-3 flex items-center gap-1 text-sm text-slate-500">
        <FiMapPin />
        {job.location} · {job.mode}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills?.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span>{job.salary}</span>
        <Link
          className="font-bold text-brand transition group-hover:translate-x-1"
          to={`/jobs/${job.id}`}
        >
          View role →
        </Link>
      </div>
    </article>
  );
}
