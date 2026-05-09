import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { recruitmentApi } from "../../api/recruitment.api";
export const fetchRecruitment = createAsyncThunk("recruitment/fetch", async (params, { rejectWithValue }) => {
  try { return await recruitmentApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "recruitment",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchRecruitment.pending, (s) => { s.loading = true; })
     .addCase(fetchRecruitment.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchRecruitment.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
