import { useEffect, useState } from "react";
import api from "../services/api";

const ManagerLeaveRequests = () => {
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

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

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

      const response = await api.get("/leaves/team", {
        params,
      });

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
      console.error(
        "Manager leave requests error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load leave requests."
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

  const handleApprove = async (leave) => {
    const confirmed = window.confirm(
      `Approve leave request for ${
        leave.employee?.name || "this employee"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setError("");

      await api.patch(
        `/leaves/${leave._id}/status`,
        {
          status: "Approved",
        }
      );

      setSelectedLeave(null);

      await fetchLeaves();
    } catch (error) {
      console.error(
        "Approve leave error:",
        error.response?.data || error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to approve leave request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) {
      return;
    }

    if (!rejectionReason.trim()) {
      setActionError(
        "Rejection reason is required."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setError("");

      await api.patch(
        `/leaves/${selectedLeave._id}/status`,
        {
          status: "Rejected",
          rejectionReason:
            rejectionReason.trim(),
        }
      );

      setSelectedLeave(null);
      setRejectionReason("");

      await fetchLeaves();
    } catch (error) {
      console.error(
        "Reject leave error:",
        error.response?.data || error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to reject leave request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectionReason("");
    setActionError("");
  };

  const closeRejectModal = () => {
    if (actionLoading) {
      return;
    }

    setSelectedLeave(null);
    setRejectionReason("");
    setActionError("");
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning-subtle text-warning-emphasis";

      case "Approved":
        return "bg-success-subtle text-success";

      case "Rejected":
        return "bg-danger-subtle text-danger";

      case "Cancelled":
        return "bg-secondary-subtle text-secondary";

      default:
        return "bg-light text-dark";
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Leave Requests</h2>

          <p>
            Manage leave requests from your team members
          </p>
        </div>

        {!loading && (
          <div className="text-muted">
            Total Records:{" "}
            <strong>
              {pagination.totalRecords}
            </strong>
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
                Status
              </label>

              <select
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
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
                <option value="">
                  All Leave Types
                </option>

                <option value="Casual">
                  Casual
                </option>

                <option value="Sick">
                  Sick
                </option>

                <option value="Earned">
                  Earned
                </option>

                <option value="Unpaid">
                  Unpaid
                </option>
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
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-5"
                    >
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
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
                            ? leave.reason.length > 30
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
                          className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status || "-"}
                        </span>
                      </td>

                      <td>
                        {leave.status ===
                        "Pending" ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                handleApprove(
                                  leave
                                )
                              }
                            >
                              {actionLoading
                                ? "..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                openRejectModal(
                                  leave
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading &&
            leaves.length > 0 && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 border-top">
                <div className="text-muted small">
                  Page{" "}
                  {pagination.currentPage} of{" "}
                  {pagination.totalPages}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    disabled={
                      pagination.currentPage <=
                      1
                    }
                    onClick={() =>
                      setFilters(
                        (previous) => ({
                          ...previous,
                          page:
                            previous.page - 1,
                        })
                      )
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
                      setFilters(
                        (previous) => ({
                          ...previous,
                          page:
                            previous.page + 1,
                        })
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

      {selectedLeave && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  Reject Leave Request
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <div className="fw-semibold">
                    Employee
                  </div>

                  <div className="text-muted">
                    {selectedLeave.employee?.name ||
                      "-"}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">
                    Leave Type
                  </div>

                  <div className="text-muted">
                    {selectedLeave.leaveType?.name ||
                      "-"}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Rejection Reason
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(
                        event.target.value
                      )
                    }
                    disabled={actionLoading}
                  />
                </div>

                {actionError && (
                  <div className="alert alert-danger mb-0">
                    {actionError}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Rejecting..."
                    : "Reject Leave"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerLeaveRequests;