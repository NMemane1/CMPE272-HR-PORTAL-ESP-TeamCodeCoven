import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  async function login({ email, password }) {
    const loggedIn = await apiLogin(email, password);
    setUser(loggedIn);
    navigate("/", { replace: true });
  }

  function logout() {
    setUser(null);
    navigate("/login", { replace: true });
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
