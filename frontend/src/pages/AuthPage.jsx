import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Button, Chip } from "@mui/material";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import client from "../api/client";
import { setSession } from "../store/authSlice";

const schema = z.object({
  name: z.string().min(2, "Enter your name").optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["candidate", "recruiter", "admin"]),
});

export default function AuthPage() {
  const [registering, setRegistering] = useState(false);
  const card = useRef();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "candidate" },
  });
  const dispatch = useDispatch();
  const nav = useNavigate();

  useLayoutEffect(() => {
    gsap.fromTo(
      card.current,
      { opacity: 0, y: 28, rotateY: -16 },
      { opacity: 1, y: 0, rotateY: 0, duration: 0.8, ease: "power3.out" },
    );
  }, []);

  const flipTo = (next) => {
    if (next === registering) return;
    gsap
      .timeline()
      .to(card.current, {
        rotateY: 180,
        scale: 0.96,
        duration: 0.38,
        ease: "power2.in",
      })
      .call(() => setRegistering(next))
      .to(card.current, {
        rotateY: 360,
        scale: 1,
        duration: 0.42,
        ease: "back.out(1.4)",
      });
  };

  const submit = async (values) => {
    try {
      const { data } = await client.post(
        `/auth/${registering ? "register" : "login"}`,
        values,
      );
      dispatch(setSession(data));
      toast.success(registering ? "Welcome to CareerHub!" : "Welcome back!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to continue.");
    }
  };

  const Field = ({ name, label, type = "text", icon }) => (
    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
      {label}
      <span className="relative mt-1 block">
        {icon}
        <input
          type={type}
          className="w-full rounded-xl border border-slate-300 bg-transparent py-3 pl-10 pr-3 text-slate-900 outline-brand dark:border-slate-600 dark:text-white"
          {...register(name)}
        />
      </span>
      {errors[name] && (
        <span className="text-xs text-rose-500">{errors[name].message}</span>
      )}
    </label>
  );

  return (
    <main className="auth-stage grid min-h-[calc(100vh-64px)] place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#ddd6fe,transparent_25%),radial-gradient(circle_at_80%_70%,#a5f3fc,transparent_25%)] p-5 dark:bg-slate-950">
      <form
        ref={card}
        onSubmit={handleSubmit(submit)}
        className="auth-card w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/90"
      >
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => flipTo(false)}
            className={`flex-1 rounded-lg py-2 font-semibold transition ${!registering ? "bg-white shadow dark:bg-slate-600 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => flipTo(true)}
            className={`flex-1 rounded-lg py-2 font-semibold transition ${registering ? "bg-white shadow dark:bg-slate-600 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            Register
          </button>
        </div>
        <Chip
          label={registering ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}
          size="small"
          color="primary"
          variant="outlined"
        />
        <h1 className="mt-4 text-3xl font-bold dark:text-white">
          {registering ? "Make your next move." : "Good to see you."}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {registering
            ? "Build a profile that opens doors."
            : "Your opportunities are waiting."}
        </p>
        <div className="mt-5 space-y-4">
          {registering && (
            <Field
              name="name"
              label="Full name"
              icon={
                <FiUser className="absolute left-3 top-3.5 text-slate-400" />
              }
            />
          )}
          <Field
            name="email"
            label="Email address"
            type="email"
            icon={<FiMail className="absolute left-3 top-3.5 text-slate-400" />}
          />
          <Field
            name="password"
            label="Password"
            type="password"
            icon={<FiLock className="absolute left-3 top-3.5 text-slate-400" />}
          />
          {registering && (
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              I’m joining as
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 outline-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                {...register("role")}
              >
                <option value="candidate" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Candidate</option>
                <option value="recruiter" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Recruiter</option>
                <option value="admin" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Admin</option>
              </select>
            </label>
          )}
          {!registering && (
            <a
              className="text-sm text-brand hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </a>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            endIcon={<FiArrowRight />}
            variant="contained"
            fullWidth
            sx={{
              py: 1.35,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {isSubmitting
              ? "Please wait…"
              : registering
                ? "Create account"
                : "Sign in"}
          </Button>
        </div>
        <p className="mt-5 font-mono-display text-[10px] text-slate-500 dark:text-slate-400">
          DEV DEMO · candidate@careerhub.dev / password123
        </p>
      </form>
    </main>
  );
}
