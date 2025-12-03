import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  canViewEmployeesList,
  canViewPerformance,
  canCreatePerformanceReview,
  canUpdatePerformanceReview,
} from "../auth/permissions";
import {
  getEmployees,
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
} from "../services/apiClient";

export default function TeamPerformancePage() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [myDepartment, setMyDepartment] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [formMode, setFormMode] = useState(null); // "create" or "edit"
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [formValues, setFormValues] = useState({
    period: "",
    rating: "",
    comments: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Guard: only MANAGER / HR_ADMIN
  if (!canViewEmployeesList(user)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Team Performance</h1>
        <p className="mt-2 text-sm text-red-600">
          You are not authorized to view team performance.
        </p>
      </div>
    );
  }

  const canCreate = canCreatePerformanceReview(user);   // MANAGER / HR_ADMIN
  const canUpdate = canUpdatePerformanceReview(user);   // MANAGER / HR_ADMIN

  // Load employees (team) – similar to TeamPayroll
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoadingEmployees(true);
      setEmployeesError("");

      try {
        const allEmployees = await getEmployees();
        let visible = allEmployees;

        if (user.role === "MANAGER") {
          const me = allEmployees.find((e) => e.id === user.userId);
          if (!me) {
            throw new Error(
              `Could not find employee record for userId=${user.userId}`
            );
          }
          setMyDepartment(me.department || "");
          visible = allEmployees.filter(
            (e) => e.department === me.department && e.id !== me.id
          );
        } else if (user.role === "HR_ADMIN") {
          setMyDepartment("All departments");
        }

        setEmployees(visible);
      } catch (err) {
        console.error("Failed to load employees for team performance", err);
        setEmployeesError(
          err.message || "Failed to load employees for team performance"
        );
      } finally {
        setLoadingEmployees(false);
      }
    }

    load();
  }, [user]);

  async function handleSelectEmployee(emp) {
    if (!canViewPerformance(user, emp.id)) {
      setReviewsError(
        "You are not allowed to view performance for this employee."
      );
      return;
    }

    setSelectedEmployee(emp);
    setReviews([]);
    setReviewsError("");
    setFormMode(null);
    setEditingReviewId(null);
    setSaveError("");

    setLoadingReviews(true);
    try {
      const data = await getPerformanceReviews(emp.id);
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load performance reviews", err);
      setReviewsError(err.message || "Failed to load performance reviews");
    } finally {
      setLoadingReviews(false);
    }
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingReviewId(null);
    setFormValues({
      period: "",
      rating: "",
      comments: "",
    });
    setSaveError("");
  }

  function openEditForm(review) {
    setFormMode("edit");
    setEditingReviewId(review.id);
    setFormValues({
      period: review.period || "",
      rating:
        typeof review.rating === "number"
          ? review.rating.toString()
          : review.rating || "",
      comments: review.comments || "",
    });
    setSaveError("");
  }

  function closeForm() {
    setFormMode(null);
    setEditingReviewId(null);
    setFormValues({
      period: "",
      rating: "",
      comments: "",
    });
    setSaveError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        period: formValues.period,
        rating: Number(formValues.rating),
        comments: formValues.comments,
        reviewerId: user.userId,
      };

      if (formMode === "create") {
        await createPerformanceReview(selectedEmployee.id, payload);
      } else if (formMode === "edit" && editingReviewId != null) {
        await updatePerformanceReview(
          selectedEmployee.id,
          editingReviewId,
          payload
        );
      }

      // Reload reviews for that employee
      const data = await getPerformanceReviews(selectedEmployee.id);
      setReviews(data || []);
      closeForm();
    } catch (err) {
      console.error("Failed to save performance review", err);
      setSaveError(err.message || "Failed to save performance review");
    } finally {
      setSaving(false);
    }
  }

  if (loadingEmployees) {
    return <div className="p-6">Loading team performance...</div>;
  }

  if (employeesError) {
    return (
      <div className="p-6 text-red-600">
        Error loading employees: {employeesError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Team Performance</h1>
        <p className="text-sm text-gray-500">
          {user.role === "HR_ADMIN"
            ? "View and manage performance reviews for any employee."
            : `View performance for employees in your department${
                myDepartment ? ` (${myDepartment})` : ""
              }.`}
        </p>
      </header>

      {/* Employees list */}
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
                    <td className="py-2 pr-4 text-gray-600">
                      {emp.status}
                    </td>
                    <td className="py-2 pr-4">
                      {canViewPerformance(user, emp.id) && (
                        <button
                          onClick={() => handleSelectEmployee(emp)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                        >
                          View Reviews
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

      {/* Reviews for selected employee */}
      {selectedEmployee && (
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">
                Performance for {selectedEmployee.name}
              </h2>
              <p className="text-xs text-gray-500">
                Employee ID {selectedEmployee.id} •{" "}
                {selectedEmployee.department} – {selectedEmployee.title}
              </p>
            </div>
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => {
                setSelectedEmployee(null);
                setReviews([]);
                setReviewsError("");
                closeForm();
              }}
            >
              Clear selection
            </button>
          </div>

          {reviewsError && (
            <div className="text-sm text-red-600">{reviewsError}</div>
          )}

          {loadingReviews ? (
            <p className="text-sm text-gray-500">
              Loading performance reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              No performance reviews found for this employee.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => {
                const ratingText =
                  typeof r.rating === "number"
                    ? r.rating.toFixed(1)
                    : r.rating ?? "N/A";
                return (
                  <div
                    key={r.id}
                    className="border border-slate-200 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <div className="font-semibold">{r.period}</div>
                      <div className="font-medium">
                        Rating: {ratingText} / 5
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Reviewer ID: {r.reviewerId}
                    </div>
                    <p className="mt-2 text-gray-700">{r.comments}</p>
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => openEditForm(r)}
                        className="mt-2 text-xs text-blue-600 hover:underline"
                      >
                        Edit Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add / Edit review form */}
          {canCreate && selectedEmployee && (
            <div className="border-t pt-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  {formMode === "edit"
                    ? "Edit Performance Review"
                    : "Add Performance Review"}
                </h3>
                {formMode && (
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!formMode && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  Add Review
                </button>
              )}

              {formMode && (
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm max-w-3xl mt-2"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Period
                    </label>
                    <input
                      name="period"
                      value={formValues.period}
                      onChange={handleChange}
                      placeholder="e.g. 2024-H1"
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      name="rating"
                      value={formValues.rating}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700">
                      Comments
                    </label>
                    <textarea
                      name="comments"
                      value={formValues.comments}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  <div className="md:col-span-3 flex items-center gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : formMode === "edit"
                        ? "Save Changes"
                        : "Add Review"}
                    </button>
                    {saveError && (
                      <span className="text-xs text-red-600">
                        {saveError}
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      )}

      {/* Debug */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Debug: employees</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(employees, null, 2)}
        </pre>
      </section>
    </div>
  );
}
