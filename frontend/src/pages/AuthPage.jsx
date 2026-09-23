import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import client from "../api/client";
import { setSession } from "../store/authSlice";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["candidate", "recruiter", "admin"]),
});

export default function AuthPage() {
  // isLogin: true means "Login" mode (white curved dome up), false means "Sign up" mode
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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
    try {
      const { data } = await client.post("/auth/register", values);
      dispatch(setSession(data));
      toast.success("Welcome to CareerHub! Account created.");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-slate-300 p-4 font-sans text-slate-900 transition-colors duration-200 dark:bg-[#151438] dark:text-slate-100 sm:p-8">
      {/* Outer Card Container */}
      <div className="relative mx-auto w-full max-w-[470px] h-[670px] overflow-hidden rounded-[36px] bg-[#232050] shadow-[0_20px_50px_rgba(35,32,80,0.22)] border border-[#38346e]/40 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 flex flex-col justify-between">
        
        {/* ======================================================== */}
        {/* ONLY ONE SINGLE "SIGN UP" HEADER AT THE TOP */}
        {/* ======================================================== */}
        <div className="pt-6 pb-2 text-center z-10">
          <button
            type="button"
            onClick={() => {
              if (isLogin) {
                setIsLogin(false);
                resetSignup();
              }
            }}
            className={`font-bold tracking-tight text-white transition-all duration-300 ${
              isLogin
                ? "text-sm sm:text-base opacity-90 hover:opacity-100 hover:scale-105 cursor-pointer"
                : "text-2xl sm:text-3xl cursor-default"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* ======================================================== */}
        {/* SIGN UP FORM BODY (Completely hidden in Login mode) */}
        {/* ======================================================== */}
        <div
          className={`flex-1 px-7 pt-6 overflow-y-auto transition-all duration-500 ease-in-out ${
            isLogin
              ? "hidden opacity-0 pointer-events-none"
              : "block opacity-100"
          }`}
        >
          <form
            onSubmit={handleSignupSubmit(onSignup)}
            className="space-y-6 pt-1"
          >
            {/* User name */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                User name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. johndoe"
                {...registerSignup("name")}
                className="w-full rounded-md border-0 bg-[#e0e0e4] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
              {signupErrors.name && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {signupErrors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                {...registerSignup("email")}
                className="w-full rounded-md border-0 bg-[#e0e0e4] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
              {signupErrors.email && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {signupErrors.email.message}
                </p>
              )}
            </div>

            {/* Phone No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Phone No.
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                {...registerSignup("phone")}
                className="w-full rounded-md border-0 bg-[#e0e0e4] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              />
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...registerSignup("password")}
                  className="w-full rounded-md border-0 bg-[#e0e0e4] pl-3.5 pr-10 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#50357f] transition p-1 cursor-pointer"
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? (
                    <FiEyeOff className="text-base" />
                  ) : (
                    <FiEye className="text-base" />
                  )}
                </button>
              </div>
              {signupErrors.password && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {signupErrors.password.message}
                </p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Account Role
              </label>
              <select
                {...registerSignup("role")}
                className="w-full rounded-md border-0 bg-[#e0e0e4] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
              >
                <option value="candidate">Candidate (Job Seeker)</option>
                <option value="recruiter">Recruiter (Employer)</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            {/* Sign up button */}
            <div className="pt-2 pb-2">
              <button
                type="submit"
                disabled={isSignupSubmitting}
                className="w-full rounded-md bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSignupSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* WHITE CURVED DOME FOR LOGIN */}
        {/* ======================================================== */}
        <div
          className={`bg-[#ececf0] text-slate-900 transition-all duration-500 ease-in-out z-20 flex flex-col items-center shadow-[0_-10px_30px_rgba(0,0,0,0.25)] ${
            isLogin
              ? "h-[85%] rounded-t-[60px] p-7 pt-6"
              : "h-[60px] rounded-t-[50px] p-3 justify-center cursor-pointer hover:bg-white"
          }`}
          onClick={() => {
            if (!isLogin) {
              setIsLogin(true);
              resetLogin();
            }
          }}
        >
          {!isLogin ? (
            /* Bottom tab button when Signup is active */
            <button
              type="button"
              className="text-base sm:text-lg font-bold text-[#50357f] tracking-wide cursor-pointer transition hover:scale-105"
            >
              Login
            </button>
          ) : (
            /* Expanded Login Form when Login is active */
            <div className="w-full flex-1 flex flex-col justify-between animate-in fade-in duration-300">
              <div>
                {/* Login Title */}
                <div className="text-center pt-2 pb-5">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#50357f]">
                    Login
                  </h2>
                </div>

                {/* Login Form */}
                <form
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="space-y-3.5"
                >
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. candidate@careerhub.dev"
                      {...registerLogin("email")}
                      className="w-full rounded-md border-0 bg-[#dedee2] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                    />
                    {loginErrors.email && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password with Eye Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerLogin("password")}
                        className="w-full rounded-md border-0 bg-[#dedee2] pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#50357f] transition p-1 cursor-pointer"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <FiEyeOff className="text-base" />
                        ) : (
                          <FiEye className="text-base" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end pt-0.5">
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-[#50357f] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoginSubmitting}
                      className="w-full rounded-md bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isLoginSubmitting ? "Logging in..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Demo Credentials hint */}
              <div className="pt-3 text-center">
                <p className="font-mono text-[10px] text-slate-500">
                  Demo: candidate@careerhub.dev / password123
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
