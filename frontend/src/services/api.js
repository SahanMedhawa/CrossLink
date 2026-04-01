import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crosslink_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("crosslink_user");
      localStorage.removeItem("crosslink_token");
      // Only redirect if not already on a public page
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Signup user
export const signup = async (data) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Network error occurred",
      }
    );
  }
};

// Login user
export const login = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Network error occurred",
      }
    );
  }
};

// Get current user profile
export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Network error occurred",
      }
    );
  }
};

// Update user profile
export const updateProfile = async (data) => {
  try {
    const response = await api.put("/auth/profile", data);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Network error occurred",
      }
    );
  }
};

// Get user by ID (public info)
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/auth/user/${id}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Network error occurred",
      }
    );
  }
};

export default api;
