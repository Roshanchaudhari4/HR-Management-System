import { useEffect, useState } from "react";
import api from "../services/api";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: filters.page,
        limit: 10,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.leaveType) {
        params.leaveType = filters.leaveType;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await api.get("/leaves", { params });

      const records = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setLeaves(records);

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
      setError(
        error.response?.data?.message ||
          "Failed to fetch leave requests."
      );
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [
    filters.status,
    filters.leaveType,
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
      status: "",
      leaveType: "",
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
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Leave Management</h3>
          <p className="text-muted mb-0">
            View and manage employee leave requests
          </p>
        </div>

        <div className="text-muted">
          Total Requests:{" "}
          <strong>{pagination.totalRecords}</strong>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Leave Type
              </label>

              <select
                name="leaveType"
                className="form-select"
                value={filters.leaveType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Earned">Earned</option>
                <option value="Unpaid">Unpaid</option>
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

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3">Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5 text-muted"
                    >
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-3">
                        <div className="fw-semibold">
                          {leave.employee?.name || "-"}
                        </div>

                        <small className="text-muted">
                          {leave.employee?.email || "-"}
                        </small>
                      </td>

                      <td>
                        {leave.leaveType?.name || "-"}
                      </td>

                      <td>
                        {formatDate(leave.startDate)}
                      </td>

                      <td>
                        {formatDate(leave.endDate)}
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {leave.days ?? 0}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth: "220px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={leave.reason || ""}
                        >
                          {leave.reason || "-"}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && leaves.length > 0 && (
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

export default LeaveManagement;