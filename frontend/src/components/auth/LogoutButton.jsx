import { useState } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../../api/client";
import { clearSession } from "../../store/authSlice";
// Local credentials are cleared even if the server is unreachable, preventing an unsafe authenticated-looking UI.
export default function LogoutButton({ showLabel = false }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const logout = async () => {
    setLoading(true);
    try {
      await client.post("/auth/logout");
    } catch {
      toast.error(
        "Could not contact the server; you have been signed out locally.",
      );
    } finally {
      dispatch(clearSession());
      localStorage.setItem("careerhub_logout", String(Date.now()));
      nav("/", { replace: true });
      toast.success("Signed out successfully.");
    }
  };
  return (
    <>
      <button
        aria-label="Sign out"
        onClick={() => setConfirm(true)}
        className={`rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
          showLabel
            ? "flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-600"
            : ""
        }`}
      >
        <FiLogOut />
        {showLabel && <span>Sign out</span>}
      </button>
      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <button
              aria-label="Close"
              onClick={() => setConfirm(false)}
              className="float-right"
            >
              <FiX />
            </button>
            <h2 className="text-xl font-bold">Sign out?</h2>
            <p className="mt-2 text-sm text-slate-500">
              You will need to sign in again to access your workspace.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={loading}
                onClick={() => setConfirm(false)}
                className="rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={logout}
                className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white"
              >
                {loading ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
