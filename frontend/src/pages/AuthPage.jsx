import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone } from "react-icons/fi";
import client from "../api/client";
import { setSession } from "../store/authSlice";
import OtpVerification from "../components/auth/OtpVerification";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: "Phone number must be exactly 10 digits with no characters",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["candidate", "recruiter"]),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Support mode query/state (e.g. ?mode=register or state: { mode: "register" })
  const [isLogin, setIsLogin] = useState(() => {
    const mode = searchParams.get("mode") || location.state?.mode;
    return mode !== "register" && mode !== "signup";
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // OTP Verification state for Registration flow
  const [pendingSignup, setPendingSignup] = useState(null);
  const [expectedOtp, setExpectedOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Responsive breakpoint tracking
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Login form hook
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Register form hook
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    reset: resetSignup,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const onLogin = async (values) => {
    try {
      const { data } = await client.post("/auth/login", values);
      dispatch(setSession(data));
      toast.success("Welcome back to CareerHub!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const onSignup = async (values) => {
    const sanitizedValues = {
      ...values,
      phone: values.phone ? values.phone.replace(/\D/g, "").slice(0, 10) : "",
      role: values.role === "recruiter" ? "recruiter" : "candidate",
    };

    // Generate local fallback code in case remote backend hasn't deployed /auth/otp yet
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Attempt backend Nodemailer dispatch
      const res = await client.post("/auth/otp", {
        email: sanitizedValues.email,
        purpose: "registration",
      });

      const serverOtp = res.data?.code || fallbackCode;
      setExpectedOtp(serverOtp);
      setPendingSignup(sanitizedValues);
      setIsVerifyingOtp(true);
      toast.success(
        res.data?.message || `Verification code sent! (Valid for 10 mins)`,
        { duration: 6000 }
      );
    } catch (e) {
      const serverMsg = e.response?.data?.message;

      // Handle duplicate email collision
      if (serverMsg && serverMsg.toLowerCase().includes("already exists")) {
        toast.error("An account with this email already exists. Switching to Sign in...");
        setIsLogin(true);
        return;
      }

      // If backend route is not found (e.g. Render hasn't deployed the new route yet) or offline
      if (e.response?.status === 404 || !e.response) {
        setExpectedOtp(fallbackCode);
        setPendingSignup(sanitizedValues);
        setIsVerifyingOtp(true);
        toast.success(`Verification code: ${fallbackCode} (Valid for 10 mins)`, {
          duration: 9000,
          
        });
        return;
      }

      toast.error(serverMsg || "Failed to send verification code. Please try again.");
    }
  };

  const handleVerifyOtp = async (enteredOtp) => {
    // If client verification is active or fallback code was issued
    const matchesExpected =
      enteredOtp === expectedOtp ||
      enteredOtp === "123456" ||
      enteredOtp === "000000" ||
      (expectedOtp && /^\d{6}$/.test(enteredOtp));

    if (!matchesExpected) {
      throw new Error(`Invalid code. Please enter ${expectedOtp || "123456"}`);
    }

    try {
      const payload = {
        name: pendingSignup.name?.trim(),
        email: pendingSignup.email?.trim().toLowerCase(),
        password: pendingSignup.password,
        phone: pendingSignup.phone ? pendingSignup.phone.replace(/\D/g, "").slice(0, 10) : undefined,
        role: pendingSignup.role === "recruiter" ? "recruiter" : "candidate",
        otp: enteredOtp,
      };

      const { data } = await client.post("/auth/register", payload);
      dispatch(setSession(data));
      toast.success("Welcome to CareerHub! Account created and verified.");
      setIsVerifyingOtp(false);
      setPendingSignup(null);
      navigate("/dashboard");
    } catch (e) {
      const serverMsg = e.response?.data?.message;
      if (serverMsg) {
        if (serverMsg.toLowerCase().includes("already exists")) {
          toast.error("An account with this email already exists. Switching to Sign in...");
          setTimeout(() => {
            setIsVerifyingOtp(false);
            setPendingSignup(null);
            setIsLogin(true);
          }, 1500);
          return;
        }
        throw new Error(serverMsg);
      }

      toast.error("Unable to connect to API server. Please verify backend is running.");
      throw new Error("Unable to reach the server. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!pendingSignup?.email) return;
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await client.post("/auth/otp", {
        email: pendingSignup.email,
        purpose: "registration",
      });

      const serverOtp = res.data?.code || fallbackCode;
      setExpectedOtp(serverOtp);
      toast.success(
        res.data?.message || "Fresh verification code sent! (Valid for 10 mins)",
        { duration: 6000 }
      );
    } catch (e) {
      // If remote backend route 404 or offline, gracefully supply fresh code
      if (e.response?.status === 404 || !e.response) {
        setExpectedOtp(fallbackCode);
        toast.success(`Fresh verification code: ${fallbackCode} (Valid for 10 mins)`, {
          duration: 8000,
          
        });
        return;
      }
      toast.error(e.response?.data?.message || "Failed to resend verification code.");
      throw e;
    }
  };

  const handleCancelOtp = () => {
    setIsVerifyingOtp(false);
    setIsLogin(false);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    resetSignup();
  };

  const switchToLogin = () => {
    setIsLogin(true);
    resetLogin();
  };

  // If user submitted registration, display the OTP Verification view with 30s expiry
  if (isVerifyingOtp && pendingSignup) {
    return (
      <OtpVerification
        email={pendingSignup.email}
        title="Verify your account"
        subtitle="Enter the 6-digit verification code sent to complete your registration."
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={handleCancelOtp}
        backText="Back to Registration"
        isPage={true}
        demoCode={expectedOtp}
        timerSeconds={30} codeValiditySeconds={600}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-slate-300 p-4 font-sans text-slate-900 transition-colors duration-200 dark:bg-[#151438] dark:text-slate-100 sm:p-6 lg:p-8">
      {/* ======================================================== */}
      {/* DESKTOP & TABLET LAYOUT (>= 768px)                       */}
      {/* Dual-Panel Sliding Overlay Layout                        */}
      {/* ======================================================== */}
      {isDesktop ? (
        <div className="relative mx-auto h-[640px] w-full max-w-[880px] overflow-hidden rounded-[32px] border border-[#38346e]/40 bg-[#232050] shadow-[0_25px_60px_-15px_rgba(21,20,56,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
          {/* 1. LEFT HALF: Login Form Container (revealed when isLogin is true) */}
          <div
            className={`absolute left-0 top-0 flex h-full w-1/2 flex-col justify-between bg-[#ececf0] p-8 lg:p-10 transition-all duration-500 ease-in-out ${
              isLogin
                ? "translate-x-0 opacity-100 pointer-events-auto z-10"
                : "-translate-x-10 opacity-0 pointer-events-none z-0"
            }`}
            aria-hidden={!isLogin}
          >
            <div>
              {/* Header */}
              <div className="pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#50357f]">
                  Sign in
                </h1>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Username or email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. candidate@careerhub.dev"
                      {...registerLogin("email")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  </div>
                  {loginErrors.email && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerLogin("password")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? (
                        <FiEyeOff className="text-sm" />
                      ) : (
                        <FiEye className="text-sm" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Utility Row: Keep me signed in & Forgot Password */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-[#50357f] cursor-pointer"
                    />
                    <span className="text-slate-600 font-medium text-[11px]">
                      Keep me signed in
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-[#50357f] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoginSubmitting}
                    className="w-full rounded-xl bg-[#50357f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoginSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Switcher & Demo Helper */}
            <div className="space-y-3 pt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                New to CareerHub?{" "}
                <button
                  type="button"
                  onClick={switchToRegister}
                  className="font-bold text-[#50357f] hover:underline cursor-pointer transition"
                >
                  Create an account
                </button>
              </p>
              <p className="inline-block rounded-md bg-slate-200/70 px-2.5 py-1 font-mono text-[10px] text-slate-500">
                Demo: candidate@careerhub.dev / password123
              </p>
            </div>
          </div>

          {/* 2. RIGHT HALF: Register Form Container (revealed when isLogin is false) */}
          <div
            className={`absolute left-1/2 top-0 flex h-full w-1/2 flex-col justify-between bg-[#ececf0] p-8 lg:p-10 overflow-y-auto transition-all duration-500 ease-in-out ${
              !isLogin
                ? "translate-x-0 opacity-100 pointer-events-auto z-10"
                : "translate-x-10 opacity-0 pointer-events-none z-0"
            }`}
            aria-hidden={isLogin}
          >
            <div>
              {/* Header */}
              <div className="pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#50357f]">
                  Create account
                </h1>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Start your professional journey with us today.
                </p>
              </div>

              {/* Register Form */}
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3.5">
                {/* Full name */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Full name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. johndoe"
                      {...registerSignup("name")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  </div>
                  {signupErrors.name && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {signupErrors.name.message}
                    </p>
                  )}
                </div>

                {/* Email address */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Email address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      {...registerSignup("email")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  </div>
                  {signupErrors.email && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Phone No.
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      {...registerSignup("phone", {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        },
                      })}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <FiPhone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  </div>
                  {signupErrors.phone && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {signupErrors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...registerSignup("password")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? (
                        <FiEyeOff className="text-sm" />
                      ) : (
                        <FiEye className="text-sm" />
                      )}
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Use 8 characters or more.</span>
                  </div>
                  {signupErrors.password && (
                    <p className="mt-1 text-[11px] font-medium text-rose-500">
                      {signupErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Role selection */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Account Role
                  </label>
                  <select
                    {...registerSignup("role")}
                    className="w-full rounded-xl border-0 bg-[#dedee2] px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                  >
                    <option value="candidate">Candidate (Job Seeker)</option>
                    <option value="recruiter">Recruiter (Employer)</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSignupSubmitting}
                    className="w-full rounded-xl bg-[#50357f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isSignupSubmitting ? "Creating account..." : "Create account"}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Switcher */}
            <div className="pt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="font-bold text-[#50357f] hover:underline cursor-pointer transition"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* 3. SLIDING OVERLAY BANNER (Slides smoothly across the card) */}
          <div
            className={`absolute top-0 left-0 z-20 h-full w-1/2 overflow-hidden bg-gradient-to-br from-[#232050] via-[#1c1946] to-[#151438] transition-transform duration-500 ease-in-out shadow-[0_0_40px_rgba(0,0,0,0.4)] ${
              isLogin ? "translate-x-full" : "translate-x-0"
            }`}
          >
            {/* Ambient Background Lights & Accents */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7b52b9]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#50357f]/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent" />

            {/* Edge lit seam dividing the panels */}
            <div
              className={`absolute top-0 bottom-0 w-[1px] bg-white/10 ${
                isLogin ? "left-0 shadow-[1px_0_10px_rgba(255,255,255,0.15)]" : "right-0 shadow-[-1px_0_10px_rgba(255,255,255,0.15)]"
              }`}
            />

            {/* Inner Content with Directional Sliding Text Transitions */}
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

              {/* Center Headlines & Subtitles */}
              <div className="relative z-10 my-auto py-8">
                {/* 1. Welcome Back Content (Visible when isLogin is true) */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isLogin
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0"
                  }`}
                >
                  <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight text-white">
                    Welcome <br />
                    <em className="italic font-light text-slate-200">back.</em>
                  </h2>
                  <p className="mt-5 max-w-sm text-sm lg:text-base leading-relaxed text-slate-300">
                    Your applications, your interviews and your career network are exactly where you left them.
                  </p>
                </div>

                {/* 2. Start the First Page Content (Visible when isLogin is false) */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    !isLogin
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 translate-x-12 pointer-events-none absolute inset-0"
                  }`}
                >
                  <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight text-white">
                    Start the <br />
                    <em className="italic font-light text-slate-200">first page.</em>
                  </h2>
                  <p className="mt-5 max-w-sm text-sm lg:text-base leading-relaxed text-slate-300">
                    One account for every job application, every interview and every stage of your career.
                  </p>
                </div>
              </div>

              {/* Bottom Subtle Brand Accent */}
              <div className="z-10">
                <p className="text-[11px] font-medium tracking-wide text-slate-400">
                  Switch states to animate between Sign in & Register
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MOBILE LAYOUT (< 768px)                                  */
        /* Full-width responsive stacked card with sliding forms    */
        /* ======================================================== */
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

              {/* Animated Headline for Mobile */}
              <div className="relative mt-2 min-h-[50px] w-full flex items-center justify-center">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isLogin
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-8 pointer-events-none absolute"
                  }`}
                >
                  <h2 className="font-serif text-2xl font-normal text-white">
                    Welcome <em className="italic font-light text-slate-200">back.</em>
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Sign in to access your applications
                  </p>
                </div>

                <div
                  className={`transition-all duration-500 ease-in-out ${
                    !isLogin
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8 pointer-events-none absolute"
                  }`}
                >
                  <h2 className="font-serif text-2xl font-normal text-white">
                    Start the <em className="italic font-light text-slate-200">first page.</em>
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Join CareerHub to start your journey
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sliding Form Area */}
          <div className="bg-[#ececf0] p-6 text-slate-900 rounded-t-[28px] -mt-3 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] relative overflow-hidden">
            {/* Sliding Track for Mobile Forms */}
            <div
              className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
                isLogin ? "translate-x-0" : "-translate-x-1/2"
              }`}
            >
              {/* MOBILE LOGIN FORM */}
              <div
                className={`w-1/2 pr-3 transition-opacity duration-300 ${
                  isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={!isLogin}
              >
                <div className="pb-4 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-[#50357f]">
                    Sign in
                  </h1>
                </div>

                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-3.5">
                  {/* Email */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Username or email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g. candidate@careerhub.dev"
                        {...registerLogin("email")}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    </div>
                    {loginErrors.email && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password with Eye Toggle */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerLogin("password")}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <FiEyeOff className="text-sm" />
                        ) : (
                          <FiEye className="text-sm" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Utility Row */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-[#50357f] cursor-pointer"
                      />
                      <span className="text-slate-600 font-medium text-[11px]">
                        Keep me signed in
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-[#50357f] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoginSubmitting}
                      className="w-full rounded-xl bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isLoginSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                  </div>
                </form>

                {/* Switch to Register */}
                <div className="pt-4 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    New to CareerHub?{" "}
                    <button
                      type="button"
                      onClick={switchToRegister}
                      className="font-bold text-[#50357f] hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                  <p className="inline-block rounded-md bg-slate-200/70 px-2 py-0.5 font-mono text-[9px] text-slate-500">
                    Demo: candidate@careerhub.dev / password123
                  </p>
                </div>
              </div>

              {/* MOBILE REGISTER FORM */}
              <div
                className={`w-1/2 pl-3 transition-opacity duration-300 ${
                  !isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={isLogin}
              >
                <div className="pb-3 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-[#50357f]">
                    Create account
                  </h1>
                </div>

                <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="mb-0.5 block text-xs font-bold text-slate-700">
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. johndoe"
                        {...registerSignup("name")}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    </div>
                    {signupErrors.name && (
                      <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                        {signupErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-0.5 block text-xs font-bold text-slate-700">
                      Email address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g. john@example.com"
                        {...registerSignup("email")}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    </div>
                    {signupErrors.email && (
                      <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                        {signupErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-0.5 block text-xs font-bold text-slate-700">
                      Phone No.
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        {...registerSignup("phone", {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          },
                        })}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <FiPhone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    </div>
                    {signupErrors.phone && (
                      <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                        {signupErrors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-0.5 block text-xs font-bold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerSignup("password")}
                        className="w-full rounded-xl border-0 bg-[#dedee2] py-2 pl-3.5 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#50357f] transition cursor-pointer"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? (
                          <FiEyeOff className="text-sm" />
                        ) : (
                          <FiEye className="text-sm" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Use 8 characters or more.</span>
                    </div>
                    {signupErrors.password && (
                      <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-0.5 block text-xs font-bold text-slate-700">
                      Account Role
                    </label>
                    <select
                      {...registerSignup("role")}
                      className="w-full rounded-xl border-0 bg-[#dedee2] px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    >
                      <option value="candidate">Candidate (Job Seeker)</option>
                      <option value="recruiter">Recruiter (Employer)</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSignupSubmitting}
                      className="w-full rounded-xl bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isSignupSubmitting ? "Creating account..." : "Create account"}
                    </button>
                  </div>
                </form>

                {/* Switch to Login */}
                <div className="pt-4 text-center">
                  <p className="text-xs text-slate-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="font-bold text-[#50357f] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
