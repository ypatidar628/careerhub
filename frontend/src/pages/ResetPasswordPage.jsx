import { Link } from "react-router-dom";
export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-3xl font-bold dark:text-white">
        Choose a new password
      </h1>
      <input
        className="mt-5 w-full rounded-lg border p-3 dark:bg-slate-800"
        type="password"
        placeholder="New password"
      />
      <Link className="mt-4 inline-block text-brand" to="/auth">
        Return to sign in
      </Link>
    </main>
  );
}
