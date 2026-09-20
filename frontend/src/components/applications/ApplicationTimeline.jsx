import { FiCheck, FiClock, FiX, FiAlertCircle } from "react-icons/fi";

export default function ApplicationTimeline({ application }) {
  const allStages = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
  ];

  const currentStatus = application?.status || "Applied";
  const history = application?.statusHistory || [];
  const isTerminalNegative = ["Rejected", "Withdrawn"].includes(currentStatus);

  const currentStageIndex = allStages.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Progress Stepper Bar (if not rejected/withdrawn) */}
      {!isTerminalNegative && (
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-700" />
          <div
            className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 bg-brand transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStageIndex) / (allStages.length - 1)) * 100}%`,
            }}
          />

          {allStages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold transition ${
                    isCompleted
                      ? "border-brand bg-brand text-white shadow-sm"
                      : isCurrent
                      ? "border-brand bg-white text-brand ring-4 ring-brand/20 dark:bg-slate-900"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800"
                  }`}
                >
                  {isCompleted ? <FiCheck className="text-sm font-bold" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-center text-[11px] font-semibold ${
                    isCurrent
                      ? "text-brand"
                      : isCompleted
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal banner for Rejected / Withdrawn */}
      {isTerminalNegative && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${
            currentStatus === "Rejected"
              ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
              : "border border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <FiAlertCircle className="shrink-0 text-xl" />
          <div>
            <p className="font-bold">Application {currentStatus}</p>
            <p className="text-xs opacity-80">
              {currentStatus === "Rejected"
                ? "The recruiter has decided to proceed with other candidates at this stage."
                : "You withdrew this application."}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Status History List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Status History & Notes
        </h4>

        <div className="space-y-3">
          {history.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.status}
                  </span>
                  <time className="text-slate-400">
                    {new Date(item.changedAt || Date.now()).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                {item.note && (
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    {item.note}
                  </p>
                )}
                {item.changedByName && (
                  <p className="text-[10px] text-slate-400">
                    Updated by {item.changedByName} ({item.changedByRole})
                  </p>
                )}
              </div>
            </div>
          ))}

          {!history.length && (
            <p className="text-xs text-slate-400">
              Application submitted on {new Date(application?.createdAt || Date.now()).toLocaleDateString()}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
