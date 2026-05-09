import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
export const recruitmentApi = {
  list: (params) => apiGet("/recruitment", params),
  details: (id) => apiGet("/recruitment/" + id),
  create: (payload) => apiPost("/recruitment", payload),
  update: (id, payload) => apiPatch("/recruitment/" + id, payload),
  remove: (id) => apiDelete("/recruitment/" + id)
};
