const KEY = "hrms.auth";
export const authStorage = {
  get: () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
  set: (v) => localStorage.setItem(KEY, JSON.stringify(v)),
  clear: () => localStorage.removeItem(KEY)
};
