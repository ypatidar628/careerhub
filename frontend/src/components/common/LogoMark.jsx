import { Link } from "react-router-dom";
export default function LogoMark() {
  return (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-2 text-lg font-bold text-ink dark:text-white sm:text-xl"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white">
        C
      </span>
      CareerHub
    </Link>
  );
}
