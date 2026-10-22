import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: if the session has expired, log out and go to /login.
// Login/signup failures also return 401, but those must reach the form so it can
// show "Invalid credentials" — so they're skipped here.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthRequest = url.startsWith("/auth/login") || url.startsWith("/auth/signup");

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Render's free plan puts the server to sleep when idle. Ping it as soon as the
// app opens so it's awake by the time the user logs in or loads data.
export const wakeBackend = () => {
  fetch(API_URL, { method: "GET", cache: "no-store" }).catch(() => {});
};

export default api;
