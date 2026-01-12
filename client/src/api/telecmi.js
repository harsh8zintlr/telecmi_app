import axios from "axios";

const API_BASE_URL = "https://telecmi-app-xeru.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin
export const validateToken = (data) => api.post("/admin/token", data);

// Users
export const listUsers = (data) => api.post("/users/list", data);
export const createUser = (data) => api.post("/users/add", data);
export const updateUser = (data) => api.post("/users/update", data);
export const deleteUser = (data) => api.post("/users/delete", data);

// User Login
export const userLogin = (data) => api.post("/users/login", data);
export const generateToken = (data) => api.post("/token", data);

// Click2Call
export const click2Call = (data) => api.post("/click2call", data);
export const hangupCall = (data) => api.post("/click2call/hangup", data);

// User CDR
export const getUserInCDR = (data) => api.post("/users/in_cdr", data);
export const getUserOutCDR = (data) => api.post("/users/out_cdr", data);
export const getUserMissed = (data) => api.post("/users/missed", data);
export const getUserOutMissed = (data) => api.post("/users/out_missed", data);
export const getUserAnswered = (data) => api.post("/users/answered", data);
export const getUserOutAnswered = (data) =>
  api.post("/users/out_answered", data);

// Notes
export const addNote = (data) => api.post("/users/notes/add", data);
export const getNotes = (data) => api.post("/users/notes/get", data);

// Admin CDR
export const getCallAnalysis = (data) => api.post("/analysis", data);
export const getAnswered = (data) => api.post("/answered", data);
export const getMissed = (data) => api.post("/missed", data);
export const getOutAnswered = (data) => api.post("/out_answered", data);
export const getOutMissed = (data) => api.post("/out_missed", data);

// Admin Click2Call
export const adminClick2Call = (data) => api.post("/admin/click2call", data);

// Live Calls
export const getLiveCalls = () => api.get("/webhooks/live");

export default api;
