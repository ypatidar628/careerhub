import axios from "axios";
import { store } from "../store/store";
import { clearSession } from "../store/authSlice";
const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
});
client.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
client.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) store.dispatch(clearSession());
    return Promise.reject(error);
  },
);
export default client;
