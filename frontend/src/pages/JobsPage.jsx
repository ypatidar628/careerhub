import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../api/client";
import JobCard from "../components/jobs/JobCard";
import { jobs as fallback } from "../data/mockData";
export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const search = params.get("search") || "";
  useEffect(() => {
    client
      .get("/jobs", { params: { search } })
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => {
        setJobs(
          fallback.filter((j) =>
            JSON.stringify(j).toLowerCase().includes(search.toLowerCase()),
          ),
        );
      })
      .finally(() => setLoading(false));
  }, [search]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
      <h1 className="text-3xl font-bold dark:text-white sm:text-4xl">
        Find your next role
      </h1>
      <input
        className="mt-6 w-full max-w-xl rounded-xl border border-slate-300 bg-transparent p-4 outline-brand dark:border-slate-700"
        value={search}
        onChange={(e) =>
          setParams(e.target.value ? { search: e.target.value } : {})
        }
        placeholder="Search title, company, location, or skill"
        aria-label="Search jobs"
      />
      {loading ? (
        <p className="mt-8">Loading roles…</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
      {!loading && !jobs.length && (
        <p className="mt-8 text-slate-500">No roles matched that search.</p>
      )}
    </main>
  );
}
