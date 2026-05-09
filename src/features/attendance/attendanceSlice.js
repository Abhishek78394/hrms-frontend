import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { attendanceApi } from "../../api/attendance.api";
export const fetchAttendance = createAsyncThunk("attendance/fetch", async (params, { rejectWithValue }) => {
  try { return await attendanceApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "attendance",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAttendance.pending, (s) => { s.loading = true; })
     .addCase(fetchAttendance.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchAttendance.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
