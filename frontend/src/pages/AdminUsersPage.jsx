import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  canViewEmployeesList,
  canCreateEmployee,
  canUpdateEmployee,
  canDeleteEmployee,
} from "../auth/permissions";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from "../services/apiClient";

function emptyForm() {
  return {
    name: "",
    email: "",
    department: "",
    title: "",
    status: "ACTIVE",
  };
}

export default function AdminUsersPage() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formValues, setFormValues] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!canViewEmployeesList(user)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Manage Employees</h1>
        <p className="mt-2 text-sm text-red-600">
          You are not authorized to view employee records.
        </p>
      </div>
    );
  }

  // Load employees on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to load employees", err);
        setError(err.message || "Failed to load employees");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function openCreate() {
    setFormValues(emptyForm());
    setEditingId(null);
    setIsCreateOpen(true);
    setIsEditOpen(false);
  }

  function openEdit(emp) {
    setFormValues({
      name: emp.name || "",
      email: emp.email || "",
      department: emp.department || "",
      title: emp.title || "",
      status: emp.status || "ACTIVE",
    });
    setEditingId(emp.id);
    setIsEditOpen(true);
    setIsCreateOpen(false);
  }

  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
    setFormValues(emptyForm());
    setSaving(false);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
        await createEmployee(formValues); 

        const data = await getEmployees();
        setEmployees(data);

        closeModals();
    } catch (err) {
        console.error("Failed to create employee", err);
        setError(err.message || "Failed to create employee");
    } finally {
        setSaving(false);
    }
  }

  async function handleUpdate(e) {
      e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");

    try {
        await updateEmployee(editingId, formValues);  
        const data = await getEmployees();           
        setEmployees(data);
        closeModals();
    } catch (err) {
        setError(err.message || "Failed to update employee");
    } finally {
        setSaving(false);
    }
  }

  async function handleDeactivate(id) {
     if (!window.confirm("Deactivate this employee?")) return;

    try {
        await deactivateEmployee(id);       
        const data = await getEmployees();  
        setEmployees(data);
    } catch (err) {
        setError(err.message || "Failed to deactivate employee");
    }
  }

  if (loading) {
    return <div className="p-6">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manage Employees</h1>
          <p className="text-sm text-gray-500">
            View and manage employee records. 
          </p>
        </div>

        {canCreateEmployee(user) && (
          <button
            onClick={openCreate}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            Add Employee
          </button>
        )}
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
          {error}
        </div>
      )}

      {/* Employees table */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Employees</h2>
        {employees.length === 0 ? (
          <p className="text-sm text-gray-500">No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-gray-500">
                <tr className="text-left">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{emp.id}</td>
                    <td className="py-2 pr-4">{emp.name}</td>
                    <td className="py-2 pr-4">{emp.email}</td>
                    <td className="py-2 pr-4">{emp.department}</td>
                    <td className="py-2 pr-4">{emp.title}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          emp.status === "ACTIVE"
                            ? "inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700"
                            : "inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                        }
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {canUpdateEmployee(user, emp.id) && (
                        <button
                          onClick={() => openEdit(emp)}
                          className="mr-2 text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteEmployee(user) && emp.status === "ACTIVE" && (
                        <button
                          onClick={() => handleDeactivate(emp.id)}
                          className="text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit panel */}
      {(isCreateOpen || isEditOpen) && (
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">
            {isCreateOpen ? "Add Employee" : "Edit Employee"}
          </h2>
          <form
            onSubmit={isCreateOpen ? handleCreate : handleUpdate}
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
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Department
              </label>
              <input
                name="department"
                value={formValues.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Title
              </label>
              <input
                name="title"
                value={formValues.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {!isCreateOpen && (
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-2 mt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : isCreateOpen
                  ? "Create Employee"
                  : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={closeModals}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
