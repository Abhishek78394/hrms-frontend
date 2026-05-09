import { apiGet, apiPost } from "../services/apiClient";
export const attendanceApi = {
  checkIn: (deviceId) => apiPost("/attendance/check-in", { deviceId }),
  checkOut: () => apiPost("/attendance/check-out", {}),
  list: (params) => apiGet("/attendance", params)
};
