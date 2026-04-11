import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { addNotification, selectAllNotifications, removeNotification } from "../../store/slices/notificationsSlice";
import { setActiveTab, selectActiveTab } from "../../store/slices/uiSlice";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CreateProjectModal from "./createproject";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '/api';

const NGODashboard = () => {
  const { user, token } = useAuth();

  // ─── Redux Hooks ───────────────────────────────────────────────────────────
  const dispatch = useDispatch();
  // Read global notification list and active tab from the Redux store
  const notifications = useSelector(selectAllNotifications);
  const activeTab = useSelector(selectActiveTab);

  // Get the actual user ID (could be 'id' or '_id')
  const userId = user?.id || user?._id;

  // Calculate days active
  const daysActive = user?.createdAt
    ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);

  // Fetch active projects count on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token || !userId) return;

      try {
        const response = await fetch(`${API_BASE}/projects/ngo/my-projects`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.projects)) {
          setActiveProjectsCount(data.projects.length);

          // ── Redux: mark the active tab in global UI state ──
          dispatch(setActiveTab("dashboard"));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);

        // ── Redux: dispatch an error notification into the global store ──
        dispatch(
          addNotification({
            message: "Could not load project data. Please refresh.",
            type: "error",
          })
        );
      }
    };

    fetchProjects();
  }, [token, userId, dispatch]);

  // Refresh data and dispatch notification after a project is created
  const handleProjectCreated = async () => {
    if (!token || !userId) return;
    try {
      const response = await fetch(`${API_BASE}/projects/ngo/my-projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.projects)) {
        setActiveProjectsCount(data.projects.length);

        // ── Redux: notify that a new project was created ──
        dispatch(
          addNotification({
            message: "New project created successfully! 🎉",
            type: "success",
          })
        );
      }
    } catch (error) {
      console.error("Error refreshing projects:", error);
      dispatch(
        addNotification({
          message: "Project created but dashboard refresh failed.",
          type: "warning",
        })
      );
    }
  };

  const quickStats = [
    {
      label: "Active Projects",
      value: activeProjectsCount,
      icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      tone: "blue",
    },
    {
      label: "Last Active",
      value: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      tone: "emerald",
    },
    {
      label: "Days Active",
      value: daysActive,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      tone: "violet",
    },
    {
      label: "Member Since",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "N/A",
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      tone: "indigo",
    },
  ];

  // Colour map for notification badges
  const notifColour = { success: "bg-emerald-500", error: "bg-red-500", warning: "bg-amber-500", info: "bg-blue-500" };

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">

        {/* ── Redux-powered Notification Banner ─────────────────────────── */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className={`flex items-center justify-between px-5 py-3 rounded-2xl text-white text-sm font-medium shadow ${notifColour[notif.type] ?? "bg-gray-700"}`}
              >
                <span>{notif.message}</span>
                <button
                  id={`dismiss-notif-${notif.id}`}
                  aria-label="Dismiss notification"
                  onClick={() => dispatch(removeNotification(notif.id))}
                  className="ml-4 text-white/80 hover:text-white transition-colors font-bold text-base leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10">
            {/* Redux active tab badge */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 capitalize">
              NGO Portal · {activeTab}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Welcome back,{" "}
              <span className="text-cyan-300 font-black">{user?.organizationName || user?.name}</span>
            </h2>
            <p className="text-blue-100/90 text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
              Manage NGO projects, collaborate with volunteers and corporates, and grow measurable impact.
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
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

        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button
            id="ngo-create-project-btn"
            onClick={() => {
              setIsModalOpen(true);
              dispatch(setActiveTab("create-project")); // ── Redux: update active tab
            }}
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

          <Link
            to="/ngo/volunteers"
            onClick={() => dispatch(setActiveTab("volunteers"))} // ── Redux: update active tab
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all block"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">Volunteer Management</h4>
            <p className="text-sm text-gray-500">Review requests and manage volunteer participation.</p>
          </Link>

          <Link
            to="/ngo/partners"
            onClick={() => dispatch(setActiveTab("partners"))} // ── Redux: update active tab
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all block"
          >
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

      {/* Project Creation Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          dispatch(setActiveTab("dashboard")); // ── Redux: reset active tab on close
        }}
        onProjectCreated={handleProjectCreated}
      />
    </DashboardLayout>
  );
};

export default NGODashboard;