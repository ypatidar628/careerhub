import { useState } from "react";
import {
  FiSend,
  FiUser,
  FiMail,
  FiPhone,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const SUBJECT_PRESETS = [
  "General Inquiry",
  "Candidate Support",
  "Employer & Recruiter Solutions",
  "Feature Suggestion",
  "Partnership Opportunity",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export default function ContactUsForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [generalError, setGeneralError] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value || !value.trim()) {
          return "Full name is required";
        }
        if (value.trim().length < 2) {
          return "Full name must be at least 2 characters";
        }
        return "";

      case "email":
        if (!value || !value.trim()) {
          return "Email address is required";
        }
        if (!EMAIL_REGEX.test(value.trim())) {
          return "Please enter a valid email address (e.g. name@domain.com)";
        }
        return "";

      case "phone":
        if (value && value.trim()) {
          const cleaned = value.trim();
          if (!PHONE_REGEX.test(cleaned)) {
            return "Please enter a valid phone number (digits, optional country code)";
          }
        }
        return "";

      case "subject":
        if (!value || !value.trim()) {
          return "Please specify a subject for your inquiry";
        }
        if (value.trim().length < 3) {
          return "Subject must be at least 3 characters";
        }
        return "";

      case "message":
        if (!value || !value.trim()) {
          return "Message cannot be empty";
        }
        if (value.trim().length < 10) {
          return `Please write at least 10 characters (currently ${value.trim().length})`;
        }
        return "";

      default:
        return "";
    }
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(INITIAL_FORM).forEach((key) => {
      const err = validateField(key, data[key]);
      if (err) {
        newErrors[key] = err;
      }
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGeneralError("");

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({ ...prev, subject: preset }));
    setTouched((prev) => ({ ...prev, subject: true }));
    setErrors((prev) => ({ ...prev, subject: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched = Object.keys(INITIAL_FORM).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setGeneralError("Please fix the highlighted fields before submitting.");
      // Focus first error field
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`contact-${firstKey}`);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      // Realistic simulated network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmittedData({
        fullName: formData.fullName,
        email: formData.email,
        subject: formData.subject,
      });
      setFormData(INITIAL_FORM);
      setTouched({});
      setErrors({});
      toast.success(
        "Message sent successfully! Our team will get back to you shortly."
      );
    } catch {
      setGeneralError(
        "Something went wrong while sending your message. Please try again."
      );
      toast.error("Failed to send message. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData(INITIAL_FORM);
    setTouched({});
    setErrors({});
    setGeneralError("");
  };

  // Success Confirmation State
  if (submittedData) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center backdrop-blur-md dark:bg-emerald-950/30"
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-3xl text-emerald-400">
          <FiCheckCircle />
        </div>
        <h4 className="text-2xl font-bold text-white">
          Message Received!
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Thank you,{" "}
          <strong className="text-white">{submittedData.fullName}</strong>. We
          have received your inquiry regarding{" "}
          <span className="italic text-cyan-300">
            &ldquo;{submittedData.subject}&rdquo;
          </span>
          . A confirmation has been sent to{" "}
          <span className="text-cyan-300 underline underline-offset-2">
            {submittedData.email}
          </span>
          .
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <FiRefreshCw className="text-xs" /> Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="Contact CareerHub support team"
      className="space-y-4"
    >
      {/* General Alert Banner */}
      {generalError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 sm:text-sm"
        >
          <FiAlertCircle className="shrink-0 text-base text-rose-400" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Row 1: Full Name and Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label
            htmlFor="contact-fullName"
            className="block text-xs font-semibold text-slate-300"
          >
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiUser className="text-sm" />
            </span>
            <input
              id="contact-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Alex Morgan"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                errors.fullName && touched.fullName
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-brand focus:ring-brand/30"
              }`}
            />
          </div>
          {errors.fullName && touched.fullName && (
            <p
              id="fullName-error"
              role="alert"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-semibold text-slate-300"
          >
            Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiMail className="text-sm" />
            </span>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="alex@company.com"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                errors.email && touched.email
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-brand focus:ring-brand/30"
              }`}
            />
          </div>
          {errors.email && touched.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Phone (optional) and Subject */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Phone Number */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="contact-phone"
              className="block text-xs font-semibold text-slate-300"
            >
              Phone Number
            </label>
            <span className="text-[11px] text-slate-500">Optional</span>
          </div>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiPhone className="text-sm" />
            </span>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+1 (555) 019-2834"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                errors.phone && touched.phone
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-brand focus:ring-brand/30"
              }`}
            />
          </div>
          {errors.phone && touched.phone && (
            <p
              id="phone-error"
              role="alert"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.phone}
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-xs font-semibold text-slate-300"
          >
            Subject <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiTag className="text-sm" />
            </span>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              required
              aria-required="true"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Hiring on CareerHub"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                errors.subject && touched.subject
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-brand focus:ring-brand/30"
              }`}
            />
          </div>
          {errors.subject && touched.subject && (
            <p
              id="subject-error"
              role="alert"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.subject}
            </p>
          )}
        </div>
      </div>

      {/* Quick Subject Suggestions */}
      <div>
        <span className="block text-[11px] font-medium text-slate-400">
          Quick topics:
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {SUBJECT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                formData.subject === preset
                  ? "border-brand bg-brand/20 text-white font-medium"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="contact-message"
            className="block text-xs font-semibold text-slate-300"
          >
            Message <span className="text-rose-400">*</span>
          </label>
          <span className="text-[11px] text-slate-500">
            {formData.message.length}/1000
          </span>
        </div>
        <div className="relative mt-1">
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            maxLength={1000}
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell us how we can help you or what questions you have..."
            className={`w-full rounded-xl border bg-slate-900/60 p-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
              errors.message && touched.message
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                : "border-slate-700/80 focus:border-brand focus:ring-brand/30"
            }`}
          />
        </div>
        {errors.message && touched.message && (
          <p
            id="message-error"
            role="alert"
            className="mt-1 text-xs text-rose-400"
          >
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-brand sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending message...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <FiSend className="text-sm" />
            </>
          )}
        </button>
        <span className="mt-2 block text-[11px] text-slate-500">
          We respect your privacy. No spam guaranteed.
        </span>
      </div>
    </form>
  );
}
