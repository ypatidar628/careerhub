import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import client from "../../api/client";
import { clearSession, setSession } from "../../store/authSlice";
// Refresh only while the tab is visible and online; an already expired session is cleared by the API interceptor.
export default function SessionMonitor() {
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "careerhub_logout") dispatch(clearSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);
  useEffect(() => {
    if (!token) return undefined;
    const refresh = async () => {
      if (!navigator.onLine || document.hidden) return;
      try {
        const { data } = await client.post("/auth/refresh");
        dispatch(setSession(data));
      } catch {
        dispatch(clearSession());
        toast.error("Your session expired. Please sign in again.");
      }
    };
    const timer = setInterval(refresh, 60 * 60 * 1000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [token, dispatch]);
  return null;
}
