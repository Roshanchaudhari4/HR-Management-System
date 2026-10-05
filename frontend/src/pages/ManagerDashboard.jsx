import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    teamSummary: {
      totalTeamMembers: 0,
      presentToday: 0,
      absentToday: 0,
    },

    leaveSummary: {
      pendingLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
    },

    recentLeaves: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/manager");

      const data = response.data?.data || {};

      const recentLeaves = Array.isArray(
        data.recentLeaves
      )
        ? data.recentLeaves
        : [];

      const pendingLeaves = Array.isArray(
        data.pendingLeaves
      )
        ? data.pendingLeaves
        : [];

      setDashboardData({
        teamSummary: {
          totalTeamMembers:
            data.teamSummary?.totalTeamMembers ?? 0,

          presentToday:
            data.teamSummary?.presentToday ?? 0,

          absentToday:
            data.teamSummary?.absentToday ?? 0,
        },

        leaveSummary: {
          pendingLeaves: pendingLeaves.length,

          approvedLeaves:
            recentLeaves.filter(
              (leave) =>
                leave.status === "Approved"
            ).length,

          rejectedLeaves:
            recentLeaves.filter(
              (leave) =>
                leave.status === "Rejected"
            ).length,
        },

        recentLeaves,
      });
    } catch (error) {
      console.error(
        "Manager dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load manager dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboard();
      }
    };

    const handleWindowFocus = () => {
      fetchDashboard();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [fetchDashboard]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success-subtle text-success";

      case "Rejected":
        return "bg-danger-subtle text-danger";

      case "Cancelled":
        return "bg-secondary-subtle text-secondary";

      default:
        return "bg-warning-subtle text-warning-emphasis";
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Manager Dashboard</h2>

          <p>
            Manage your team and daily activities
          </p>
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
            <span>Total Team Members</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.teamSummary
                    .totalTeamMembers}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Present Today</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.teamSummary
                    .presentToday}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Absent Today</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.teamSummary
                    .absentToday}
            </h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <span>Pending Leaves</span>

            <h3>
              {loading
                ? "..."
                : dashboardData.leaveSummary
                    .pendingLeaves}
            </h3>
          </div>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h4>Leave Summary</h4>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <span className="text-muted">
                  Pending Leaves
                </span>

                <h4 className="fw-bold mt-2 mb-0">
                  {loading
                    ? "..."
                    : dashboardData.leaveSummary
                        .pendingLeaves}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <span className="text-muted">
                  Approved Leaves
                </span>

                <h4 className="fw-bold mt-2 mb-0">
                  {loading
                    ? "..."
                    : dashboardData.leaveSummary
                        .approvedLeaves}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <span className="text-muted">
                  Rejected Leaves
                </span>

                <h4 className="fw-bold mt-2 mb-0">
                  {loading
                    ? "..."
                    : dashboardData.leaveSummary
                        .rejectedLeaves}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body p-0">
          <div className="p-3 border-bottom">
            <h5 className="fw-bold mb-1">
              Recent Leave Requests
            </h5>

            <p className="text-muted mb-0 small">
              Leave requests from your team
            </p>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3">
                    Employee
                  </th>

                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >
                      Loading leave requests...
                    </td>
                  </tr>
                ) : dashboardData.recentLeaves
                    .length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >
                      No recent leave requests found.
                    </td>
                  </tr>
                ) : (
                  dashboardData.recentLeaves.map(
                    (leave) => (
                      <tr key={leave._id}>
                        <td className="px-3">
                          <div className="fw-semibold">
                            {leave.employee?.name ||
                              "-"}
                          </div>

                          <small className="text-muted">
                            {leave.employee?.email ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          {leave.leaveType?.name ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            leave.startDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            leave.endDate
                          )}
                        </td>

                        <td>
                          <strong>
                            {leave.days ?? 0}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            {leave.status ||
                              "Pending"}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;