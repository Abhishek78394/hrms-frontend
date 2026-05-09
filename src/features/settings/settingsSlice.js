import { createSlice } from "@reduxjs/toolkit";
const slice = createSlice({ name: "settings", initialState: { theme: "light" }, reducers: {} });
export default slice.reducer;
