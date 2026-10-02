import { useEffect, useState } from "react";
import api from "../services/api";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    leaveType: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const params = {
        page,
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

      const response = await api.get("/leaves/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const data = response.data?.data || [];
      const paginationData =
        response.data?.pagination || {};

      setLeaves(Array.isArray(data) ? data : []);

      setPagination({
        currentPage:
          paginationData.currentPage || 1,
        totalPages:
          paginationData.totalPages || 1,
        totalRecords:
          paginationData.totalRecords || 0,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load leave requests."
      );

      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = getToken();

      const response = await api.get(
        "/leave-types/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data || [];

      setLeaveTypes(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load leave types."
      );
    }
  };

  useEffect(() => {
    fetchLeaves(1);
    fetchLeaveTypes();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchLeaves(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "",
      leaveType: "",
      startDate: "",
      endDate: "",
    };

    setFilters(clearedFilters);

    setTimeout(() => {
      fetchLeaves(1);
    }, 0);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const resetForm = () => {
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleSubmitLeave = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      if (
        !formData.leaveType ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.reason.trim()
      ) {
        setError(
          "Please fill all required fields."
        );
        return;
      }

      if (
        new Date(formData.endDate) <
        new Date(formData.startDate)
      ) {
        setError(
          "End date cannot be before start date."
        );
        return;
      }

      const token = getToken();

      const response = await api.post(
        "/leaves",
        {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data?.message ||
          "Leave applied successfully."
      );

      resetForm();
      setShowForm(false);

      await fetchLeaves(1);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to apply leave."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await api.patch(
        `/leaves/${leaveId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data?.message ||
          "Leave cancelled successfully."
      );

      await fetchLeaves(
        pagination.currentPage
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to cancel leave."
      );
    }
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

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>My Leaves</h2>
          <p>
            Apply for leave and view your leave requests
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? "Close" : "Apply Leave"}
        </button>
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

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">
              Apply for Leave
            </h5>

            <form onSubmit={handleSubmitLeave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Leave Type
                  </label>

                  <select
                    className="form-select"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select Leave Type
                    </option>

                    {leaveTypes.map((type) => (
                      <option
                        key={type._id}
                        value={type._id}
                      >
                        {type.name}
                      </option>
                    ))}
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
                    value={formData.startDate}
                    onChange={handleFormChange}
                    required
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
                    value={formData.endDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Reason
                  </label>

                  <textarea
                    className="form-control"
                    name="reason"
                    rows="3"
                    value={formData.reason}
                    onChange={handleFormChange}
                    placeholder="Enter reason for leave"
                    required
                  />
                </div>

                <div className="col-12 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading
                      ? "Submitting..."
                      : "Submit Leave"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            Leave Filters
          </h5>

          <div className="row g-3">
            <div className="col-md-3">
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
              <label className="form-label">
                Leave Type
              </label>

              <select
                className="form-select"
                name="leaveType"
                value={filters.leaveType}
                onChange={handleFilterChange}
              >
                <option value="">
                  All Leave Types
                </option>

                {leaveTypes.map((type) => (
                  <option
                    key={type._id}
                    value={type._id}
                  >
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
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

            <div className="col-md-2">
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
              My Leave Requests
            </h5>

            <p className="text-muted mb-0 small">
              Total Records: {pagination.totalRecords}
            </p>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3">
                    Leave Type
                  </th>
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
                      colSpan="7"
                      className="text-center py-5"
                    >
                      Loading leaves...
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
                          title={leave.reason || ""}
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
                          {leave.status}
                        </span>
                      </td>

                      <td>
                        {(leave.status ===
                          "Pending" ||
                          leave.status ===
                            "Approved") && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleCancelLeave(
                                leave._id
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}

                        {leave.status ===
                          "Rejected" &&
                          leave.rejectionReason && (
                            <span
                              className="text-muted small"
                              title={
                                leave.rejectionReason
                              }
                            >
                              Rejection reason
                            </span>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && leaves.length > 0 && (
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
                    fetchLeaves(
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
                    fetchLeaves(
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

export default MyLeaves;