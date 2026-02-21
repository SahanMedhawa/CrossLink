import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./components/Home";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import Projects from "./pages/ngo/allprojects";
import NGOs from "./pages/ngo/NGOList";
import NGODashboard from "./pages/ngo/NGODashboard";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import CreateProject from "./pages/ngo/createproject";
import CorporateDashboard from "./pages/corporate/CorporateDashboard";
import NGOProjects from "./pages/ngo/myprojects";
import ResourceForm from "./pages/resource/ResourceForm";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // Wait for auth state to be restored
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard based on role
    switch (user.userType) {
      case "ngo":
        return <Navigate to="/ngo/dashboard" replace />;
      case "volunteer":
        return <Navigate to="/volunteer/dashboard" replace />;
      case "corporate":
        return <Navigate to="/corporate/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/ngos" element={<NGOs />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* NGO Routes - Protected */}
      <Route
        path="/ngo/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <NGODashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/create-project"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <CreateProject />
          </ProtectedRoute>
      }
    />

      <Route
        path="/ngo/ngoprojects"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <NGOProjects />
          </ProtectedRoute>
      }
    />

      {/* Volunteer Routes - Protected */}
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Corporate Routes - Protected */}
      <Route
        path="/corporate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <CorporateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/corporate/projects/:projectId/resources"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <ResourceForm />
          </ProtectedRoute>
        }
      />


      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
