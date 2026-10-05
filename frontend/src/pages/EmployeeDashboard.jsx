import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/employee");

      setDashboardData(response.data?.data || null);
    } catch (error) {
      console.error(
        "Employee dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load employee dashboard."
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

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (hours) => {
    if (
      hours === null ||
      hours === undefined ||
      hours === ""
    ) {
      return "0.00 hrs";
    }

    return `${Number(hours).toFixed(2)} hrs`;
  };

  const getAttendanceStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-success-subtle text-success";

      case "Late":
        return "bg-warning-subtle text-warning-emphasis";

      case "Half Day":
        return "bg-info-subtle text-info-emphasis";

      case "Absent":
        return "bg-danger-subtle text-danger";

      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getLeaveStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success-subtle text-success";

      case "Pending":
        return "bg-warning-subtle text-warning-emphasis";

      case "Rejected":
        return "bg-danger-subtle text-danger";

      case "Cancelled":
        return "bg-secondary-subtle text-secondary";

      default:
        return "bg-light text-dark";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h2>Employee Dashboard</h2>
            <p>
              Overview of your attendance and leaves
            </p>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h2>Employee Dashboard</h2>
            <p>
              Overview of your attendance and leaves
            </p>
          </div>
        </div>

        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  const attendanceSummary =
    dashboardData?.attendanceSummary || {};

  const leaveSummary =
    dashboardData?.leaveSummary || {};

  const todayAttendance =
    dashboardData?.todayAttendance || null;

  const pendingLeaves =
    dashboardData?.pendingLeaves || [];

  const recentLeaves =
    dashboardData?.recentLeaves || [];

  const leaveBalances =
    dashboardData?.leaveBalance || [];

  const monthlyAttendancePercentage =
    attendanceSummary?.monthlyAttendancePercentage ??
    0;

  const totalLeaveBalance =
    Array.isArray(leaveBalances)
      ? leaveBalances.reduce(
          (total, leave) =>
            total +
            (Number(leave.remainingDays) || 0),
          0
        )
      : 0;

  const pendingLeaveCount =
    leaveSummary?.pendingLeaves ??
    pendingLeaves.length;

  return (
    <div className="dashboard-page">

      <div className="page-header">
        <div>
          <h2>Employee Dashboard</h2>

          <p>
            Overview of your attendance and leave
            information
          </p>
        </div>
      </div>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="dashboard-card-content">

            <span>
              Today's Attendance
            </span>

            <h3>
              {todayAttendance?.status ||
                "Not Marked"}
            </h3>

            <small className="text-muted">
              {todayAttendance
                ? `Check In: ${formatTime(
                    todayAttendance.checkIn
                  )}`
                : "No attendance record"}
            </small>

          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">

            <span>
              Working Hours
            </span>

            <h3>
              {formatHours(
                todayAttendance?.workingHours
              )}
            </h3>

            <small className="text-muted">
              Today's working hours
            </small>

          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">

            <span>
              Monthly Attendance
            </span>

            <h3>
              {Number(
                monthlyAttendancePercentage
              ).toFixed(2)}
              %
            </h3>

            <small className="text-muted">
              Current month
            </small>

          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">

            <span>
              Leave Balance
            </span>

            <h3>
              {totalLeaveBalance}
            </h3>

            <small className="text-muted">
              Available leave days
            </small>

          </div>
        </div>

      </div>

      <div className="row g-4 mt-1">

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <h5 className="mb-1">
                    Today's Attendance
                  </h5>

                  <p className="text-muted mb-0 small">
                    {formatDate(
                      todayAttendance?.date ||
                        new Date()
                    )}
                  </p>

                </div>

                <span
                  className={`badge rounded-pill px-3 py-2 ${getAttendanceStatusClass(
                    todayAttendance?.status
                  )}`}
                >
                  {todayAttendance?.status ||
                    "Not Marked"}
                </span>

              </div>

              {todayAttendance ? (

                <div className="row g-3">

                  <div className="col-md-4">

                    <div className="border rounded p-3">

                      <small className="text-muted d-block">
                        Check In
                      </small>

                      <strong>
                        {formatTime(
                          todayAttendance.checkIn
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="col-md-4">

                    <div className="border rounded p-3">

                      <small className="text-muted d-block">
                        Check Out
                      </small>

                      <strong>
                        {formatTime(
                          todayAttendance.checkOut
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="col-md-4">

                    <div className="border rounded p-3">

                      <small className="text-muted d-block">
                        Working Hours
                      </small>

                      <strong>
                        {formatHours(
                          todayAttendance.workingHours
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="text-center text-muted py-4">
                  No attendance marked for today.
                </div>

              )}

            </div>

          </div>

        </div>

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <h5 className="mb-1">
                    Leave Summary
                  </h5>

                  <p className="text-muted mb-0 small">
                    Your current leave information
                  </p>

                </div>

                <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
                  {pendingLeaveCount} Pending
                </span>

              </div>

              <div className="row g-3">

                <div className="col-6">

                  <div className="border rounded p-3">

                    <small className="text-muted d-block">
                      Leave Balance
                    </small>

                    <h4 className="mb-0">
                      {totalLeaveBalance}
                    </h4>

                  </div>

                </div>

                <div className="col-6">

                  <div className="border rounded p-3">

                    <small className="text-muted d-block">
                      Pending Leaves
                    </small>

                    <h4 className="mb-0">
                      {pendingLeaveCount}
                    </h4>

                  </div>

                </div>

              </div>

              {pendingLeaves.length > 0 && (

                <div className="mt-3">

                  <h6 className="mb-2">
                    Pending Requests
                  </h6>

                  {pendingLeaves
                    .slice(0, 3)
                    .map((leave) => (

                      <div
                        key={leave._id}
                        className="border rounded p-2 mb-2"
                      >

                        <div className="d-flex justify-content-between align-items-center">

                          <strong>
                            {leave.leaveType?.name ||
                              "-"}
                          </strong>

                          <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis">
                            Pending
                          </span>

                        </div>

                        <small className="text-muted">

                          {formatDate(
                            leave.startDate
                          )}{" "}
                          -{" "}
                          {formatDate(
                            leave.endDate
                          )}

                        </small>

                      </div>

                    ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body p-0">

          <div className="p-3 border-bottom">

            <h5 className="mb-1">
              Recent Leave Requests
            </h5>

            <p className="text-muted mb-0 small">
              Your recent leave applications
            </p>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-3">
                    Leave Type
                  </th>

                  <th>
                    Start Date
                  </th>

                  <th>
                    End Date
                  </th>

                  <th>
                    Days
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentLeaves.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >
                      No recent leave requests found.
                    </td>

                  </tr>

                ) : (

                  recentLeaves.map((leave) => (

                    <tr key={leave._id}>

                      <td className="px-3">
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
                        {leave.days || 0}
                      </td>

                      <td>

                        <span
                          title={
                            leave.reason || ""
                          }
                        >
                          {leave.reason
                            ? leave.reason.length >
                              30
                              ? `${leave.reason.substring(
                                  0,
                                  30
                                )}...`
                              : leave.reason
                            : "-"}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge rounded-pill px-3 py-2 ${getLeaveStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status || "-"}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;