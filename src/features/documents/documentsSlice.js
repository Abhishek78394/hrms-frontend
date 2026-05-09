import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { documentApi } from "../../api/document.api";
export const fetchDocuments = createAsyncThunk("documents/fetch", async (params, { rejectWithValue }) => {
  try { return await documentApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "documents",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDocuments.pending, (s) => { s.loading = true; })
     .addCase(fetchDocuments.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchDocuments.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; });
  }
});
export default slice.reducer;
