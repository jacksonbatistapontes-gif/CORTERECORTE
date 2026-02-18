import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const createJob = async (payload) => {
  const { data } = await axios.post(`${API}/jobs`, payload);
  return data;
};

export const listJobs = async () => {
  const { data } = await axios.get(`${API}/jobs`);
  return data;
};

export const getJob = async (jobId) => {
  const { data } = await axios.get(`${API}/jobs/${jobId}`);
  return data;
};

export const getJobClips = async (jobId) => {
  const { data } = await axios.get(`${API}/jobs/${jobId}/clips`);
  return data;
};

export const advanceJob = async (jobId) => {
  const { data } = await axios.post(`${API}/jobs/${jobId}/advance`);
  return data;
};

export const updateClip = async (jobId, clipId, payload) => {
  const { data } = await axios.patch(`${API}/jobs/${jobId}/clips/${clipId}`, payload);
  return data;
};

export const getDownloadUrl = (jobId) => {
  return `${BACKEND_URL || ""}/api/jobs/${jobId}/download`;
};
