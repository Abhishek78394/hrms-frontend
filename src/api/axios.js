import axios from "axios";
import { authStorage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000
});

let isRefreshing = false;
let queue = [];
const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.request.use((config) => {
  const auth = authStorage.get();
  if (auth?.accessToken) config.headers.Authorization = "Bearer " + auth.accessToken;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    if (axios.isCancel(error)) return Promise.reject(error);
    if (error?.response?.status === 401 && !original._retry && !String(original.url || "").includes("/auth/login")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          original.headers.Authorization = "Bearer " + token;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const current = authStorage.get();
        const { data } = await api.post("/auth/refresh-token", { refreshToken: current?.refreshToken });
        const tokens = data.data;
        authStorage.set({ ...current, ...tokens });
        processQueue(null, tokens.accessToken);
        original.headers.Authorization = "Bearer " + tokens.accessToken;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStorage.clear();
        if (window.location.pathname !== "/login") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export const apiCancelToken = () => axios.CancelToken.source();
