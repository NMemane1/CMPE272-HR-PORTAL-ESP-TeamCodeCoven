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

  const [employeeError, setEmployeeError] = useState("");
  const [payrollError, setPayrollError] = useState("");
  const [fatalError, setFatalError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      setEmployeeError("");
      setPayrollError("");
      setFatalError("");

      let emp = null;
      let pay = [];

      // 1) Load employee profile 
      try {
        emp = await getEmployeeById(user.userId);
        setEmployee(emp);
      } catch (err) {
        console.error("Failed to load employee profile", err);

        if (err.status === 403) {
          setEmployeeError(
            "You are not allowed to view this profile via this endpoint (role-based access control)."
          );
        } else if (err.status === 404) {
          setEmployeeError("No employee profile found for this user.");
        } else {
          setEmployeeError(err.message || "Failed to load employee details.");
        }

        // fall back to auth user only
        setEmployee(null);
      }

      // 2) Load payroll for this user
      try {
        pay = await getPayrollForEmployee(user.userId);
        setPayroll(Array.isArray(pay) ? pay : []);
      } catch (err) {
        console.error("Failed to load payroll data", err);

        if (err.status === 403) {
          setPayrollError(
            "You are not allowed to view detailed payroll for this user (role-based access control)."
          );
        } else {
          setPayrollError(err.message || "Failed to load payroll records.");
        }

        setPayroll([]);
      }

      if (!emp && payrollError && employeeError) {
        setFatalError(
          "We could not load any data for this dashboard. Please contact the administrator."
        );
      }

      setLoading(false);
    }

    load();
  }, [user]);

  if (!user) {
    return <div className="p-6">No user logged in.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (fatalError) {
    return (
      <div className="p-6 text-red-600">
        {fatalError}
      </div>
    );
  }

  // ----- Derive values from employee + payroll -----

  const title =
    employee?.title ||
    (user.role === "HR_ADMIN"
      ? "HR Admin"
      : user.role === "MANAGER"
      ? "Manager"
      : "Employee");

  const department = employee?.department || "—";
  const status = employee?.status || "ACTIVE";

  // Sort payroll by month descending (assuming YYYY-MM format)
  const sortedPayroll = [...payroll].sort((a, b) => {
    const am = a.month || "";
    const bm = b.month || "";
    return bm.localeCompare(am);
  });

  const latest = sortedPayroll[0];
  const latestNetPay = latest?.netPay;
  const payrollCount = sortedPayroll.length;

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
          {(employee?.name || user.name) ?? "User"} • {title}
          {department && department !== "—" ? ` in ${department}` : ""}
        </p>

        {(employeeError || payrollError) && (
          <div className="mt-3 space-y-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
            {employeeError && <p>Profile: {employeeError}</p>}
            {payrollError && <p>Payroll: {payrollError}</p>}
          </div>
        )}
      </header>

      {/* Top stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Role / Title" value={title} />
        <StatCard label="Department" value={department} />
        <StatCard label="Status" value={status} />
        <StatCard label="Latest Net Pay" value={latestNetPayText} />
      </section>

      {/* Payroll summary (no full table to avoid duplication with Payroll tab) */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Payroll Summary</h2>
        {payrollCount === 0 ? (
          <p className="text-sm text-gray-500">
            No payroll records found yet for your account.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Latest net pay:{" "}
              <span className="font-medium">{latestNetPayText}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For full payroll history and breakdown, use the{" "}
              <strong>Payroll</strong> tab in the navigation.
            </p>
          </>
        )}
      </section>
    </div>
  );
}