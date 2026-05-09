import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
export const payrollApi = {
  list: (params) => apiGet("/payroll", params),
  details: (id) => apiGet("/payroll/" + id),
  create: (payload) => apiPost("/payroll", payload),
  update: (id, payload) => apiPatch("/payroll/" + id, payload),
  remove: (id) => apiDelete("/payroll/" + id)
};
