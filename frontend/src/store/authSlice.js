import { createSlice } from "@reduxjs/toolkit";
const expiry = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000;
  } catch {
    return 0;
  }
};
const saved = JSON.parse(localStorage.getItem("careerhub_session") || "null");
const initial =
  saved?.expiresAt > Date.now()
    ? saved
    : { user: null, token: null, expiresAt: null };
const persist = (session) => {
  localStorage.setItem("careerhub_session", JSON.stringify(session));
  return session;
};
const authSlice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setSession: (_s, { payload }) =>
      persist({ ...payload, expiresAt: expiry(payload.token) }),
    updateUser: (state, { payload }) => persist({ ...state, user: payload }),
    clearSession: () => {
      localStorage.removeItem("careerhub_session");
      return { user: null, token: null, expiresAt: null };
    },
  },
});
export const { setSession, updateUser, clearSession } = authSlice.actions;
export default authSlice.reducer;
