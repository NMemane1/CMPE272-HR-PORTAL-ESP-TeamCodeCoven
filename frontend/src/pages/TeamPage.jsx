import { useEffect, useState } from "react";
import { getEmployees } from "../services/apiClient";
import { useAuth } from "../auth/AuthProvider";

function TeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [myDepartment, setMyDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Get ALL employees from /api/employees
        const allEmployees = await getEmployees();

        let teamMembers = allEmployees;

        if (user.role === "MANAGER") {
          // find the logged-in manager's own employee record
          const me = allEmployees.find((e) => e.id === user.userId);

          if (!me) {
            throw new Error(
              `Could not find employee record for userId=${user.userId}`
            );
          }

          setMyDepartment(me.department || "");

          // team = everyone in the same department except the manager themself
          teamMembers = allEmployees.filter(
            (e) =>
              e.department === me.department &&
              e.id !== me.id
          );
        } else if (user.role === "ADMIN") {
          // admins see all employees 
          setMyDepartment("All departments");
          teamMembers = allEmployees;
        } else {
          teamMembers = [];
        }

        setTeam(teamMembers);
      } catch (err) {
        console.error("Failed to load team", err);
        setError(err.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (!user) {
    return <div className="p-6">No user logged in.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading team...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading team: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My Team</h1>
        <p className="text-sm text-gray-500">
          {user.role === "ADMIN"
            ? "Organization employees (admin view)."
            : `Employees in your department${
                myDepartment ? ` (${myDepartment})` : ""
              }.`}
        </p>
      </header>

      <section className="bg-white rounded-xl shadow p-4">
        {team.length === 0 ? (
          <p className="text-sm text-gray-500">No team members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{member.id}</td>
                    <td className="py-2 pr-4">{member.name}</td>
                    <td className="py-2 pr-4">{member.email}</td>
                    <td className="py-2 pr-4">{member.department}</td>
                    <td className="py-2 pr-4">{member.title}</td>
                    <td className="py-2 pr-4 text-gray-600">
                      {member.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Debug */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Debug: My team data</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(team, null, 2)}
        </pre>
      </section>
    </div>
  );
}

export default TeamPage;

