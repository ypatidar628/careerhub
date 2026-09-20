import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiMessageCircle,
  FiFileText,
  FiDownload,
  FiClock,
  FiMapPin,
  FiBriefcase,
  FiChevronRight,
  FiEye,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import client from "../api/client";
import StatusBadge from "../components/applications/StatusBadge";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ChatModal from "../components/chat/ChatModal";
import CustomSelect from "../components/common/CustomSelect";

export default function ApplicationsPage() {
  const user = useSelector((s) => s.auth.user);
  const [items, setItems] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for recruiter
  const [jobFilter, setJobFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recruiterJobs, setRecruiterJobs] = useState([]);

  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatApp, setChatApp] = useState(null);

  const recruiter = user?.role === "recruiter" || user?.role === "admin";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (jobFilter) params.jobId = jobFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await client.get(
        recruiter ? "/applications" : "/applications/mine",
        { params },
      );
      setItems(data.applications || []);
      setStages(data.stages || []);
    } catch {
      toast.error("Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, [recruiter, jobFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Load recruiter's posted jobs for filter dropdown
  useEffect(() => {
    if (recruiter) {
      client
        .get("/jobs/mine")
        .then(({ data }) => setRecruiterJobs(data.jobs || []))
        .catch(() => {});
    }
  }, [recruiter]);

  const updateStage = async (id, status) => {
    try {
      await client.patch(`/applications/${id}`, { status });
      toast.success(`Applicant moved to ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update stage.");
    }
  };

  const withdrawApplication = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await client.patch(`/applications/${id}/withdraw`);
      toast.success("Application withdrawn.");
      setDetailsModalOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to withdraw application.");
    }
  };

  const openChatForApp = (app) => {
    setChatApp(app);
    setChatModalOpen(true);
  };

  const openDetailsForApp = (app) => {
    setSelectedApp(app);
    setDetailsModalOpen(true);
  };

  const getFullFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${backendUrl}${url}`;
  };

  const jobOptions = [
    { label: "All Posted Jobs", value: "" },
    ...recruiterJobs.map((j) => ({
      label: `${j.title} (${j.applicantsCount || 0})`,
      value: j.id || j._id,
    })),
  ];

  const statusOptions = [
    { label: "All Stages", value: "" },
    ...stages.map((s) => ({ label: s, value: s })),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:bg-brand/20">
            {recruiter ? "RECRUITER PIPELINE" : "CANDIDATE APPLICATIONS"}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
            {recruiter ? "Applicant Pipeline Management" : "My Submitted Applications"}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {recruiter
              ? "Review applicant profiles, change pipeline stages, inspect resumes, and message candidates in real time."
              : "Track your active job applications, timeline updates, and direct recruiter conversations."}
          </p>
        </div>
      </div>

      {/* Recruiter Filters */}
      {recruiter && (
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-800">
          <div className="w-full sm:w-64">
            <CustomSelect
              value={jobFilter}
              onChange={setJobFilter}
              options={jobOptions}
              placeholder="Filter by Job"
              size="sm"
            />
          </div>

          <div className="w-full sm:w-48">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Filter by Stage"
              size="sm"
            />
          </div>

          {(jobFilter || statusFilter) && (
            <button
              onClick={() => {
                setJobFilter("");
                setStatusFilter("");
              }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Reset filters
            </button>
          )}

          <div className="ml-auto text-xs font-bold text-slate-500">
            {items.length} Applicant{items.length === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {/* Applications List */}
      {!loading && (
        <div className="space-y-4">
          {items.map((item) => {
            const appId = item.id || item._id;

            return (
              <article
                key={appId}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-800 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {recruiter ? item.candidateName : item.jobTitle}
                      </h2>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {recruiter ? (
                        <>
                          <span className="font-semibold text-brand">{item.jobTitle}</span>
                          <span>{item.candidateEmail}</span>
                          {item.candidateProfile?.location && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="text-brand" /> {item.candidateProfile.location}
                            </span>
                          )}
                          {item.score && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Match: {item.score}%
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-brand">{item.company}</span>
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-brand" /> {item.location || "Remote"} ({item.mode || "Hybrid"})
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="text-brand" /> Applied {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Candidate Skills if recruiter */}
                    {recruiter && item.candidateProfile?.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.candidateProfile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {recruiter ? (
                      <>
                        {/* Resume preview */}
                        {item.resumeUrl && (
                          <a
                            href={getFullFileUrl(item.resumeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <FiFileText /> Resume
                          </a>
                        )}

                        {/* Status Change Dropdown */}
                        <div className="w-36">
                          <CustomSelect
                            value={item.status}
                            onChange={(val) => updateStage(appId, val)}
                            options={stages.map((s) => ({ label: s, value: s }))}
                            size="sm"
                          />
                        </div>

                        {/* Chat button */}
                        <button
                          type="button"
                          onClick={() => openChatForApp(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand/90"
                        >
                          <FiMessageCircle /> Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openDetailsForApp(item)}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <FiEye /> View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => openChatForApp(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand/90"
                        >
                          <FiMessageCircle /> Chat with Recruiter
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {!items.length && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-2xl text-brand dark:bg-brand/20">
                <FiBriefcase />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {recruiter ? "No applicants in this view" : "You have not submitted any applications yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {recruiter
                  ? "When candidates apply to your job postings, they will appear here for review."
                  : "Explore available jobs and apply to connect directly with hiring managers."}
              </p>
              {!recruiter && (
                <Link
                  to="/jobs"
                  className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
                >
                  Explore Jobs
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApp}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onOpenChat={openChatForApp}
        onWithdraw={withdrawApplication}
        isRecruiter={recruiter}
      />

      {/* Chat Modal */}
      <ChatModal
        application={chatApp}
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  );
}
