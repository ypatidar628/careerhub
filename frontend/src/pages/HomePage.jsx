import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FiArrowRight,
  FiCheckCircle,
  FiSearch,
  FiZap,
  FiBriefcase,
  FiCompass,
  FiShield,
  FiLayers,
} from "react-icons/fi";
import SectionHeading from "../components/common/SectionHeading";
import JobCard from "../components/jobs/JobCard";
import Hero3DVisual from "../components/home/Hero3DVisual";
import TiltCard3D from "../components/common/TiltCard3D";
import client from "../api/client";

export default function HomePage() {
  const hero = useRef();
  const nav = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    client
      .get("/jobs", { params: { limit: 8 } })
      .then(({ data }) => {
        if (active) {
          setFeaturedJobs(data.jobs || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load featured jobs:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.11, duration: 0.75, ease: "power3.out" },
      );
    }, hero);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Interactive 3D Canvas */}
      <section
        ref={hero}
        className="relative isolate overflow-hidden bg-[#080b20] px-4 py-12 text-white sm:px-6 sm:py-16 md:py-24 lg:px-8"
      >
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
        <div className="w-full grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative z-10">
            <span className="hero-reveal font-mono-display rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-cyan-100 inline-flex items-center">
              <FiZap className="mr-2 inline text-cyan-400" /> CAREERS, REIMAGINED
            </span>
            <h1 className="hero-reveal mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl md:leading-[.98]">
              Find work that feels{" "}
              <span className="text-[#b8b4ff]">like your future.</span>
            </h1>
            <p className="hero-reveal mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A more human platform for discovering standout roles, telling your
              story, and moving your career forward.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/jobs?search=${e.target.search.value}`);
              }}
              className="hero-reveal mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-white p-2 text-slate-900 shadow-2xl sm:flex-row sm:items-center sm:gap-0"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <FiSearch className="m-3 shrink-0 text-slate-400" />
                <input
                  name="search"
                  aria-label="Search jobs"
                  className="min-w-0 flex-1 bg-transparent py-2 outline-none"
                  placeholder="Job title, skill, or company"
                />
              </div>
              <button className="rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:scale-[1.03] hover:bg-indigo-500 cursor-pointer">
                Search
              </button>
            </form>
            <div className="hero-reveal mt-7 flex flex-wrap gap-4 text-sm text-slate-300 sm:gap-7">
              <span>
                <b className="text-white">Active</b> opportunities
              </span>
              <span>
                <b className="text-white">Verified</b> hiring teams
              </span>
              <span>
                <b className="text-white">3D</b> Interactive Matching
              </span>
            </div>
          </div>

          {/* Interactive 3D Hero Visual */}
          <div className="hero-reveal relative">
            <Hero3DVisual />
          </div>
        </div>
      </section>

      {/* Curated Opportunities */}
      <section className="w-full px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          eyebrow="Curated opportunities"
          title="Roles worth showing up for"
          text="Fresh, high-quality openings from teams that are building the future."
        />

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id || job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-3xl text-brand dark:bg-brand/20">
              <FiBriefcase />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No jobs posted yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Recruiters are preparing new openings. Sign in or post a job to get started.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 font-bold text-brand hover:gap-3"
          >
            Explore all jobs <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Why CareerHub with 3D Tilt Feature Cards */}
      <section className="w-full bg-ink px-4 py-12 text-white sm:px-6 sm:py-20 lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Why CareerHub"
            title="Built for the whole journey"
            text="A calmer, clearer way for candidates and hiring teams to meet."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FiCompass,
                title: "Match with intent",
                desc: "Discover roles aligned to your skills, verified certifications, and career ambitions.",
                accent: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                icon: FiShield,
                title: "Show your best work",
                desc: "A polished, structured profile makes every application stand out to hiring decision-makers.",
                accent: "text-indigo-400",
                bg: "bg-indigo-500/10",
              },
              {
                icon: FiLayers,
                title: "Move faster",
                desc: "Stay organized from initial application through real-time recruiter chat and interview.",
                accent: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
            ].map((item, idx) => (
              <TiltCard3D
                key={idx}
                className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition duration-300 hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className={`mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl ${item.bg} ${item.accent} text-2xl transition duration-300 group-hover:scale-110`}>
                  <item.icon />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.desc}</p>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full px-4 py-12 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">
          Ready to find your next chapter?
        </h2>
        <p className="mt-3 text-slate-500">
          Join CareerHub and make your next move matter.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:-translate-y-1 hover:shadow-xl"
        >
          Create your profile
        </Link>
      </section>
    </div>
  );
}
