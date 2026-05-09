import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { payrollApi } from "../../api/payroll.api";
export const fetchPayroll = createAsyncThunk("payroll/fetch", async (params, { rejectWithValue }) => {
  try { return await payrollApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "payroll",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPayroll.pending, (s) => { s.loading = true; })
     .addCase(fetchPayroll.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchPayroll.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
