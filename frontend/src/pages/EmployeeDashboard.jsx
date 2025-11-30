import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import StatCard from "../components/StatCard";
import {
  getEmployeeById,
  getPayrollForEmployee,
} from "../services/apiClient";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [emp, pay] = await Promise.all([
          getEmployeeById(user.userId),
          getPayrollForEmployee(user.userId),
        ]);
        setEmployee(emp);
        setPayroll(pay || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err.message || "Failed to load dashboard data");
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
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
      </div>
    );
  }

  // ----- Derive values from employee + payroll -----

  const title = employee?.title || user.role || "Employee";
  const department = employee?.department || "—";
  const status = employee?.status || "ACTIVE";

  // assume payroll array is latest-first in mock/backend;
  // if not, you can sort by month descending.
  const latest = payroll[0];
  const latestNetPay = latest?.netPay;
  const payrollCount = payroll.length;

  const latestNetPayText = latestNetPay
    ? `$${latestNetPay.toLocaleString()}`
    : "N/A";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your HR information and payroll.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {employee?.name || user.name} • {title} in {department}
        </p>
      </header>

      {/* Top stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Role / Title" value={title} />
        <StatCard label="Department" value={department} />
        <StatCard label="Status" value={status} />
        <StatCard label="Latest Net Pay" value={latestNetPayText} />
      </section>

      {/* Payroll summary */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Payroll Summary</h2>
        {payrollCount === 0 ? (
          <p className="text-sm text-gray-500">
            No payroll records found yet.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Showing {payrollCount} payroll record
              {payrollCount > 1 ? "s" : ""} for you.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
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
          </>
        )}
      </section>

      {/* Debug panel */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Debug: Employee + Payroll</h2>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-semibold mb-1">Employee</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(employee, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Payroll</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(payroll, null, 2)}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

