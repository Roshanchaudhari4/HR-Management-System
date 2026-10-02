import { useEffect, useState } from "react";
import api from "../services/api";

const ManagerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/dashboard/manager", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const teamMembers = response.data?.data?.teamMembers;

      setEmployees(
        Array.isArray(teamMembers) ? teamMembers : []
      );
    } catch (error) {
      console.error(
        "Team members error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = {
        page: filters.page,
        limit: 10,
      };

      if (filters.employee) {
        params.employee = filters.employee;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await api.get("/attendance/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const records = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setAttendance(records);

      setPagination({
        currentPage:
          response.data?.pagination?.currentPage ??
          filters.page,

        totalPages:
          response.data?.pagination?.totalPages ??
          1,

        totalRecords:
          response.data?.pagination?.totalRecords ??
          records.length,
      });
    } catch (error) {
      console.error(
        "Manager attendance error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load team attendance."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [
    filters.employee,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.page,
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      employee: "",
      status: "",
      startDate: "",
      endDate: "",
      page: 1,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

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
      return "-";
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
          <h2>Team Attendance</h2>
          <p>
            View and monitor attendance of your team members
          </p>
        </div>

        {!loading && (
          <div className="text-muted">
            Total Records:{" "}
            <strong>{pagination.totalRecords}</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Employee
              </label>

              <select
                name="employee"
                className="form-select"
                value={filters.employee}
                onChange={handleFilterChange}
              >
                <option value="">All Employees</option>

                {employees.map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Status
              </label>

              <select
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">
                From Date
              </label>

              <input
                type="date"
                name="startDate"
                className="form-control"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">
                To Date
              </label>

              <input
                type="date"
                name="endDate"
                className="form-control"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
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
                  <th className="px-3">Employee</th>
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
                ) : attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record._id}>
                      <td className="px-3">
                        <div className="fw-semibold">
                          {record.employee?.name || "-"}
                        </div>

                        <small className="text-muted">
                          {record.employee?.email || "-"}
                        </small>
                      </td>

                      <td>
                        {formatDate(record.date)}
                      </td>

                      <td>
                        {formatTime(record.checkIn)}
                      </td>

                      <td>
                        {formatTime(record.checkOut)}
                      </td>

                      <td>
                        {formatHours(record.workingHours)}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && attendance.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 border-top">
              <div className="text-muted small">
                Page {pagination.currentPage} of{" "}
                {pagination.totalPages}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      page: previous.page - 1,
                    }))
                  }
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={
                    pagination.currentPage >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      page: previous.page + 1,
                    }))
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

export default ManagerAttendance;