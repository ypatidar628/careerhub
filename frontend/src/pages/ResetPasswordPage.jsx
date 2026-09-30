import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../api/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!email) {
      toast.error("Session expired or missing email. Please start from Forgot Password.");
      navigate("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await client.post("/auth/reset-password", {
        email,
        otp,
        password,
      });

      toast.success(res.data?.message || "Password updated successfully! Please log in.");
      navigate("/auth");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="flex h-full flex-col justify-between p-8 lg:p-10">
      <div>
        {/* Header */}
        <div className="pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#dedee2] px-2.5 py-1 text-xs font-bold text-[#50357f] mb-3">
            <FiLock className="text-sm" />
            <span>Create New Password</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#50357f]">
            Set new password
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {email ? `Resetting password for ${email}.` : "Your new password must be at least 8 characters."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
          {/* New Password */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Min 8 characters.</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#50357f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating Password..." : "Update Password"}
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
          Secure <br />
          <em className="italic font-light text-slate-200">credentials.</em>
        </h2>
        <p className="mt-5 max-w-sm text-sm lg:text-base leading-relaxed text-slate-300">
          Keep your application portfolio and job communications safe by choosing a strong password.
        </p>
      </div>

      {/* Bottom Subtle Note */}
      <div className="z-10">
        <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-400">
          <FiCheckCircle className="text-emerald-400" />
          <span>Encrypted with industry standard salt rounds</span>
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
                  Set new <em className="italic font-light text-slate-200">password.</em>
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  Create a strong password for your account
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
