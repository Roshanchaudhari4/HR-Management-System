import { useEffect, useState } from "react";
import api from "../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    designation: "",
    role: "Employee",
    manager: "",
    joiningDate: "",
    status: "Active",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (department) {
        params.department = department;
      }

      if (role) {
        params.role = role;
      }

      if (status) {
        params.status = status;
      }

      const response = await api.get(
        "/employees",
        { params }
      );

      const records = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      setEmployees(records);

      setPagination({
        total:
          response.data?.pagination?.totalRecords ??
          records.length,

        pages:
          response.data?.pagination?.totalPages ??
          1,

        currentPage:
          response.data?.pagination?.currentPage ??
          page,
      });
    } catch (err) {
      console.error(
        "Employee API error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load employees."
      );

      setEmployees([]);

      setPagination({
        total: 0,
        pages: 1,
        currentPage: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get(
        "/departments"
      );

      const departmentData = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      setDepartments(departmentData);
    } catch (err) {
      console.error(
        "Department fetch error:",
        err.response?.data || err.message
      );

      setDepartments([]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get(
        "/employees",
        {
          params: {
            role: "Manager",
            status: "Active",
            page: 1,
            limit: 100,
          },
        }
      );

      const data = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      setManagers(data);
    } catch (err) {
      console.error(
        "Manager fetch error:",
        err.response?.data || err.message
      );

      setManagers([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [
    page,
    department,
    role,
    status,
  ]);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      department: "",
      designation: "",
      role: "Employee",
      manager: "",
      joiningDate: "",
      status: "Active",
    });

    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      password: "",

      department:
        employee.department?._id ||
        employee.department ||
        "",

      designation:
        employee.designation || "",

      role:
        employee.role || "Employee",

      manager:
        employee.manager?._id ||
        employee.manager ||
        "",

      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",

      status:
        employee.status || "Active",
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,

        department:
          formData.department || undefined,

        designation: formData.designation,

        role: formData.role,

        manager:
          formData.role === "Employee" &&
          formData.manager
            ? formData.manager
            : undefined,

        joiningDate:
          formData.joiningDate || undefined,

        status: formData.status,
      };

      if (!editingEmployee) {
        payload.password =
          formData.password;
      }

      if (editingEmployee) {
        await api.put(
          `/employees/${editingEmployee._id}`,
          payload
        );
      } else {
        await api.post(
          "/employees",
          payload
        );
      }

      setShowForm(false);
      resetForm();

      fetchEmployees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save employee."
      );
    }
  };

  const handleDeactivate = async (
    employeeId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.patch(
        `/employees/${employeeId}/deactivate`,
        {}
      );

      fetchEmployees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate employee."
      );
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setDepartment("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2>Employees</h2>

          <p>
            Manage employees and employee information
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddEmployee}
        >
          + Add Employee
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-4">
              <label className="form-label">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search name or email"
                value={search}
                onChange={handleSearch}
              />
            </div>

            <div className="col-lg-2 col-md-4">
              <label className="form-label">
                Department
              </label>

              <select
                className="form-select"
                value={department}
                onChange={(event) => {
                  setDepartment(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Departments
                </option>

                {departments.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-2 col-md-4">
              <label className="form-label">
                Role
              </label>

              <select
                className="form-select"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">
                  All Roles
                </option>

                <option value="Employee">
                  Employee
                </option>

                <option value="Manager">
                  Manager
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>
            </div>

            <div className="col-lg-2 col-md-4">
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

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="col-lg-2 d-flex align-items-end">
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5 text-muted"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map(
                    (employee) => (
                      <tr
                        key={
                          employee._id
                        }
                      >
                        <td>
                          <strong>
                            {employee.name}
                          </strong>
                        </td>

                        <td>
                          {employee.email}
                        </td>

                        <td>
                          {employee.department
                            ?.name ||
                            "Unassigned"}
                        </td>

                        <td>
                          {employee.designation ||
                            "-"}
                        </td>

                        <td>
                          <span className="badge bg-primary">
                            {employee.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              employee.status ===
                              "Active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              handleEditEmployee(
                                employee
                              )
                            }
                          >
                            Edit
                          </button>

                          {employee.status ===
                            "Active" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeactivate(
                                  employee._id
                                )
                              }
                            >
                              Deactivate
                            </button>
                          )}
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

      {showForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <form
                onSubmit={handleSubmit}
              >
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={
                          formData.name
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={
                          formData.email
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Phone
                      </label>

                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleFormChange
                        }
                      />
                    </div>

                    {!editingEmployee && (
                      <div className="col-md-6">
                        <label className="form-label">
                          Password
                        </label>

                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={
                            formData.password
                          }
                          onChange={
                            handleFormChange
                          }
                          minLength="6"
                          required
                        />
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label">
                        Department
                      </label>

                      <select
                        name="department"
                        className="form-select"
                        value={
                          formData.department
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option value="">
                          Select Department
                        </option>

                        {departments.map(
                          (item) => (
                            <option
                              key={
                                item._id
                              }
                              value={
                                item._id
                              }
                            >
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {formData.role ===
                      "Employee" && (
                      <div className="col-md-6">
                        <label className="form-label">
                          Manager
                        </label>

                        <select
                          name="manager"
                          className="form-select"
                          value={
                            formData.manager
                          }
                          onChange={
                            handleFormChange
                          }
                        >
                          <option value="">
                            Select Manager
                          </option>

                          {managers.map(
                            (manager) => (
                              <option
                                key={
                                  manager._id
                                }
                                value={
                                  manager._id
                                }
                              >
                                {
                                  manager.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label">
                        Designation
                      </label>

                      <input
                        type="text"
                        name="designation"
                        className="form-control"
                        value={
                          formData.designation
                        }
                        onChange={
                          handleFormChange
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Role
                      </label>

                      <select
                        name="role"
                        className="form-select"
                        value={
                          formData.role
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option value="Employee">
                          Employee
                        </option>

                        <option value="Manager">
                          Manager
                        </option>

                        <option value="Admin">
                          Admin
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Joining Date
                      </label>

                      <input
                        type="date"
                        name="joiningDate"
                        className="form-control"
                        value={
                          formData.joiningDate
                        }
                        onChange={
                          handleFormChange
                        }
                      />
                    </div>

                    {editingEmployee && (
                      <div className="col-md-6">
                        <label className="form-label">
                          Status
                        </label>

                        <select
                          name="status"
                          className="form-select"
                          value={
                            formData.status
                          }
                          onChange={
                            handleFormChange
                          }
                        >
                          <option value="Active">
                            Active
                          </option>

                          <option value="Inactive">
                            Inactive
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingEmployee
                      ? "Update Employee"
                      : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;