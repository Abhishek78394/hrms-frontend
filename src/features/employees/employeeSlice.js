import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employeeApi } from "../../api/employee.api";
export const fetchEmployees = createAsyncThunk("employees/fetch", async (params, { rejectWithValue }) => {
  try { return await employeeApi.list(params); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
export const createEmployee = createAsyncThunk("employees/create", async (payload, { rejectWithValue }) => {
  try { return await employeeApi.create(payload); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Create failed" }); }
});
export const updateEmployee = createAsyncThunk("employees/update", async ({ id, payload }, { rejectWithValue }) => {
  try { return await employeeApi.update(id, payload); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Update failed" }); }
});
export const deleteEmployee = createAsyncThunk("employees/delete", async (id, { rejectWithValue }) => {
  try { await employeeApi.remove(id); return id; } catch (error) { return rejectWithValue(error?.response?.data || { message: "Delete failed" }); }
});
export const fetchEmployeeById = createAsyncThunk("employees/fetchOne", async (id, { rejectWithValue }) => {
  try { return await employeeApi.details(id); } catch (error) { return rejectWithValue(error?.response?.data || { message: "Fetch failed" }); }
});
const slice = createSlice({
  name: "employees",
  initialState: { rows: [], meta: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchEmployees.pending, (s) => { s.loading = true; })
     .addCase(fetchEmployees.fulfilled, (s, a) => { s.loading = false; s.rows = a.payload.data || []; s.meta = a.payload.meta || {}; })
     .addCase(fetchEmployees.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed"; })
     .addCase(createEmployee.fulfilled, (s, a) => { if (a.payload?.data) s.rows.unshift(a.payload.data); })
     .addCase(updateEmployee.fulfilled, (s, a) => {
       if (!a.payload?.data?._id) return;
       const idx = s.rows.findIndex((r) => r._id === a.payload.data._id);
       if (idx >= 0) s.rows[idx] = a.payload.data;
     })
      .addCase(deleteEmployee.fulfilled, (s, a) => { s.rows = s.rows.filter((r) => r._id !== a.payload); })
      .addCase(fetchEmployeeById.fulfilled, (s, a) => {
        if (!a.payload?.data?._id) return;
        const idx = s.rows.findIndex((r) => r._id === a.payload.data._id);
        if (idx >= 0) s.rows[idx] = a.payload.data;
        else s.rows.push(a.payload.data);
      });
  }
});
export default slice.reducer;
