import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api";
import { authStorage } from "../../utils/storage";

const persisted = authStorage.get();
export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try { const res = await authApi.login(payload); return res.data; }
  catch (error) { return rejectWithValue(error?.response?.data || { message: "Login failed" }); }
});
export const logout = createAsyncThunk("auth/logout", async (_, { getState }) => authApi.logout(getState().auth.refreshToken));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persisted?.user || null,
    accessToken: persisted?.accessToken || null,
    refreshToken: persisted?.refreshToken || null,
    isAuthenticated: Boolean(persisted?.accessToken),
    loading: false,
    error: null
  },
  reducers: {
    updateUser: (s, a) => {
      s.user = { ...s.user, ...a.payload };
      authStorage.set({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.accessToken = a.payload.accessToken;
        if (a.payload.refreshToken) {
          s.refreshToken = a.payload.refreshToken;
        }
        s.isAuthenticated = true;
        authStorage.set({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken });
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Login failed"; })
      .addCase(logout.pending, (s) => {
        s.user = null;
        s.accessToken = null;
        s.refreshToken = null;
        s.isAuthenticated = false;
        authStorage.clear();
      })
      .addCase(logout.fulfilled, (s) => {
        // Already cleared in pending for immediate UI response
      })
      .addCase(logout.rejected, (s) => {
        // Already cleared in pending
      });
  }
});
export const { updateUser } = authSlice.actions;
export default authSlice.reducer;
