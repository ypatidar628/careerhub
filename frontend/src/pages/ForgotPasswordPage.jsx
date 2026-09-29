import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiKey } from "react-icons/fi";
import toast from "react-hot-toast";
import OtpVerification from "../components/auth/OtpVerification";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request"); // "request" | "otp"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Responsive breakpoint tracking matching AuthPage
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRequestReset = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Verification code sent to your email!");
      setStep("otp");
    }, 800);
  };

  const handleVerifyOtp = async (otpCode) => {
    // Navigate to Reset Password page with email and otp
    toast.success("Code verified! You can now set a new password.");
    navigate("/reset-password", { state: { email, otp: otpCode } });
  };

  if (step === "otp") {
    return (
      <OtpVerification
        email={email}
        onVerify={handleVerifyOtp}
        onResend={() => toast.success("A fresh OTP code has been sent.")}
        isPage={true}
        demoCode="123456"
      />
    );
  }

  const formContent = (
    <div className="flex h-full flex-col justify-between p-8 lg:p-10">
      <div>
        {/* Header */}
        <div className="pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#dedee2] px-2.5 py-1 text-xs font-bold text-[#50357f] mb-3">
            <FiKey className="text-sm" />
            <span>Account Recovery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#50357f]">
            Forgot password?
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            No worries! Enter your registered email address and we'll send you an OTP verification code.
          </p>
        </div>

        {/* Request Form */}
        <form onSubmit={handleRequestReset} className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Registered email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. candidate@careerhub.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
              <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#50357f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending OTP Code..." : "Send Verification Code"}
            </button>
          </div>
        </form>
      </div>

      {/* Back to Sign in */}
      <div className="space-y-3 pt-6 text-center">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#50357f] hover:underline cursor-pointer transition"
        >
          <FiArrowLeft className="text-sm" />
          <span>Back to Sign in</span>
        </Link>
      </div>
    </div>
  );

  const bannerContent = (
    <div className="relative flex h-full flex-col justify-between p-8 lg:p-12 text-white">
      {/* Brand Tag with Monogram Logo */}
      <div className="z-10 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 p-1 backdrop-blur-sm ring-1 ring-white/20">
          <img
            src="/logo.png"
            alt="CareerHub Logo"
            className="h-full w-full object-contain invert brightness-200"
          />
        </div>
        <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#b8a0e0] uppercase">
          CAREERHUB
        </span>
      </div>

      {/* Center Headlines */}
      <div className="relative z-10 my-auto py-8">
        <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight text-white">
          Reset your <br />
          <em className="italic font-light text-slate-200">password.</em>
        </h2>
        <p className="mt-5 max-w-sm text-sm lg:text-base leading-relaxed text-slate-300">
          Recover access to your job search network, applications, and recruiter messages in a few simple steps.
        </p>
      </div>

      {/* Bottom Subtle Note */}
      <div className="z-10">
        <p className="text-[11px] font-medium tracking-wide text-slate-400">
          Verification codes expire after 10 minutes for your security.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-slate-300 p-4 font-sans text-slate-900 transition-colors duration-200 dark:bg-[#151438] dark:text-slate-100 sm:p-6 lg:p-8">
      {isDesktop ? (
        <div className="relative mx-auto h-[620px] w-full max-w-[880px] overflow-hidden rounded-[32px] border border-[#38346e]/40 bg-[#232050] shadow-[0_25px_60px_-15px_rgba(21,20,56,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
          {/* LEFT HALF: Branded Ambient Banner */}
          <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden bg-gradient-to-br from-[#232050] via-[#1c1946] to-[#151438] shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7b52b9]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#50357f]/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent" />
            <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/10 shadow-[-1px_0_10px_rgba(255,255,255,0.15)]" />
            {bannerContent}
          </div>

          {/* RIGHT HALF: Form Container */}
          <div className="absolute right-0 top-0 flex h-full w-1/2 flex-col justify-between bg-[#ececf0]">
            {formContent}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#38346e]/40 bg-[#232050] shadow-2xl">
          {/* Top Branded Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#232050] via-[#1c1946] to-[#151438] p-6 text-white border-b border-[#38346e]/30">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#7b52b9]/25 blur-2xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 p-0.5 backdrop-blur-sm ring-1 ring-white/20">
                  <img
                    src="/logo.png"
                    alt="CareerHub Logo"
                    className="h-full w-full object-contain invert brightness-200"
                  />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#b8a0e0] uppercase">
                  CAREERHUB
                </span>
              </div>

              <div className="mt-3">
                <h2 className="font-serif text-2xl font-normal text-white">
                  Reset your <em className="italic font-light text-slate-200">password.</em>
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  Enter your email to receive a verification code
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Form Area */}
          <div className="bg-[#ececf0] p-6 text-slate-900 rounded-t-[28px] -mt-3 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] relative">
            {formContent}
          </div>
        </div>
      )}
    </div>
  );
}
