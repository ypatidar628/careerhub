import { Link } from "react-router-dom";
import logoImg from "../../assets/logo.png";

export default function LogoMark() {
  return (
    <Link
      to="/"
      className="group flex min-w-0 items-center gap-2.5 text-lg font-bold text-ink dark:text-white sm:text-xl"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-900/10 transition group-hover:scale-105 dark:bg-slate-800 dark:ring-white/20">
        <img
          src={logoImg}
          alt="CareerHub Logo"
          className="h-full w-full object-contain dark:invert"
        />
      </div>
      <span className="tracking-tight">CareerHub</span>
    </Link>
  );
}
