import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
export const employeeApi = {
  list: (params) => apiGet("/employees", params),
  getNextId: () => apiGet("/employees/next-id"),
  details: (id) => apiGet("/employees/" + id),
  create: (payload) => apiPost("/employees", payload),
  update: (id, payload) => apiPatch("/employees/" + id, payload),
  remove: (id) => apiDelete("/employees/" + id)
};
