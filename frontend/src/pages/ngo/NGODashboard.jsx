import React, { useState } from "react"; // Added useState
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CreateProjectModal from "./createproject"; // Import your new modal

const NGODashboard = () => {
  const { user } = useAuth();
  
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Optional: Function to refresh data after project creation
  const handleProjectCreated = () => {
    console.log("Project created! Refreshing dashboard stats...");
    // You could trigger a fetch request here to update the 'Active Projects' count
  };

  const quickStats = [
    {
      label: "Active Projects",
      value: 0,
      icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      tone: "blue",
    },
    {
      label: "Volunteers",
      value: 0,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
      tone: "emerald",
    },
    {
      label: "Corporate Partners",
      value: 0,
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
      tone: "indigo",
    },
    {
      label: "Impact Score",
      value: 0,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      tone: "violet",
    },
  ];

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              NGO Portal
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Welcome back, <span className="text-cyan-300 font-black">{user?.organizationName || user?.name}</span>
            </h2>
            <p className="text-blue-100/90 text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
              Manage NGO projects, collaborate with volunteers and corporates, and grow measurable impact.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((item) => (
            <div key={item.label} className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-gray-900">{item.value}</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-sm border border-blue-100">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-left bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">Create Project</h4>
            <p className="text-sm text-gray-500">Launch a new initiative and invite volunteers to join.</p>
          </button>

          <Link to="/ngo/volunteers" className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all block">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">Volunteer Management</h4>
            <p className="text-sm text-gray-500">Review requests and manage volunteer participation.</p>
          </Link>

          <Link to="/ngo/partners" className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all block">
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4 border border-violet-100">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">Corporate Partners</h4>
            <p className="text-sm text-gray-500">Build and track relationships with funding partners.</p>
          </Link>
        </div>

        <div className="text-center mt-2">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* --- Project Creation Modal --- */}
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </DashboardLayout>
  );
};

export default NGODashboard;