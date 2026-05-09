import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reportApi } from "../../api/report.api";
export const fetchReports = createAsyncThunk("reports/fetch", async (_, { rejectWithValue }) => {
  try { return await reportApi.dashboard(); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Failed" }); }
});
const slice = createSlice({
  name: "reports",
  initialState: { stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchReports.pending, (s) => { s.loading = true; })
     .addCase(fetchReports.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload.data; })
     .addCase(fetchReports.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
