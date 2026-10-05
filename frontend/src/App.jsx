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

const AttendanceRoute = () => {
  console.log("ADMIN ATTENDANCE ROUTE LOADED");

  return <Attendance />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={<MainLayout role="Admin" />}
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
        element={<MainLayout role="Manager" />}
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
        element={<MainLayout role="Employee" />}
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