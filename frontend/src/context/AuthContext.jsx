import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a JWT token is expired by decoding its payload
  const isTokenExpired = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      // exp is in seconds, Date.now() in ms
      return !payload.exp || payload.exp * 1000 < Date.now();
    } catch {
      return true; // malformed token = treat as expired
    }
  };

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem("crosslink_user");
    const storedToken = localStorage.getItem("crosslink_token");
    if (storedUser && storedToken) {
      try {
        if (isTokenExpired(storedToken)) {
          // Token expired — clear stale session
          localStorage.removeItem("crosslink_user");
          localStorage.removeItem("crosslink_token");
          return;
        }
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem("crosslink_user");
        localStorage.removeItem("crosslink_token");
      }
    }
    setLoading(false);
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("crosslink_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("crosslink_user");
    }
  };

  const handleSetToken = (tokenData) => {
    setToken(tokenData);
    if (tokenData) {
      localStorage.setItem("crosslink_token", tokenData);
    } else {
      localStorage.removeItem("crosslink_token");
    }
  };

  const login = (userData, tokenData) => {
    handleSetUser(userData);
    handleSetToken(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("crosslink_user");
    localStorage.removeItem("crosslink_token");
  };

  const getRedirectPath = () => {
    if (!user) return "/";
    switch (user.userType) {
      case "ngo":
        return "/ngo/dashboard";
      case "volunteer":
        return "/volunteer/dashboard";
      case "corporate":
        return "/corporate/dashboard";
      default:
        return "/";
    }
  };

  const value = {
    user,
    token,
    loading,
    setUser: handleSetUser,
    setToken: handleSetToken,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
