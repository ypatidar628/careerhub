import { useEffect } from "react";
import AboutUsSection from "../components/home/AboutUsSection";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full">
      {/* Page Hero Banner */}
      <section className="relative overflow-hidden bg-[#080b20] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="font-mono-display inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-200">
            OUR STORY & PHILOSOPHY
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Building the Future of{" "}
            <span className="text-[#b8b4ff]">Meaningful Work</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            We are on a mission to bring clarity, transparency, and human
            connection back to career exploration.
          </p>
        </div>
      </section>

      {/* Full About Section */}
      <AboutUsSection isStandalone />
    </div>
  );
}
