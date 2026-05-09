import api from "./axios";
import { apiGet } from "../services/apiClient";
export const reportApi = {
  dashboard: () => apiGet("/reports/dashboard"),
  employeeCsv: async () => {
    const res = await api.get("/reports/employees/csv", { responseType: "blob" });
    return res.data;
  }
};
