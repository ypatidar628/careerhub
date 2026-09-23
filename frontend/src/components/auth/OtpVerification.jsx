import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function OtpVerification({
  email = "user@careerhub.dev",
  length = 6,
  onVerify,
  onResend,
  title = "Verify OTP",
  subtitle = "Enter the 6-digit verification code sent to your email",
  isPage = false,
}) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    // take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
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
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
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

  const handleResendOtp = () => {
    if (timer > 0) return;
    setTimer(60);
    setOtp(new Array(length).fill(""));
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    if (onResend) {
      onResend();
    } else {
      toast.success("A fresh OTP code has been sent to your email.");
    }
  };

  const content = (
    <div className="relative mx-auto w-full max-w-[360px] h-[570px] overflow-hidden rounded-[36px] bg-[#232050] shadow-[0_20px_50px_rgba(35,32,80,0.22)] border border-[#38346e]/40 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <div className="pt-6 pb-2 text-center z-10">
        <span className="text-sm font-bold tracking-wide text-white/90">
          Security Verification
        </span>
      </div>

      {/* White Curved Dome (Matching Login) */}
      <div className="bg-[#ececf0] text-slate-900 h-[86%] rounded-t-[60px] p-7 pt-6 z-20 flex flex-col justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.25)]">
        <div>
          {/* Title */}
          <div className="text-center pt-2 pb-4">
            <h2 className="text-2xl font-black tracking-tight text-[#50357f]">
              {title}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed px-2">
              {subtitle}
            </p>
            {email && (
              <p className="mt-0.5 text-xs font-bold text-[#50357f]">
                {email}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* OTP Pin Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  autoFocus={idx === 0}
                  className="h-11 w-10 sm:h-12 sm:w-11 rounded-md border-0 bg-[#e0e0e4] text-center text-lg font-bold text-slate-900 outline-none transition focus:ring-2 focus:ring-[#7b52b9] focus:bg-white"
                />
              ))}
            </div>

            {/* Resend Timer & Link */}
            <div className="text-center text-xs">
              {timer > 0 ? (
                <p className="text-slate-500 font-medium">
                  Resend code in <span className="font-bold text-[#50357f]">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-[#50357f] hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || otp.join("").length < length}
                className="w-full rounded-md bg-[#50357f] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#604099] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        </div>

        {/* Back to Auth link */}
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
  );

  if (!isPage) {
    return content;
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-white p-4 transition-colors duration-200 dark:bg-[#151438] sm:p-8">
      {content}
    </div>
  );
}
