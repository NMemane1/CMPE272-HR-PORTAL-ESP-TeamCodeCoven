import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import TopNav from "../components/TopNav";
import heroImage from "../assets/office.jpg";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("employee@company.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  }

  async function quickLogin(emailValue) {
    setError("");
    try {
      await login({ email: emailValue, password: "password" });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <TopNav />
      <div className="w-full h-[40vh] relative">
        <img
          src={heroImage}
          alt="HR portal workplace"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="px-6 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              HR Portal
            </h2>
            <p className="mt-3 text-base md:text-2xl text-slate-100/90">
              Sign in to view your employee, payroll, and performance data.
            </p>
          </div>
        </div>
      </div>

      {/* LARGE CARD */}
      <main className="flex-1 flex justify-center px-4 pb-10">
        <div className="w-full max-w-6xl -mt-8 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[50vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* LEFT: login */}
              <div className="flex flex-col justify-center px-8 py-10 md:px-12 bg-white">
                <header className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-semibold">
                    Welcome to the HR Portal!
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    Use your company email and password. In mock mode, you can
                    also use the quick login buttons below.
                  </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600">{error}</div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-6 text-xs text-gray-500">
                  <p className="font-semibold mb-2">
                    Quick logins for demo (mock mode):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => quickLogin("employee@company.com")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs hover:bg-slate-50"
                    >
                      Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin("manager@company.com")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs hover:bg-slate-50"
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin("admin@company.com")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs hover:bg-slate-50"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: info panel */}
              <div className="hidden md:flex flex-col justify-center bg-slate-900 text-slate-50 px-10 py-12">
                <h3 className="text-xl font-semibold mb-4">
                  One portal for all HR data
                </h3>
                <ul className="space-y-2 text-sm text-slate-100/90">
                  <li>• View your personal profile and job information</li>
                  <li>• Review your payroll history and net pay</li>
                  <li>• Track your performance reviews over time</li>
                  <li>• Managers and admins can manage employees centrally</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


/*
//need to add TopNav 

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If the user is already logged in, don't show login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSsoLogin = () => {
    // Kick off OAuth2/OIDC flow via backend
    window.location.href = `${BACKEND_BASE_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">HR Portal</h1>
          <p className="text-sm text-gray-500">
            Sign in with your enterprise account to access the HR Portal.
          </p>
        </header>

        <button
          onClick={handleSsoLogin}
          className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Sign in with Company SSO
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            This button redirects to the backend at{" "}
            <code className="bg-gray-100 px-1 rounded">
              {BACKEND_BASE_URL}/auth/login
            </code>{" "}
            which starts the OAuth2/OIDC flow.
          </p>
          <p>
            After successful login, you will be redirected back to the
            application and your dashboard will load.
          </p>
        </div>
      </div>
    </div>
  );
}
*/