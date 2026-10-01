import { Link } from "react-router-dom";
import {
  FiTarget,
  FiEye,
  FiAward,
  FiUsers,
  FiGlobe,
  FiBriefcase,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiZap,
} from "react-icons/fi";
import heroIllustration from "../../assets/job-search-hero.jpg";
import TiltCard3D from "../common/TiltCard3D";

const STATS = [
  {
    icon: FiBriefcase,
    value: "15,000+",
    label: "Active Opportunities",
    subtext: "Across tech, design, marketing & leadership",
    accent: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-100 dark:border-indigo-900/50",
  },
  {
    icon: FiAward,
    value: "98%",
    label: "Candidate Satisfaction",
    subtext: "Transparent hiring and prompt feedback loops",
    accent: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-100 dark:border-emerald-900/50",
  },
  {
    icon: FiUsers,
    value: "2,500+",
    label: "Verified Employers",
    subtext: "From seed-stage disruptors to enterprise leaders",
    accent: "text-brand dark:text-indigo-300",
    bg: "bg-brand/10 dark:bg-brand/20",
    border: "border-brand/20 dark:border-brand/30",
  },
  {
    icon: FiGlobe,
    value: "45+",
    label: "Global Markets",
    subtext: "Connecting remote & on-site talent worldwide",
    accent: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-100 dark:border-cyan-900/50",
  },
];

const VALUES = [
  {
    label: "Radical Transparency",
    desc: "Upfront salaries, verified roles, and direct interview feedback.",
  },
  {
    label: "Human-Centric Matching",
    desc: "Technology that elevates personal stories and authentic capability.",
  },
  {
    label: "Verified Opportunity",
    desc: "Every company and opening is vetted to prevent spam and ghosting.",
  },
  {
    label: "Speed & Clarity",
    desc: "Real-time communication tools that cut recruitment cycles by half.",
  },
];

export default function AboutUsSection({ isStandalone = false }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`relative w-full overflow-hidden transition-colors duration-200 ${
        isStandalone
          ? "py-12 sm:py-16"
          : "border-t border-slate-200/80 bg-slate-50/60 py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/50"
      }`}
    >
      {/* Ambient background glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 right-0 h-96 w-96 rounded-full bg-brand/5 blur-3xl dark:bg-brand/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-0 h-96 w-96 rounded-full bg-cyan-400/5 blur-3xl dark:bg-cyan-400/10"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="font-mono-display inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand dark:border-brand/30 dark:bg-brand/20 dark:text-indigo-300">
            <FiZap className="text-sm" /> ABOUT CAREERHUB
          </span>
          <h2
            id="about-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-ink dark:text-white sm:text-4xl lg:text-5xl"
          >
            Empowering Talent, Reimagining How Teams Grow
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            CareerHub was founded to replace archaic, black-box recruitment with
            a transparent, intuitive platform. We bring job seekers and hiring
            teams together through real-time communication, intelligent skill
            matching, and verified company insights — making career growth
            fulfilling, direct, and human.
          </p>
        </div>

        {/* Content & Visual Grid */}
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Mission, Vision, and Core Values */}
          <div className="space-y-6 lg:col-span-7">
            {/* Mission Card */}
            <div className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-xl text-brand dark:bg-brand/20 dark:text-indigo-300">
                  <FiTarget />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand dark:text-indigo-400">
                    Our Mission
                  </span>
                  <h3 className="text-xl font-bold text-ink dark:text-white">
                    Democratize Career Acceleration
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    To eliminate barriers between ambitious professionals and
                    forward-thinking companies through transparency, fairness,
                    and modern tools that honor talent above pedigree.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="shrink-0 text-emerald-500" />
                      <span>100% verified employer listings with salary clarity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="shrink-0 text-emerald-500" />
                      <span>Direct candidate-recruiter messaging & live updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-500/10 text-xl text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <FiEye />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Our Vision
                  </span>
                  <h3 className="text-xl font-bold text-ink dark:text-white">
                    A Borderless, Merit-First World of Work
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    We envision a global job ecosystem where potential knows no
                    geographical constraints, empowering creators and builders to
                    flourish wherever they do their best work.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="shrink-0 text-cyan-500" />
                      <span>Skills-first discovery powered by intelligent matching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="shrink-0 text-cyan-500" />
                      <span>Inclusive career mobility across 45+ international hubs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Core Values Badges */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/40">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                What Guides Us
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {VALUES.map((val, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-white">
                        {val.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {val.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Element Showcase */}
          <div className="relative lg:col-span-5">
            <TiltCard3D className="group relative rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-slate-700/80 dark:bg-slate-800 sm:p-4">
              {/* Main Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={heroIllustration}
                  alt="CareerHub platform team and job discovery workspace"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="font-mono-display inline-block rounded-md bg-brand/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    Human-First Technology
                  </span>
                  <p className="mt-1 text-sm font-semibold text-white/95">
                    Designed for talent, trusted by hiring managers.
                  </p>
                </div>
              </div>

              {/* Floating Badge 1 (Top Right) */}
              <div className="float-slow absolute -top-5 right-2 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 sm:-right-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Verified Hiring
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      2,500+ Partner Companies
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Left) */}
              <div className="float-medium absolute -bottom-5 left-2 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 sm:-left-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-indigo-300">
                    <FiShield className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Zero Ghosting Guarantee
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Direct recruiter feedback
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>

        {/* Stats & Key Achievements Grid */}
        <div className="mt-16 pt-10 border-t border-slate-200/70 dark:border-slate-800">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand dark:text-indigo-400">
              By The Numbers
            </span>
            <h3 className="mt-1 text-2xl font-bold text-ink dark:text-white">
              Proven Impact on Global Careers
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-3xl border ${stat.border} ${stat.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm transition duration-300 group-hover:scale-110 dark:bg-slate-800 ${stat.accent}`}
                    >
                      <Icon className="text-2xl" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Callout Link */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/80 sm:flex-row">
          <div>
            <h4 className="text-base font-bold text-ink dark:text-white">
              Want to join the CareerHub ecosystem?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Discover opportunities or begin recruiting exceptional candidates
              in minutes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-600 sm:text-sm"
            >
              Explore Openings <FiArrowRight />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"
            >
              Talk to Our Team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
