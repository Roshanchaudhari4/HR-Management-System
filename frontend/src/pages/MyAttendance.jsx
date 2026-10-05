import { useEffect, useState } from "react";
import api from "../services/api";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const fetchAttendance = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await api.get(
        "/attendance/history",
        {
          params,
        }
      );

      const data = response.data?.data || [];
      const paginationData =
        response.data?.pagination || {};

      setAttendance(
        Array.isArray(data) ? data : []
      );

      setPagination({
        currentPage:
          paginationData.currentPage || page,
        totalPages:
          paginationData.totalPages || 1,
        totalRecords:
          paginationData.totalRecords || 0,
      });

      const today = new Date();

      const todayRecord = data.find((record) => {
        if (!record.date) {
          return false;
        }

        const recordDate = new Date(record.date);

        return (
          recordDate.getFullYear() ===
            today.getFullYear() &&
          recordDate.getMonth() ===
            today.getMonth() &&
          recordDate.getDate() ===
            today.getDate()
        );
      });

      setTodayAttendance(
        todayRecord || null
      );
    } catch (error) {
      console.error(
        "My attendance error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance."
      );

      setAttendance([]);
      setTodayAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(1);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchAttendance(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "",
      startDate: "",
      endDate: "",
    };

    setFilters(clearedFilters);

    setTimeout(() => {
      fetchAttendance(1);
    }, 0);
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/attendance/check-in",
        {}
      );

      setSuccess(
        response.data?.message ||
          "Check-in successful."
      );

      await fetchAttendance(
        pagination.currentPage
      );
    } catch (error) {
      console.error(
        "Check-in error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Check-in failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/attendance/check-out",
        {}
      );

      setSuccess(
        response.data?.message ||
          "Check-out successful."
      );

      await fetchAttendance(
        pagination.currentPage
      );
    } catch (error) {
      console.error(
        "Check-out error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Check-out failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

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

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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

  const getStatusClass = (status) => {
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

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>My Attendance</h2>

          <p>
            View your attendance and mark today's attendance
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-1">
                Today's Attendance
              </h5>

              <p className="text-muted mb-0">
                {todayAttendance
                  ? `Status: ${todayAttendance.status}`
                  : "Attendance not marked yet"}
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCheckIn}
                disabled={
                  actionLoading ||
                  Boolean(
                    todayAttendance?.checkIn
                  )
                }
              >
                {actionLoading
                  ? "Processing..."
                  : "Check In"}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCheckOut}
                disabled={
                  actionLoading ||
                  !todayAttendance?.checkIn ||
                  Boolean(
                    todayAttendance?.checkOut
                  )
                }
              >
                {actionLoading
                  ? "Processing..."
                  : "Check Out"}
              </button>
            </div>
          </div>

          {todayAttendance && (
            <div className="row g-3 mt-3">
              <div className="col-md-3">
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

              <div className="col-md-3">
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

              <div className="col-md-3">
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

              <div className="col-md-3">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">
                    Status
                  </small>

                  <span
                    className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                      todayAttendance.status
                    )}`}
                  >
                    {todayAttendance.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            Attendance Filters
          </h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Late">
                  Late
                </option>

                <option value="Half Day">
                  Half Day
                </option>

                <option value="Absent">
                  Absent
                </option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Start Date
              </label>

              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                End Date
              </label>

              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end gap-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleApplyFilters}
              >
                Filter
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-3 border-bottom">
            <h5 className="mb-1">
              Attendance History
            </h5>

            <p className="text-muted mb-0 small">
              Total Records:{" "}
              {pagination.totalRecords}
            </p>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3">Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-5"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record._id}>
                      <td className="px-3">
                        {formatDate(record.date)}
                      </td>

                      <td>
                        {formatTime(
                          record.checkIn
                        )}
                      </td>

                      <td>
                        {formatTime(
                          record.checkOut
                        )}
                      </td>

                      <td>
                        {formatHours(
                          record.workingHours
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading &&
            attendance.length > 0 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <span className="text-muted small">
                  Page {pagination.currentPage} of{" "}
                  {pagination.totalPages}
                </span>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={
                      pagination.currentPage <= 1
                    }
                    onClick={() =>
                      fetchAttendance(
                        pagination.currentPage - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={
                      pagination.currentPage >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      fetchAttendance(
                        pagination.currentPage + 1
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;