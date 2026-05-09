import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reportApi } from "../../api/report.api";
export const fetchDashboardStats = createAsyncThunk("dashboard/fetch", async (_, { rejectWithValue }) => {
  try { return await reportApi.dashboard(); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Failed" }); }
});
const slice = createSlice({
  name: "dashboard",
  initialState: { stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboardStats.pending, (s) => { s.loading = true; })
     .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload.data; })
     .addCase(fetchDashboardStats.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
