import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiLinkedin,
  FiGithub,
  FiInstagram,
  FiArrowUp,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import LogoMark from "../common/LogoMark";
import ContactUsForm from "./ContactUsForm";
import LegalModal from "./LegalModal";

export default function SiteFooter() {
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: "privacy" });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPrivacy = (e) => {
    e.preventDefault();
    setLegalModal({ isOpen: true, type: "privacy" });
  };

  const openTerms = (e) => {
    e.preventDefault();
    setLegalModal({ isOpen: true, type: "terms" });
  };

  return (
    <footer
      id="site-footer"
      aria-label="Site footer and contact information"
      className="relative w-full overflow-hidden border-t border-slate-800 bg-[#080b1e] text-slate-300"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl"
      />

      {/* Prominent Contact Us Section */}
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="relative border-b border-slate-800/80 py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Contact Info (Left Column) */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <span className="font-mono-display inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  <FiMail className="text-xs" /> CONTACT US
                </span>
                <h2
                  id="contact-heading"
                  className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  Let&apos;s Build Your Next Chapter Together
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                  Have a question about roles, employer onboarding, or platform
                  features? Send us a message and our support specialists will
                  respond promptly.
                </p>
              </div>

              {/* Direct channels */}
              <div className="space-y-3.5 pt-2">
                <a
                  href="mailto:support@careerhub.com"
                  className="group flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 transition duration-200 hover:border-brand/50 hover:bg-slate-900"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition duration-200 group-hover:scale-105 group-hover:bg-brand group-hover:text-white">
                    <FiMail className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">
                      Email our team
                    </span>
                    <p className="text-sm font-semibold text-white">
                      support@careerhub.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+18005550199"
                  className="group flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 transition duration-200 hover:border-cyan-400/50 hover:bg-slate-900"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400 transition duration-200 group-hover:scale-105 group-hover:bg-cyan-400 group-hover:text-slate-950">
                    <FiPhone className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">
                      Call our helpline
                    </span>
                    <p className="text-sm font-semibold text-white">
                      +1 (800) 555-0199
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-slate-300">
                    <FiMapPin className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">
                      Headquarters
                    </span>
                    <p className="text-sm font-semibold text-white">
                      San Francisco, CA • Worldwide Remote
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Level Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
                <FiClock className="shrink-0 text-sm text-emerald-400" />
                <span>
                  <strong>Quick Response:</strong> Average reply under 2 hours
                  during business days.
                </span>
              </div>
            </div>

            {/* Contact Form (Right Column) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:col-span-7">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Send us a message</h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Fill in your details below and we&apos;ll be in touch as soon
                  as possible.
                </p>
              </div>
              <ContactUsForm />
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Navigation Area */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info & Social (Column 1 - Spans 2 on desktop) */}
          <div className="space-y-4 sm:col-span-2">
            <div className="inline-block">
              <LogoMark />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              CareerHub is a next-generation career discovery platform connecting
              exceptional candidates with verified, high-growth companies.
              Better work begins here.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Connect With Us
              </span>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow CareerHub on LinkedIn"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:text-brand"
                >
                  <FiLinkedin className="text-lg" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow CareerHub on X (formerly Twitter)"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
                >
                  <FaXTwitter className="text-base" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View CareerHub on GitHub"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <FiGithub className="text-lg" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow CareerHub on Instagram"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:-translate-y-0.5 hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400"
                >
                  <FiInstagram className="text-lg" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/#about"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Services
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Opportunities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              For Job Seekers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/jobs"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Recruiter Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Recruiters & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Employers & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/post-job"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Post a Job Opening
                </Link>
              </li>
              <li>
                <Link
                  to="/manage-jobs"
                  className="text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Manage Listings
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPrivacy}
                  className="text-left text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openTerms}
                  className="text-left text-slate-400 transition hover:text-brand hover:underline underline-offset-4"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p className="text-center sm:text-left">
            &copy; 2026 CareerHub. All rights reserved. Better work begins here.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              type="button"
              onClick={openPrivacy}
              className="text-slate-400 transition hover:text-white"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-slate-700">
              •
            </span>
            <button
              type="button"
              onClick={openTerms}
              className="text-slate-400 transition hover:text-white"
            >
              Terms & Conditions
            </button>
            <span aria-hidden="true" className="text-slate-700">
              •
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-medium text-slate-400 transition hover:text-brand"
            >
              <span>Back to top</span>
              <FiArrowUp className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Legal Modals */}
      <LegalModal
        isOpen={legalModal.isOpen}
        type={legalModal.type}
        onClose={() => setLegalModal({ isOpen: false, type: "privacy" })}
      />
    </footer>
  );
}
