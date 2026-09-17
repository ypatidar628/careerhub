import { Link } from "react-router-dom";
export default function LogoMark() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white">
        C
      </span>
      CareerHub
    </Link>
  );
}
