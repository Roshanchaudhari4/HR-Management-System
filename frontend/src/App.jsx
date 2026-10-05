import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./services/api";

import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerTeam from "./pages/ManagerTeam";
import ManagerAttendance from "./pages/ManagerAttendance";
import ManagerLeaveRequests from "./pages/ManagerLeaveRequests";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MyAttendance from "./pages/MyAttendance";
import MyLeaves from "./pages/MyLeaves";
import MainLayout from "./layouts/MainLayout";

/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = sessionStorage.getItem("token");
  const storedUser = sessionStorage.getItem("user");

  /* If user is not logged in */
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  /* If role does not match */
  if (allowedRole && user?.role !== allowedRole) {
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === "Manager") {
      return <Navigate to="/manager/dashboard" replace />;
    }

    if (user?.role === "Employee") {
      return <Navigate to="/employee/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    leaveRequests: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/admin");

        const data = response.data?.data || {};

        setDashboardData({
          totalEmployees:
            data.employeeSummary?.totalEmployees ?? 0,

          activeEmployees:
            data.employeeSummary?.activeEmployees ?? 0,

          leaveRequests:
            data.leaveSummary?.pendingLeaves ?? 0,
        });
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Overview of your HR management system</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Total Employees</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.totalEmployees}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Active Employees</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.activeEmployees}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Leave Requests</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.leaveRequests}
            </h3>
          </div>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h4>Welcome to Admin Dashboard</h4>

        <p>
          Manage employees, attendance, leaves and other HR
          activities from here.
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   ADMIN ATTENDANCE
   ========================================================= */

const AttendanceRoute = () => {
  console.log("ADMIN ATTENDANCE ROUTE LOADED");

  return <Attendance />;
};

/* =========================================================
   APP
   ========================================================= */

const App = () => {
  return (
    <Routes>

      {/* ================= LOGIN ================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ================= HOME ================= */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="Admin">
            <MainLayout role="Admin" />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="employees"
          element={<Employees />}
        />

        <Route
          path="attendance"
          element={<AttendanceRoute />}
        />

        <Route
          path="leaves"
          element={<LeaveManagement />}
        />
      </Route>

      {/* ================= MANAGER ================= */}

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRole="Manager">
            <MainLayout role="Manager" />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<ManagerDashboard />}
        />

        <Route
          path="team"
          element={<ManagerTeam />}
        />

        <Route
          path="attendance"
          element={<ManagerAttendance />}
        />

        <Route
          path="leaves"
          element={<ManagerLeaveRequests />}
        />
      </Route>

      {/* ================= EMPLOYEE ================= */}

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRole="Employee">
            <MainLayout role="Employee" />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="attendance"
          element={<MyAttendance />}
        />

        <Route
          path="leaves"
          element={<MyLeaves />}
        />
      </Route>

      {/* ================= PAGE NOT FOUND ================= */}

      <Route
        path="*"
        element={
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <h2>Page Not Found</h2>
          </div>
        }
      />

    </Routes>
  );
};

export default App;