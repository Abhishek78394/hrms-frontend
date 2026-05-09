import api from "../api/axios";
const unwrap = (res) => res.data;
export const apiGet = (url, params, config = {}) => api.get(url, { ...config, params }).then(unwrap);
export const apiPost = (url, payload, config = {}) => api.post(url, payload, config).then(unwrap);
export const apiPatch = (url, payload, config = {}) => api.patch(url, payload, config).then(unwrap);
export const apiDelete = (url, config = {}) => api.delete(url, config).then(unwrap);
