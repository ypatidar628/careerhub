import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiShield, FiArrowLeft, FiRefreshCw, FiCheckCircle, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

export default function OtpVerification({
  email = "user@careerhub.dev",
  length = 6,
  onVerify,
  onResend,
  onBack,
  backText = "Back to Sign in",
  title = "Verify code",
  subtitle = "Enter the 6-digit verification code sent to your email.",
  isPage = false,
  demoCode,
  timerSeconds = 30,
}) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [timer, setTimer] = useState(timerSeconds);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Reset timer whenever timerSeconds or demoCode changes (fresh OTP arrival)
  useEffect(() => {
    setTimer(timerSeconds);
  }, [timerSeconds, demoCode]);

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

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = digits.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (digits && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const cleaned = pastedData.replace(/\D/g, "");
    if (!cleaned) return;

    const digits = cleaned.slice(0, length).split("");
    const newOtp = new Array(length).fill("").map((_, i) => digits[i] || "");
    setOtp(newOtp);

    const focusIndex = Math.min(digits.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < length) {
      toast.error(`Please enter all ${length} digits.`);
      return;
    }

    if (timer === 0) {
      toast.error("Verification code expired! Please click 'Resend OTP Code'.");
      return;
    }

    setLoading(true);
    try {
      if (onVerify) {
        await onVerify(otpCode);
      } else {
        toast.success("OTP verified successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setOtp(new Array(length).fill(""));
    if (inputRefs.current[0]) inputRefs.current[0].focus();

    try {
      if (onResend) {
        await onResend();
      } else {
        toast.success("A fresh OTP code has been sent to your email.");
      }
      setTimer(timerSeconds);
    } catch (err) {
      toast.error(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const formContent = (
    <div className="flex h-full flex-col justify-between p-8 lg:p-10">
      <div>
        {/* Header */}
        <div className="pb-4">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#dedee2] px-2.5 py-1 text-xs font-bold text-[#50357f] mb-2.5">
            <FiShield className="text-sm" />
            <span>Security Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#50357f]">
            {title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {subtitle}
          </p>

          {email && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-[#dedee2]/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <FiMail className="text-[#50357f]" />
              <span className="truncate max-w-[240px]">{email}</span>
            </div>
          )}

          {demoCode && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-purple-100/90 dark:bg-purple-950/40 px-3.5 py-2 border border-purple-300/70 dark:border-purple-800/50">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-[#50357f] dark:text-[#b8a0e0] text-sm shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Verification Code:{" "}
                  <strong className="font-mono text-sm tracking-wider font-extrabold text-[#50357f] dark:text-[#b8a0e0]">
                    {demoCode}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = String(demoCode).slice(0, length).split("");
                  const fullOtp = new Array(length).fill("").map((_, i) => digits[i] || "");
                  setOtp(fullOtp);
                  if (inputRefs.current[length - 1]) {
                    inputRefs.current[length - 1].focus();
                  }
                }}
                className="text-xs font-bold text-[#50357f] hover:text-[#604099] dark:text-[#b8a0e0] hover:underline cursor-pointer transition ml-2"
              >
                Auto-fill
              </button>
            </div>
          )}
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* OTP Digit Input Boxes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Verification Code <span className="text-rose-500">*</span>
              </label>
              {timer > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <FiClock className="text-xs" />
                  <span>Expires in {timer}s</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                  <FiClock className="text-xs" />
                  <span>Expired (30s)</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={timer === 0}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  autoFocus={idx === 0}
                  className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-0 text-center text-xl sm:text-2xl font-black shadow-xs outline-none transition ${
                    timer === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-[#dedee2] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#7b52b9]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Resend Countdown & Action */}
          <div className="flex items-center justify-between text-xs">
            {timer > 0 ? (
              <span className="text-slate-500 font-medium">
                Resend code in{" "}
                <span className="font-bold text-[#50357f]">{timer}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="inline-flex items-center gap-1.5 font-bold text-[#50357f] hover:underline cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw className={`text-xs ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? "Sending code..." : "Resend OTP Code via Email"}</span>
              </button>
            )}

            <span className="text-[11px] text-slate-400">
              6-digit numeric PIN
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || otp.join("").length < length || timer === 0}
              className="w-full rounded-xl bg-[#50357f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Verifying code..."
                : timer === 0
                ? "Code Expired - Resend Code"
                : "Verify Code"}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Back Navigation */}
      <div className="space-y-3 pt-6 text-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#50357f] hover:underline cursor-pointer transition"
          >
            <FiArrowLeft className="text-sm" />
            <span>{backText}</span>
          </button>
        ) : (
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#50357f] hover:underline cursor-pointer transition"
          >
            <FiArrowLeft className="text-sm" />
            <span>{backText}</span>
          </Link>
        )}
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
          Two-step <br />
          <em className="italic font-light text-slate-200">verification.</em>
        </h2>
        <p className="mt-5 max-w-sm text-sm lg:text-base leading-relaxed text-slate-300">
          Protecting your account, job applications, and career records with multi-factor authentication.
        </p>
      </div>

      {/* Bottom Hint */}
      <div className="z-10">
        <p className="text-[11px] font-medium tracking-wide text-slate-400">
          Verification code expires in 30 seconds. Check your inbox or spam folder.
        </p>
      </div>
    </div>
  );

  const desktopCard = (
    <div className="relative mx-auto h-[620px] w-full max-w-[880px] overflow-hidden rounded-[32px] border border-[#38346e]/40 bg-[#232050] shadow-[0_25px_60px_-15px_rgba(21,20,56,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
      {/* LEFT HALF: Branded Ambient Banner */}
      <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden bg-gradient-to-br from-[#232050] via-[#1c1946] to-[#151438] shadow-[0_0_40px_rgba(0,0,0,0.4)]">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7b52b9]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#50357f]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent" />

        {/* Seam divider line */}
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/10 shadow-[-1px_0_10px_rgba(255,255,255,0.15)]" />

        {bannerContent}
      </div>

      {/* RIGHT HALF: Form Container */}
      <div className="absolute right-0 top-0 flex h-full w-1/2 flex-col justify-between bg-[#ececf0]">
        {formContent}
      </div>
    </div>
  );

  const mobileCard = (
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
              Two-step <em className="italic font-light text-slate-200">verification.</em>
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Enter the verification code to activate your account
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Form Sheet */}
      <div className="bg-[#ececf0] p-6 text-slate-900 rounded-t-[28px] -mt-3 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] relative">
        {formContent}
      </div>
    </div>
  );

  if (!isPage) {
    return isDesktop ? desktopCard : mobileCard;
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-slate-300 p-4 font-sans text-slate-900 transition-colors duration-200 dark:bg-[#151438] dark:text-slate-100 sm:p-6 lg:p-8">
      {isDesktop ? desktopCard : mobileCard}
    </div>
  );
}
