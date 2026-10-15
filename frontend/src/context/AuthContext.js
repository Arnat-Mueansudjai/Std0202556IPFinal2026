import React, { createContext, useState, useContext } from "react";
import { loginApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await loginApi(username, password);
      if (data && data.token) {
        setToken(data.token);
        setUser({ username });
        setLoading(false);
        return { success: true };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setLoading(false);
      const message = err.message || "Failed to login. Please check credentials.";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
