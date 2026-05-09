import { authApi } from "../api/auth.api";
import { authStorage } from "../utils/storage";
export const restoreSession = async () => { const current = authStorage.get(); if (!current?.refreshToken) return null; const res = await authApi.refresh(current.refreshToken); const next = { ...current, ...res.data }; authStorage.set(next); return next; };
