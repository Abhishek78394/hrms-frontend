import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const EmployeesPage = lazy(() => import("../pages/EmployeesPage"));
const EmployeeFormPage = lazy(() => import("../pages/EmployeeFormPage"));
const AttendancePage = lazy(() => import("../pages/AttendancePage"));
const EmployeeAttendanceDetail = lazy(() => import("../pages/EmployeeAttendanceDetail"));
const LeavesPage = lazy(() => import("../pages/LeavesPage"));
const PayrollPage = lazy(() => import("../pages/PayrollPage"));
const RecruitmentPage = lazy(() => import("../pages/RecruitmentPage"));
const PerformancePage = lazy(() => import("../pages/PerformancePage"));
const DocumentsPage = lazy(() => import("../pages/DocumentsPage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const ESSProfilePage = lazy(() => import("../pages/ESSProfilePage"));
const CompliancePage = lazy(() => import("../pages/CompliancePage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<EmployeeFormPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/employee/:id" element={<EmployeeAttendanceDetail />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ess/profile" element={<ESSProfilePage />} />
            <Route path="/ess/leave" element={<LeavesPage />} />
            <Route path="/ess/attendance" element={<AttendancePage />} />
            <Route path="/ess/payslips" element={<PayrollPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
