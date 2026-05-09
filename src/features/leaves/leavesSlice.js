import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { leaveApi } from "../../api/leave.api";
export const fetchLeaves = createAsyncThunk("leaves/fetch", async (params, { rejectWithValue }) => {
  try { return await leaveApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "leaves",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchLeaves.pending, (s) => { s.loading = true; })
     .addCase(fetchLeaves.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchLeaves.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
