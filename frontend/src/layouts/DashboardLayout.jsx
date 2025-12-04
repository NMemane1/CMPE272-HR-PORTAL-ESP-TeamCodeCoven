import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import TopNav from "../components/TopNav";

export default function DashboardLayout() {
  const { user } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"], exact: true },
    { to: "/profile", label: "Profile", roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
    { to: "/payroll", label: "My Payroll", roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
    { to: "/performance", label: "My Performance", roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
    { to: "/team-payroll", label: "Team Payroll", roles: ["MANAGER", "HR_ADMIN"] }, 
    { to: "/team-performance", label: "Team Performance", roles: ["MANAGER", "HR_ADMIN"] }, 
    { to: "/admin", label: "Admin Dashboard", roles: ["HR_ADMIN"], exact: true },
    { to: "/admin/users", label: "Manage Employees", roles: ["HR_ADMIN", "MANAGER"] },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <TopNav />

      <div className="flex flex-1">
        <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
          <div className="p-4 text-sm border-b border-slate-800">
            <div className="font-semibold">Navigation</div>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {user &&
              links
                .filter((link) => link.roles.includes(user.role))
                .map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.exact}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm ${
                        isActive ? "bg-slate-700 font-medium" : "hover:bg-slate-800"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
            {user && (
              <>
                <div className="font-semibold text-slate-100">
                  {user.name}
                </div>
                <div>{user.email}</div>
                <div>{user.role}</div>
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
