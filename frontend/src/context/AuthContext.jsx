import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    sessionStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setToken(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const {
      token: loginToken,
      user: loginUser,
    } = response.data.data;

    sessionStorage.setItem(
      "token",
      loginToken
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(loginUser)
    );

    setToken(loginToken);
    setUser(loginUser);

    return response.data;
  };

  const logout = () => {
    // Remove logged-in user data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Clear React authentication state
    setToken(null);
    setUser(null);

    // Redirect to login page
    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};