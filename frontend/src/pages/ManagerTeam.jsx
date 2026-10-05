import { useEffect, useState } from "react";
import api from "../services/api";

const ManagerTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/dashboard/manager"
        );

        const members =
          response.data?.data?.teamMembers;

        setTeamMembers(
          Array.isArray(members)
            ? members
            : []
        );
      } catch (error) {
        console.error(
          "Team members error:",
          error.response?.data ||
            error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load team members."
        );

        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>My Team</h2>

          <p>
            View your assigned team members
          </p>
        </div>

        {!loading && (
          <div className="text-muted">
            Total Members:{" "}
            <strong>
              {teamMembers.length}
            </strong>
          </div>
        )}
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
                  <th className="px-3">
                    Employee
                  </th>

                  <th>Email</th>
                  <th>Designation</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-5"
                    >
                      Loading team members...
                    </td>
                  </tr>
                ) : teamMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-5 text-muted"
                    >
                      No team members assigned.
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="px-3">
                        <div className="fw-semibold">
                          {member.name || "-"}
                        </div>
                      </td>

                      <td>
                        {member.email || "-"}
                      </td>

                      <td>
                        {member.designation || "-"}
                      </td>

                      <td>
                        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                          {member.status ||
                            "Active"}
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

export default ManagerTeam;