import { Link } from "react-router-dom";
export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-3xl font-bold dark:text-white">
        Reset your password
      </h1>
      <p className="mt-3 text-slate-500">
        Password reset email delivery is ready to connect to your production
        email provider.
      </p>
      <Link className="mt-6 inline-block text-brand" to="/auth">
        Back to sign in
      </Link>
    </main>
  );
}
