import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import StatCard from "../components/StatCard";
import { canViewGlobalPayroll } from "../auth/permissions";
import { getEmployees, getGlobalPayroll } from "../services/apiClient";

function getCurrentMonthString() {
  return new Date().toISOString().slice(0, 7);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [loading, setLoading] = useState(true);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [error, setError] = useState("");
  const [payrollError, setPayrollError] = useState("");
  const allowedForGlobalPayroll = canViewGlobalPayroll(user);

  if (!allowedForGlobalPayroll) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-red-600">
          You are not authorized to view global payroll data.
        </p>
      </div>
    );
  }
  // Load employees (for counts + departments)
  useEffect(() => {
    async function loadEmployees() {
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
    loadEmployees();
  }, []);

  // ---- Load global payroll for selected month ----
  useEffect(() => {
    async function loadPayroll() {
      setPayrollLoading(true);
      setPayrollError("");
      try {
        const data = await getGlobalPayroll({ month: selectedMonth });
        setPayroll(data);
      } catch (err) {
        console.error("Failed to load payroll", err);
        setPayrollError(err.message || "Failed to load payroll");
      } finally {
        setPayrollLoading(false);
      }
    }
    loadPayroll();
  }, [selectedMonth]);

  // ---- Derive admin stats from employees + payroll ----

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (e) => e.status === "ACTIVE"
  ).length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  const departmentsSet = new Set(
    employees.map((e) => e.department).filter(Boolean)
  );
  const activeDepartments = departmentsSet.size;

  const totalNetPay = payroll.reduce((sum, p) => sum + (p.netPay || 0), 0);
  const avgNetPay =
    payroll.length > 0 ? Math.round(totalNetPay / payroll.length) : 0;

  // Group employees by department for a small table
  const employeesByDept = Array.from(departmentsSet).map((dept) => ({
    department: dept,
    count: employees.filter((e) => e.department === dept).length,
  }));

  if (loading) {
    return <div className="p-6">Loading admin dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading admin data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Organization-wide overview of employees and payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600" htmlFor="month">
            Payroll month:
          </label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
      </header>

      {/* Top stats row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Active Employees" value={activeEmployees} />
        <StatCard label="Inactive Employees" value={inactiveEmployees} />
        <StatCard
          label={`Total Net Pay (${selectedMonth})`}
          value={
            payrollLoading
              ? "Loading..."
              : `$${totalNetPay.toLocaleString()}`
          }
        />
      </section>

      {/* Employees by department */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Employees by Department
        </h2>
        {employeesByDept.length === 0 ? (
          <p className="text-sm text-gray-500">No departments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-gray-500">
                <tr className="text-left">
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Headcount</th>
                </tr>
              </thead>
              <tbody>
                {employeesByDept.map((row) => (
                  <tr key={row.department} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{row.department}</td>
                    <td className="py-2 pr-4">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Global payroll table */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Global Payroll – {selectedMonth}
        </h2>

        {payrollError && (
          <div className="text-sm text-red-600 mb-2">
            Error loading payroll: {payrollError}
          </div>
        )}

        {payrollLoading ? (
          <p className="text-sm text-gray-500">Loading payroll data...</p>
        ) : payroll.length === 0 ? (
          <p className="text-sm text-gray-500">
            No payroll records found for this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-gray-500">
                <tr className="text-left">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">
                      {p.employeeName || `Employee #${p.employeeId}`}
                    </td>
                    <td className="py-2 pr-4">{p.department || "—"}</td>
                    <td className="py-2 pr-4">
                      ${p.netPay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!payrollLoading && payroll.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            Average net pay for this month:{" "}
            <span className="font-medium">
              ${avgNetPay.toLocaleString()}
            </span>
          </p>
        )}
      </section>
    </div>
  );
}
