import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { getEmployeeById, updateEmployee } from "../services/apiClient";
import { canUpdateEmployee } from "../auth/permissions";

export default function ProfilePage() {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);  // from /employees/{id}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    department: "",
    title: "",
  });

  const canEditSelf = user && canUpdateEmployee(user, user.userId);

  // Load employee record on mount
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const emp = await getEmployeeById(user.userId);
        setEmployee(emp);
        setFormValues({
          name: emp.name || user.name || "",
          department: emp.department || "",
          title: emp.title || "",
        });
      } catch (err) {
        console.error("Failed to load employee profile", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formValues.name,
        department: formValues.department,
        title: formValues.title,
        status: employee?.status || "ACTIVE",
      };

      const updated = await updateEmployee(user.userId, payload);
      setEmployee(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <div className="p-6">No user logged in.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (error && !editMode) {
    return (
      <div className="p-6 text-red-600">
        Error loading profile: {error}
      </div>
    );
  }

  const jobTitle = employee?.title || "—";
  const department = employee?.department || "—";
  const status = employee?.status || "ACTIVE";
  const systemRole = user.role;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-sm text-gray-500">
            View and maintain your personal and job information.
          </p>
        </div>

        {canEditSelf && !loading && (
          <button
            type="button"
            onClick={() => setEditMode((prev) => !prev)}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            {editMode ? "Cancel" : "Edit My Profile"}
          </button>
        )}
      </header>

      {/* Basic info */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase">Name</div>
            <div className="font-medium">{employee?.name || user.name}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase">User ID</div>
            <div className="font-medium">{user.userId}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase">
              System Role
            </div>
            <div className="font-medium">{systemRole}</div>
          </div>
        </div>
      </section>

      {/* Job details / edit form */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Job Details</h2>

        {!editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase">Job Title</div>
              <div className="font-medium">{jobTitle}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">
                Department
              </div>
              <div className="font-medium">{department}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">
                Employment Status
              </div>
              <div className="font-medium">{status}</div>
            </div>
          </div>
        )}

        {editMode && (
          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-xl"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setError("");
                  // reset form to current employee data
                  if (employee) {
                    setFormValues({
                      name: employee.name || user.name || "",
                      department: employee.department || "",
                      title: employee.title || "",
                    });
                  }
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="md:col-span-2 text-sm text-red-600 mt-1">
                {error}
              </div>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
