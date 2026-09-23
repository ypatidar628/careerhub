import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import client from "../api/client";
import AppliedJobDetails from "../components/applications/AppliedJobDetails";
import ApplicantDetails from "../components/applications/ApplicantDetails";
import ChatModal from "../components/chat/ChatModal";

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [application, setApplication] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const isRecruiter = user?.role === "recruiter" || user?.role === "admin";

  const loadApplication = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await client.get(`/applications/${id}`);
      setApplication(data.application);
      if (data.stages) setStages(data.stages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleUpdateStage = async (appId, status, note) => {
    try {
      const { data } = await client.patch(`/applications/${appId}`, {
        status,
        note,
      });
      setApplication(data.application);
      toast.success(`Application updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update stage.");
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      const { data } = await client.patch(`/applications/${appId}/withdraw`);
      setApplication(data.application);
      toast.success("Application withdrawn.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to withdraw application.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/applications")}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <FiArrowLeft className="text-base" />
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
      )}

      {/* Not Found state */}
      {!loading && !application && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <FiAlertCircle className="mb-3 text-4xl text-rose-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Application Not Found
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            The requested application could not be found or you do not have permission to view it.
          </p>
          <Link
            to="/applications"
            className="mt-4 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            Go to Applications
          </Link>
        </div>
      )}

      {/* Loaded Content */}
      {!loading && application && (
        <>
          {isRecruiter ? (
            <ApplicantDetails
              application={application}
              onOpenChat={() => setChatOpen(true)}
              onUpdateStage={handleUpdateStage}
              stages={stages.length ? stages : undefined}
              isPage={true}
            />
          ) : (
            <AppliedJobDetails
              application={application}
              onOpenChat={() => setChatOpen(true)}
              onWithdraw={handleWithdraw}
              isPage={true}
            />
          )}

          {/* Chat Modal */}
          <ChatModal
            application={application}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        </>
      )}
    </div>
  );
}
