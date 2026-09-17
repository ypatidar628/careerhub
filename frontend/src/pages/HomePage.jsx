import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FiArrowRight,
  FiCheckCircle,
  FiSearch,
  FiZap,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import SectionHeading from "../components/common/SectionHeading";
import JobCard from "../components/jobs/JobCard";
import { jobs } from "../data/mockData";
import careerJourney from "../assets/career-journey-3d.png";
// A generated 3D illustration plus depth layers gives the landing page a memorable visual identity.
export default function HomePage() {
  const hero = useRef();
  const nav = useNavigate();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.11, duration: 0.75, ease: "power3.out" },
      );
      gsap.to(".hero-image", {
        y: -10,
        rotation: 1.5,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, hero);
    return () => ctx.revert();
  }, []);
  return (
    <>
      <section
        ref={hero}
        className="relative isolate overflow-hidden bg-[#080b20] px-5 py-16 text-white md:py-24"
      >
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <span className="hero-reveal font-mono-display rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-cyan-100">
              <FiZap className="mr-2 inline" /> CAREERS, REIMAGINED
            </span>
            <h1 className="hero-reveal mt-6 max-w-3xl text-5xl font-bold leading-[.98] tracking-tight md:text-7xl">
              Find work that feels{" "}
              <span className="text-[#b8b4ff]">like your future.</span>
            </h1>
            <p className="hero-reveal mt-6 max-w-xl text-lg leading-8 text-slate-300">
              A more human platform for discovering standout roles, telling your
              story, and moving your career forward.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/jobs?search=${e.target.search.value}`);
              }}
              className="hero-reveal mt-8 flex max-w-xl rounded-2xl border border-white/10 bg-white p-2 text-slate-900 shadow-2xl"
            >
              <FiSearch className="m-3 text-slate-400" />
              <input
                name="search"
                aria-label="Search jobs"
                className="min-w-0 flex-1 bg-transparent outline-none"
                placeholder="Job title, skill, or company"
              />
              <button className="rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:scale-[1.03] hover:bg-indigo-500">
                Search
              </button>
            </form>
            <div className="hero-reveal mt-7 flex gap-7 text-sm text-slate-300">
              <span>
                <b className="text-white">12k+</b> open roles
              </span>
              <span>
                <b className="text-white">2,400+</b> teams
              </span>
            </div>
          </div>
          <div className="hero-reveal relative mx-auto w-full max-w-md">
            <div className="hero-orbit absolute inset-2 rounded-[2.4rem] border border-dashed border-cyan-200/30" />
            <img
              className="hero-image relative z-10 w-full rounded-[2rem] border border-white/15 shadow-[0_30px_80px_-20px_rgba(85,91,255,.7)]"
              src={careerJourney}
              alt="A professional moving upward through glowing career opportunities"
            />
            <div className="float-slow absolute -left-6 bottom-10 z-20 rounded-2xl border border-white/20 bg-slate-950/70 p-4 shadow-xl backdrop-blur">
              <FiTrendingUp className="text-xl text-cyan-300" />
              <p className="mt-2 text-xs text-slate-300">Your trajectory</p>
              <p className="font-mono-display font-bold text-white">
                +24% momentum
              </p>
            </div>
            <div className="absolute -right-4 top-12 z-20 rounded-2xl border border-white/20 bg-white/90 p-3 text-ink shadow-xl">
              <FiUsers className="text-brand" />
              <p className="mt-1 text-xs font-bold">Teams are hiring</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeading
          eyebrow="Curated opportunities"
          title="Roles worth showing up for"
          text="Fresh, high-quality openings from teams that are building the future."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Link
          to="/jobs"
          className="mt-8 inline-flex items-center gap-2 font-bold text-brand hover:gap-3"
        >
          Explore all jobs <FiArrowRight />
        </Link>
      </section>
      <section className="bg-ink px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why CareerHub"
            title="Built for the whole journey"
            text="A calmer, clearer way for candidates and hiring teams to meet."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                "Match with intent",
                "Discover roles aligned to your skills and ambitions.",
              ],
              [
                "Show your best work",
                "A polished profile makes every application stronger.",
              ],
              [
                "Move faster",
                "Stay organized from application through interview.",
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="group rounded-2xl bg-white/10 p-6 transition duration-300 hover:-translate-y-2 hover:bg-white/15"
              >
                <FiCheckCircle className="text-2xl text-mint transition group-hover:rotate-12" />
                <h3 className="mt-4 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-slate-300">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold dark:text-white">
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
    </>
  );
}
