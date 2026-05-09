import { apiPost } from "../services/apiClient";
export const authApi = {
  login: (payload) => apiPost("/auth/login", payload),
  logout: (refreshToken) => apiPost("/auth/logout", { refreshToken }),
  refresh: (refreshToken) => apiPost("/auth/refresh-token", { refreshToken }),
  forgotPassword: (email) => apiPost("/auth/forgot-password", { email }),
  resetPassword: (payload) => apiPost("/auth/reset-password", payload)
};
