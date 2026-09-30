import client from "./client";

export const getSuperAdminStats = async () => {
  const { data } = await client.get("/super-admin/stats");
  return data;
};

export const getRecentActivity = async (limit = 20) => {
  const { data } = await client.get(`/super-admin/activity?limit=${limit}`);
  return data;
};

export const getAllUsers = async (params = {}) => {
  const { data } = await client.get("/admin/users", { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await client.get(`/admin/users/${id}`);
  return data;
};

export const createAdminUser = async (payload) => {
  const { data } = await client.post("/admin/users", payload);
  return data;
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await client.patch(`/admin/users/${id}`, payload);
  return data;
};

export const toggleUserStatus = async (id) => {
  const { data } = await client.patch(`/admin/users/${id}/status`);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await client.delete(`/admin/users/${id}`);
  return data;
};

export const getAdminsList = async () => {
  const { data } = await client.get("/super-admin/admins");
  return data;
};

export const createAdminAccount = async (payload) => {
  const { data } = await client.post("/super-admin/admins", payload);
  return data;
};

export const updateAdminAccount = async (id, payload) => {
  const { data } = await client.patch(`/super-admin/admins/${id}`, payload);
  return data;
};

export const deleteAdminAccount = async (id) => {
  const { data } = await client.delete(`/super-admin/admins/${id}`);
  return data;
};

export const getCandidatesList = async (params = {}) => {
  const { data } = await client.get("/admin/candidates", { params });
  return data;
};

export const getRecruitersList = async (params = {}) => {
  const { data } = await client.get("/admin/recruiters", { params });
  return data;
};

export const getPlatformJobsList = async (params = {}) => {
  const { data } = await client.get("/admin/jobs", { params });
  return data;
};

export const deletePlatformJob = async (id) => {
  const { data } = await client.delete(`/admin/jobs/${id}`);
  return data;
};

export const getPlatformApplicationsList = async (params = {}) => {
  const { data } = await client.get("/admin/applications", { params });
  return data;
};

export const updatePlatformApplicationStatus = async (id, payload) => {
  const { data } = await client.patch(`/admin/applications/${id}/status`, payload);
  return data;
};
