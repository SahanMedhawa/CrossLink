import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import HomePage from "./components/Home";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import Projects from "./pages/ngo/allprojects";
import NGOs from "./pages/ngo/NGOList";
import NGODashboard from "./pages/ngo/NGODashboard";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import MatchedProjects from "./pages/volunteer/MatchedProjects";
import MyApplications from "./pages/volunteer/MyApplications";
import VolunteerActivity from "./pages/volunteer/VolunteerActivity";
import BrowseNGOs from "./pages/volunteer/BrowseNGOs";
import NgoProjectViewVolunteer from "./pages/volunteer/NgoProjectView";
import CreateProject from "./pages/ngo/createproject";
import CorporateDashboard from "./pages/corporate/CorporateDashboard";
import NGOProjects from "./pages/ngo/myprojects";
import ResourceForm from "./pages/resource/ResourceForm";
import ResourceDonationManagement from "./pages/corporate/ResourceDonationManagement";
import ProjectDonations from "./pages/resource/ProjectDonations";
import NGOPartners from './pages/corporate/NGOPartners';
import NgoProjectView from './pages/corporate/NgoProjectView';
import ImpactReports from './pages/corporate/ImpactReports';
import MyProposalsAndFunding from './pages/corporate/MyProposalsAndFunding';
import CsrInitiatives from './pages/corporate/CsrInitiatives';
import EmployeeVolunteering from './pages/corporate/EmployeeVolunteering';
import NgoVolunteerManagement from './pages/ngo/NgoVolunteerManagement';
import NGOProfile from "./pages/ngo/ngoprofile";
import NGOSPECIFICPROJECTS from "./pages/ngo/ngoprojects";
import SDGDashboard from "./pages/ngo/sdggoals";
import ProposalsAndFundings from './pages/ngo/ProposalsAndFundings';

import CorporateProfile from './pages/corporate/CorporateProfile';
import CorporatePartners from './pages/ngo/CorporatePartners';
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
        path="ngo/sdggoals"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <SDGDashboard />
          </ProtectedRoute>
      }
    />


     <Route
        path="/ngo/:ngoId/projects"
        element={
            <NGOSPECIFICPROJECTS />
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

      <Route
          path="/ngo/profile"
          element={
            <ProtectedRoute allowedRoles={["ngo"]}>
              <NGOProfile />
            </ProtectedRoute>
          }
        />

      <Route
        path="/ngo/ProjectDonations"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <ProjectDonations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/volunteers"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <NgoVolunteerManagement />
          </ProtectedRoute>
        }
      />

      <Route 
           path="/ngo/proposals-fundings" 
          element={<ProposalsAndFundings />} 
       />

      <Route
        path="/ngo/partners"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <CorporatePartners />
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
      <Route
        path="/volunteer/profile"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/projects"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <MatchedProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/applications"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/activity"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/ngos"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <BrowseNGOs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/ngo/:ngoId/projects"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <NgoProjectViewVolunteer />
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

      {/* Corporate NGO Projects Display */}
      <Route
        path="/corporate/ngo-partners"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <NGOPartners />
          </ProtectedRoute>
        }
      />

      <Route
        path="/corporate/ngo/:ngoId/projects"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <NgoProjectView />
          </ProtectedRoute>
        }
      />



      <Route
        path="/corporate/my-activities"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <MyProposalsAndFunding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/corporate/csr-initiatives"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <CsrInitiatives />
          </ProtectedRoute>
        }
      />

      <Route
        path="/corporate/volunteering"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <EmployeeVolunteering />
          </ProtectedRoute>
        }
      />



      <Route
        path="/corporate/reports"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <ImpactReports />
          </ProtectedRoute>
        }
      />

      <Route 
          path="/corporate/profile" 
          element={
             <ProtectedRoute allowedRoles={['corporate']}>
           <CorporateProfile />
      </ProtectedRoute>
      } 
      />

      
      {/* Resource Routes - Protected */}
      <Route
        path="/corporate/projects/:projectId/resources"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <ResourceForm />
          </ProtectedRoute>
        }
      />

      {/* Resource Routes - Protected */}
      <Route
        path="/corporate/resourcehManage"
        element={
          <ProtectedRoute allowedRoles={["corporate"]}>
            <ResourceDonationManagement />
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              duration: 5000,
              icon: '🎉',
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 4000,
              icon: '❌',
              style: {
                background: '#ef4444',
              },
            },
            loading: {
              icon: '⏳',
              style: {
                background: '#3b82f6',
              },
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
