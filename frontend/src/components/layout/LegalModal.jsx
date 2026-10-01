import { useEffect } from "react";
import { FiX, FiShield, FiFileText } from "react-icons/fi";

export default function LegalModal({ isOpen, type, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions";
  const Icon = isPrivacy ? FiShield : FiFileText;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-700/80 bg-slate-900 p-6 text-white shadow-2xl dark:border-slate-800 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-xl text-brand dark:bg-brand/20 dark:text-indigo-400">
              <Icon />
            </div>
            <div>
              <h3
                id="legal-modal-title"
                className="text-xl font-bold tracking-tight text-white"
              >
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                Last updated: October 2026 • CareerHub Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-4 overflow-y-auto py-5 pr-2 text-sm leading-relaxed text-slate-300">
          {isPrivacy ? (
            <>
              <section className="space-y-2">
                <h4 className="font-semibold text-white">1. Information We Collect</h4>
                <p>
                  CareerHub collects information you provide directly when creating
                  an account, posting jobs, submitting job applications, and communicating
                  with recruiters. This includes your name, email, phone number, work
                  experience, and resumes.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">2. How We Use Your Data</h4>
                <p>
                  We use your information solely to facilitate job discovery, provide
                  intelligent matching recommendations, protect against fraudulent
                  activity, and deliver customer support. We do not sell your personal
                  data to third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">3. Data Security & Storage</h4>
                <p>
                  All user transmissions are encrypted via industry-standard TLS
                  encryption. Stored sensitive data, including resumes and passwords,
                  are safeguarded behind enterprise-grade firewalls and access controls.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">4. Your Rights & Choices</h4>
                <p>
                  You have the right to access, export, rectify, or request the deletion
                  of your personal data at any time from your account settings or by
                  contacting our data privacy officer at privacy@careerhub.com.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h4 className="font-semibold text-white">1. Acceptance of Terms</h4>
                <p>
                  By accessing or utilizing CareerHub, you agree to comply with and be
                  bound by these Terms & Conditions and all applicable local, national,
                  and international laws.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">2. Candidate Obligations</h4>
                <p>
                  Candidates agree to provide accurate and truthful representations
                  of their skills, credentials, and work history. Misrepresenting
                  identity or qualifications may result in account termination.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">3. Employer & Recruiter Conduct</h4>
                <p>
                  Hiring organizations agree to post authentic openings with truthful
                  compensation details. Discriminatory hiring practices, ghost listings,
                  or unauthorized solicitations will result in immediate disqualification.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white">4. Intellectual Property & Liability</h4>
                <p>
                  CareerHub and its respective design, marks, code, and content are
                  the intellectual property of CareerHub, Inc. CareerHub is not liable
                  for direct employment contracts forged between third-party entities.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
