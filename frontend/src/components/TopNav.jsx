import { useAuth } from "../auth/AuthProvider";

const PORTAL_NAME = "Enterprise HR Portal"; 

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Left: portal name */}
        <div className="text-slate-900 font-semibold text-lg tracking-tight">
          {PORTAL_NAME}
        </div>

        {/* Right: only show when logged in */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-medium text-slate-800">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
