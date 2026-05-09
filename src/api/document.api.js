import api from "./axios";
import { apiDelete, apiGet } from "../services/apiClient";
export const documentApi = {
  list: (params) => apiGet("/documents", params),
  details: (id) => apiGet("/documents/" + id),
  upload: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => form.append(k, v));
    const res = await api.post("/documents/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  },
  remove: (id) => apiDelete("/documents/" + id)
};
