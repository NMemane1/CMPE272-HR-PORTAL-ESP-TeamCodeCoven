import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import DashboardLayout from "./layouts/DashboardLayout";
import PayrollPage from "./pages/PayrollPage";
import PerformancePage from "./pages/PerformancePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import TeamPayrollPage from "./pages/TeamPayrollPage"; 
import TeamPerformancePage from "./pages/TeamPerformancePage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="team-payroll" element={<TeamPayrollPage />} />
            <Route path="team-performance" element={<TeamPerformancePage />} />
          </Route>

          {/* TODO: add 404 page later */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

