import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import dashboard from "../features/dashboard/dashboardSlice";
import employees from "../features/employees/employeeSlice";
import attendance from "../features/attendance/attendanceSlice";
import payroll from "../features/payroll/payrollSlice";
import leaves from "../features/leaves/leavesSlice";
import recruitment from "../features/recruitment/recruitmentSlice";
import performance from "../features/performance/performanceSlice";
import documents from "../features/documents/documentsSlice";
import reports from "../features/reports/reportsSlice";
import settings from "../features/settings/settingsSlice";

export const store = configureStore({
  reducer: { auth, dashboard, employees, attendance, payroll, leaves, recruitment, performance, documents, reports, settings }
});
