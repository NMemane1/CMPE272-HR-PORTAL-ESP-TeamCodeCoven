import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { getPayrollForEmployee } from "../services/apiClient";

export default function PayrollPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const data = await getPayrollForEmployee(user.userId);
        setRecords(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load payroll");
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
    return <div className="p-6">Loading payroll history...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading payroll: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Payroll</h1>
        <p className="text-sm text-gray-500">
          Payroll history for {user.name}.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow p-4">
        {records.length === 0 ? (
          <p className="text-sm text-gray-500">No payroll records found.</p>
        ) : (
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
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{r.month}</td>
                    <td className="py-2 pr-4">${r.baseSalary.toLocaleString()}</td>
                    <td className="py-2 pr-4">${(r.bonus || 0).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      ${ (r.deductions || 0).toLocaleString() }
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      ${r.netPay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
