import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
export const performanceApi = {
  list: (params) => apiGet("/performance", params),
  details: (id) => apiGet("/performance/" + id),
  create: (payload) => apiPost("/performance", payload),
  update: (id, payload) => apiPatch("/performance/" + id, payload),
  remove: (id) => apiDelete("/performance/" + id)
};
