import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ["/dashboard", "/cms", "/admin", "/reseller"];

/** Endpoints that must never trigger the refresh flow. */
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Single-flight refresh: concurrent 401s share one refresh request instead of
 * firing a refresh per failed call.
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, updateToken } = useAuthStore.getState();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const nextAccessToken: string | undefined = response.data?.accessToken;
  const nextRefreshToken: string | undefined = response.data?.refreshToken;

  if (!nextAccessToken || !nextRefreshToken) {
    throw new Error("Refresh response did not include tokens");
  }

  updateToken(nextAccessToken, nextRefreshToken);
  return nextAccessToken;
}

function redirectToLoginOnce() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/login")) return;
  if (!PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) return;
  window.location.href = "/login";
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
      String(originalRequest?.url || "").includes(endpoint),
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const accessToken = await refreshPromise;
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        redirectToLoginOnce();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
