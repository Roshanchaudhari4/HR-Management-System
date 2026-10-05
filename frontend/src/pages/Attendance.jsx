import { useEffect, useState } from "react";
import api from "../services/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (status) {
        params.status = status;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get(
        "/attendance/team",
        {
          params,
        }
      );

      const records = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      setAttendance(records);

      setPagination({
        total:
          response.data?.pagination
            ?.totalRecords ?? 0,

        pages:
          response.data?.pagination
            ?.totalPages ?? 1,

        currentPage:
          response.data?.pagination
            ?.currentPage ?? page,
      });
    } catch (err) {
      console.error(
        "Attendance API error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );

      setAttendance([]);

      setPagination({
        total: 0,
        pages: 1,
        currentPage: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [
    page,
    status,
    startDate,
    endDate,
  ]);

  const handleClearFilters = () => {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
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

  const getStatusClass = (
    attendanceStatus
  ) => {
    switch (attendanceStatus) {
      case "Present":
        return "bg-success";

      case "Late":
        return "bg-warning text-dark";

      case "Half Day":
        return "bg-info text-dark";

      case "Absent":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Attendance</h2>

          <p>
            Manage employee attendance records
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target.value
                  );
                  setPage(1);
                }}
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

            <div className="col-lg-3 col-md-6">
              <label className="form-label">
                Start Date
              </label>

              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(event) => {
                  setStartDate(
                    event.target.value
                  );
                  setPage(1);
                }}
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label">
                End Date
              </label>

              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(event) => {
                  setEndDate(
                    event.target.value
                  );
                  setPage(1);
                }}
              />
            </div>

            <div className="col-lg-3 col-md-6 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
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
                      colSpan="6"
                      className="text-center py-5"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : attendance.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >
                      No attendance records
                      found.
                    </td>
                  </tr>
                ) : (
                  attendance.map(
                    (record) => (
                      <tr
                        key={record._id}
                      >
                        <td>
                          <strong>
                            {record
                              .employee
                              ?.name ||
                              "Unknown"}
                          </strong>

                          {record.employee
                            ?.email && (
                            <div className="small text-muted">
                              {
                                record
                                  .employee
                                  .email
                              }
                            </div>
                          )}

                          {record.employee
                            ?.designation && (
                            <div className="small text-muted">
                              {
                                record
                                  .employee
                                  .designation
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {formatDate(
                            record.date
                          )}
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
                          {record.workingHours !==
                            undefined &&
                          record.workingHours !==
                            null
                            ? `${Number(
                                record.workingHours
                              ).toFixed(
                                2
                              )} hrs`
                            : "-"}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status}
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

        {pagination.pages > 1 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Total: {pagination.total}
            </span>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(
                      previous - 1,
                      1
                    )
                  )
                }
              >
                Previous
              </button>

              <span className="btn btn-sm btn-light">
                Page {page} of{" "}
                {pagination.pages}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={
                  page >=
                  pagination.pages
                }
                onClick={() =>
                  setPage((previous) =>
                    Math.min(
                      previous + 1,
                      pagination.pages
                    )
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
  );
};

export default Attendance;