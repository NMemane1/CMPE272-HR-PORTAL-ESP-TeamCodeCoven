import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  canViewEmployeesList,
  canViewEmployeePayroll,
  canCreatePayrollRecord,
  canViewGlobalPayroll,
} from "../auth/permissions";
import {
  getEmployees,
  getPayrollForEmployee,
  createPayrollRecordForEmployee,
  getGlobalPayroll,
} from "../services/apiClient";

function getCurrentMonthString() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export default function TeamPayrollPage() {
  const { user } = useAuth();

  // employees / team
  const [employees, setEmployees] = useState([]);
  const [myDepartment, setMyDepartment] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState("");

  // summary via GET /payroll
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [summaryPayroll, setSummaryPayroll] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // per-employee payroll
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [payrollError, setPayrollError] = useState("");

  // create payroll record (HR_ADMIN only)
  const [newRecord, setNewRecord] = useState({
    month: getCurrentMonthString(),
    baseSalary: "",
    bonus: "",
    deductions: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Only MANAGER / HR_ADMIN should see this page at all
  if (!canViewEmployeesList(user)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Team Payroll</h1>
        <p className="mt-2 text-sm text-red-600">
          You are not authorized to view team payroll.
        </p>
      </div>
    );
  }

  const canSeeGlobalSummary = canViewGlobalPayroll(user);
  const canCreate = canCreatePayrollRecord(user); // HR_ADMIN only

  // Load employees and determine team
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoadingEmployees(true);
      setEmployeesError("");

      try {
        const allEmployees = await getEmployees();
        let visibleEmployees = allEmployees;

        if (user.role === "MANAGER") {
          const me = allEmployees.find((e) => e.id === user.userId);
          if (!me) {
            throw new Error(
              `Could not find employee record for userId=${user.userId}`
            );
          }
          setMyDepartment(me.department || "");
          visibleEmployees = allEmployees.filter(
            (e) => e.department === me.department && e.id !== me.id
          );
        } else if (user.role === "HR_ADMIN") {
          setMyDepartment("All departments");
        }

        setEmployees(visibleEmployees);
      } catch (err) {
        console.error("Failed to load employees for team payroll", err);
        setEmployeesError(
          err.message || "Failed to load employees for team payroll"
        );
      } finally {
        setLoadingEmployees(false);
      }
    }

    load();
  }, [user]);

  // Departments list for HR_ADMIN dropdown
  const departmentOptions = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  );

  // Load summary via GET /payroll?month=&department=
  useEffect(() => {
    if (!canSeeGlobalSummary || !user) return;

    async function loadSummary() {
      setLoadingSummary(true);
      setSummaryError("");
      try {
        let deptParam;

        if (user.role === "MANAGER") {
          // manager -> always their department
          deptParam = myDepartment || undefined;
        } else if (user.role === "HR_ADMIN") {
          deptParam =
            selectedDeptFilter === "ALL" ? undefined : selectedDeptFilter;
        }

        const data = await getGlobalPayroll({
          month: selectedMonth,
          department: deptParam,
        });
        setSummaryPayroll(data || []);
      } catch (err) {
        console.error("Failed to load global payroll summary", err);
        setSummaryError(
          err.message || "Failed to load global payroll summary"
        );
      } finally {
        setLoadingSummary(false);
      }
    }

    // Only load when we know department for manager
    if (user.role === "MANAGER" && !myDepartment) return;
    loadSummary();
  }, [
    user,
    canSeeGlobalSummary,
    selectedMonth,
    selectedDeptFilter,
    myDepartment,
  ]);

  async function handleViewPayroll(emp) {
    if (!canViewEmployeePayroll(user, emp.id)) {
      setPayrollError("You are not allowed to view payroll for this employee.");
      return;
    }

    setSelectedEmployee(emp);
    setPayroll([]);
    setPayrollError("");
    setCreateError("");
    setNewRecord((prev) => ({
      ...prev,
      month: getCurrentMonthString(),
    }));
    setLoadingPayroll(true);

    try {
      const data = await getPayrollForEmployee(emp.id);
      setPayroll(data || []);
    } catch (err) {
      console.error("Failed to load payroll", err);
      setPayrollError(err.message || "Failed to load payroll records");
    } finally {
      setLoadingPayroll(false);
    }
  }

  async function handleCreateRecord(e) {
    e.preventDefault();
    if (!selectedEmployee) return;

    setCreating(true);
    setCreateError("");

    try {
      const payload = {
        month: newRecord.month,
        baseSalary: Number(newRecord.baseSalary || 0),
        bonus: Number(newRecord.bonus || 0),
        deductions: Number(newRecord.deductions || 0),
      };

      await createPayrollRecordForEmployee(selectedEmployee.id, payload);

      // Re-load this employee's payroll list
      const data = await getPayrollForEmployee(selectedEmployee.id);
      setPayroll(data || []);

      // Reset form
      setNewRecord({
        month: getCurrentMonthString(),
        baseSalary: "",
        bonus: "",
        deductions: "",
      });
    } catch (err) {
      console.error("Failed to create payroll record", err);
      setCreateError(err.message || "Failed to create payroll record");
    } finally {
      setCreating(false);
    }
  }

  if (loadingEmployees) {
    return <div className="p-6">Loading team payroll...</div>;
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
        <h1 className="text-2xl font-semibold">Team Payroll</h1>
        <p className="text-sm text-gray-500">
          {user.role === "HR_ADMIN"
            ? "View and manage payroll records for any employee."
            : `View payroll for employees in your department${
                myDepartment ? ` (${myDepartment})` : ""
              }.`}
        </p>
      </header>

      {/* 1) Summary via GET /payroll */}
      {canSeeGlobalSummary && (
        <section className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-semibold">
                Payroll Summary – {selectedMonth}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="month" className="text-gray-600">
                  Month:
                </label>
                <input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                />
              </div>

              {user.role === "HR_ADMIN" && (
                <div className="flex items-center gap-2">
                  <label htmlFor="dept" className="text-gray-600">
                    Department:
                  </label>
                  <select
                    id="dept"
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="ALL">All</option>
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {user.role === "MANAGER" && (
                <div className="text-xs text-gray-500">
                  Department: <span className="font-medium">{myDepartment}</span>
                </div>
              )}
            </div>
          </div>

          {summaryError && (
            <div className="text-sm text-red-600 mb-2">{summaryError}</div>
          )}

          {loadingSummary ? (
            <p className="text-sm text-gray-500">
              Loading payroll summary...
            </p>
          ) : summaryPayroll.length === 0 ? (
            <p className="text-sm text-gray-500">
              No payroll records found for this selection.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-gray-500">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryPayroll.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">
                        {p.employeeName || `Employee #${p.employeeId}`}
                      </td>
                      <td className="py-2 pr-4">{p.department || "—"}</td>
                      <td className="py-2 pr-4">{p.month}</td>
                      <td className="py-2 pr-4 font-medium">
                        ${p.netPay?.toLocaleString?.() ?? p.netPay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 2) Team employees list */}
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
                      {canViewEmployeePayroll(user, emp.id) && (
                        <button
                          onClick={() => handleViewPayroll(emp)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                        >
                          View Payroll
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

      {/* 3) Payroll for selected employee + create form for HR_ADMIN */}
      {selectedEmployee && (
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">
                Payroll for {selectedEmployee.name}
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
                setPayroll([]);
                setPayrollError("");
                setCreateError("");
              }}
            >
              Clear selection
            </button>
          </div>

          {payrollError && (
            <div className="text-sm text-red-600">{payrollError}</div>
          )}

          {loadingPayroll ? (
            <p className="text-sm text-gray-500">
              Loading payroll records...
            </p>
          ) : payroll.length === 0 ? (
            <p className="text-sm text-gray-500">
              No payroll records found for this employee.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm mb-2">
                <thead className="border-b text-gray-500">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Base Salary</th>
                    <th className="py-2 pr-4">Bonus</th>
                    <th className="py-2 pr-4">Deductions</th>
                    <th className="py-2 pr-4">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{r.month}</td>
                      <td className="py-2 pr-4">
                        ${r.baseSalary?.toLocaleString?.() ?? r.baseSalary}
                      </td>
                      <td className="py-2 pr-4">
                        ${(r.bonus || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        ${(r.deductions || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 font-medium">
                        ${r.netPay?.toLocaleString?.() ?? r.netPay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* HR_ADMIN: add payroll record */}
          {canCreate && (
            <div className="border-t pt-3 mt-2">
              <h3 className="text-sm font-semibold mb-2">
                Add Payroll Record 
              </h3>
              <form
                onSubmit={handleCreateRecord}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm max-w-3xl"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Month
                  </label>
                  <input
                    type="month"
                    name="month"
                    value={newRecord.month}
                    onChange={(e) =>
                      setNewRecord((prev) => ({
                        ...prev,
                        month: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={newRecord.baseSalary}
                    onChange={(e) =>
                      setNewRecord((prev) => ({
                        ...prev,
                        baseSalary: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Bonus
                  </label>
                  <input
                    type="number"
                    name="bonus"
                    value={newRecord.bonus}
                    onChange={(e) =>
                      setNewRecord((prev) => ({
                        ...prev,
                        bonus: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Deductions
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={newRecord.deductions}
                    onChange={(e) =>
                      setNewRecord((prev) => ({
                        ...prev,
                        deductions: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                  >
                    {creating ? "Saving..." : "Add Record"}
                  </button>
                  {createError && (
                    <span className="text-xs text-red-600">
                      {createError}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
