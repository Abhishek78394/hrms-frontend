import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { performanceApi } from "../../api/performance.api";
export const fetchPerformance = createAsyncThunk("performance/fetch", async (params, { rejectWithValue }) => {
  try { return await performanceApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "performance",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPerformance.pending, (s) => { s.loading = true; })
     .addCase(fetchPerformance.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchPerformance.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
