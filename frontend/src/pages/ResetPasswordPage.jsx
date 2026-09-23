import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated successfully! Please log in.");
      navigate("/auth");
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-white p-4 font-sans text-slate-900 transition-colors duration-200 dark:bg-[#151438] dark:text-slate-100 sm:p-8">
      {/* Outer Card Container */}
      <div className="relative mx-auto w-full max-w-[360px] h-[570px] overflow-hidden rounded-[36px] bg-[#232050] shadow-[0_20px_50px_rgba(35,32,80,0.22)] border border-[#38346e]/40 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="pt-6 pb-2 text-center z-10">
          <span className="text-sm font-bold tracking-wide text-white/90">
            Set New Password
          </span>
        </div>

        {/* White Curved Dome */}
        <div className="bg-[#ececf0] text-slate-900 h-[84%] rounded-t-[60px] p-7 pt-6 z-20 flex flex-col justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.25)]">
          <div>
            {/* Title */}
            <div className="text-center pt-2 pb-5">
              <h1 className="text-2xl font-black tracking-tight text-[#50357f]">
                New Password
              </h1>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed px-2">
                Choose a strong and secure password for your CareerHub account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-3.5 pt-1">
              <div>
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-0 bg-[#dedee2] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border-0 bg-[#dedee2] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-[#7b52b9]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Back link */}
          <div className="pt-3 text-center">
            <Link
              to="/auth"
              className="text-xs font-semibold text-[#50357f] hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
