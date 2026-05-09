import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
export const leaveApi = {
  list: (params) => apiGet("/leaves", params),
  details: (id) => apiGet("/leaves/" + id),
  create: (payload) => apiPost("/leaves", payload),
  update: (id, payload) => apiPatch("/leaves/" + id, payload),
  remove: (id) => apiDelete("/leaves/" + id)
};
