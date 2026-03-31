import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getMyApplications, updateParticipationRequest, deleteParticipationRequest } from "../../services/volunteerApi";
import ParticipationFormModal from "../../components/volunteer/ParticipationFormModal";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../services/socket";

const STATUS_COLORS = {
  requested: "bg-amber-100/80 text-amber-800 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
  approved: "bg-emerald-100/80 text-emerald-800 border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
  rejected: "bg-rose-100/80 text-rose-800 border-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.2)]",
  completed: "bg-blue-100/80 text-blue-800 border-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.2)]",
};

const STATUS_LABELS = {
  requested: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchApplications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const result = await getMyApplications();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      toast.error("Failed to load applications.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const currentUserId = user?.id || user?._id;

    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchApplications(false);
      }, 200);
    };

    const handleParticipationEvent = (event) => {
      if (event?.volunteerId && currentUserId && event.volunteerId !== currentUserId) {
        return;
      }
      scheduleRefresh();
    };

    const handleProjectEvent = () => {
      scheduleRefresh();
    };

    socket.on("participation:updated", handleParticipationEvent);
    socket.on("project:updated", handleProjectEvent);

    return () => {
      clearTimeout(refreshTimer);
      socket.off("participation:updated", handleParticipationEvent);
      socket.off("project:updated", handleProjectEvent);
    };
  }, [user?.id, user?._id, fetchApplications]);

  const filteredApplications =
    activeFilter === "all"
      ? applications
      : applications.filter((app) => app.status === activeFilter);

  const counts = {
    all: applications.length,
    requested: applications.filter((a) => a.status === "requested").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    completed: applications.filter((a) => a.status === "completed").length,
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      setEditLoading(true);
      const result = await updateParticipationRequest(editingApp._id, formData);
      if (result.success) {
        toast.success("Application updated successfully!");
        setShowEditModal(false);
        setEditingApp(null);
        fetchApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update application.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return;
    }
    try {
      setDeletingId(appId);
      const result = await deleteParticipationRequest(appId);
      if (result.success) {
        toast.success("Application withdrawn successfully!");
        setApplications((prev) => prev.filter((a) => a._id !== appId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to withdraw application.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        {/* Modern Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-400 opacity-20 blur-[80px] group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>
          <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 text-sm font-semibold mb-6 animate-fade-in-up">
                <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Track Journey
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Applications</span>
              </h2>
              <p className="text-emerald-50/90 text-lg md:text-xl max-w-2xl font-medium">
                Monitor the status of your project participation requests and view your upcoming volunteering history.
              </p>
            </div>
            {/* Quick Overview Mini-Stats */}
            <div className="hidden md:flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[100px]">
                <p className="text-3xl font-black text-white">{counts.approved}</p>
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mt-1">Approved</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[100px]">
                <p className="text-3xl font-black text-white">{counts.requested}</p>
                <p className="text-xs font-bold text-amber-200 uppercase tracking-wider mt-1">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Filter Tabs */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-2 lg:p-3 flex flex-wrap items-center gap-2 z-20 sticky top-6 overflow-x-auto no-scrollbar">
          {["all", "requested", "approved", "rejected", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[1.25rem] text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeFilter === filter
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105"
                : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className={`px-2 py-0.5 rounded-lg text-xs ${activeFilter === filter ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                {counts[filter]}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6 shadow-xl"></div>
            <p className="text-xl font-bold text-gray-800 animate-pulse">Loading applications...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 border-dashed shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No {activeFilter !== 'all' ? activeFilter : ''} applications found</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Ready to make a difference? Explore available projects and send your first participation request.
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApplications.length > 0 && (
          <div className="space-y-6">
            {filteredApplications.map((app, idx) => (
              <div
                key={app._id}
                className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden relative"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Decorative Side Bar indicating status */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${app.status === 'approved' ? 'bg-emerald-500' :
                  app.status === 'requested' ? 'bg-amber-500' :
                    app.status === 'rejected' ? 'bg-rose-500' : 'bg-blue-500'
                  }`}></div>

                <div className="p-6 sm:p-8 pl-8 sm:pl-10">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Project Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <h3 className="text-2xl font-extrabold text-gray-900 mb-2 truncate group-hover:text-emerald-700 transition-colors">
                        {app.projectId?.title || "Unknown Project"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mb-4 border-b border-gray-50 pb-4">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                          {app.ngoId?.organizationName || "Unknown NGO"}
                        </span>
                        {app.projectId?.location && (
                          <>
                            <span className="text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {app.projectId.location}
                            </span>
                          </>
                        )}
                        {app.approvedAt && (
                          <>
                            <span className="text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Approved on {new Date(app.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Required Skills Match display */}
                      {app.projectId?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
                          {app.projectId.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-[0.75rem] text-xs font-bold border border-gray-100 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timeline Data / Expanded details on right side */}
                    <div className="lg:w-1/3 bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        {app.preferredRole && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Role</p>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{app.preferredRole}</p>
                          </div>
                        )}
                        {app.expectedHours && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Commitment</p>
                            <p className="text-sm font-semibold text-gray-800">{app.expectedHours} hrs/wk</p>
                          </div>
                        )}
                      </div>

                      {(app.message || app.experienceSummary) && (
                        <div className="space-y-3 pt-3 border-t border-gray-200 border-dashed">
                          {app.message && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Motivation</p>
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 italic">" {app.message} "</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending actions strip */}
                  {app.status === "requested" && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleEdit(app)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 focus:ring-4 focus:ring-blue-100 transition-colors shadow-sm"
                      >
                        Edit Application
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        disabled={deletingId === app._id}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 focus:ring-4 focus:ring-rose-100 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {deletingId === app._id ? "Withdrawing..." : "Withdraw Application"}
                      </button>
                    </div>
                  )}

                  {/* Navigation strip for Approved Projects */}
                  {app.status === "approved" && app.projectId?.coordinates?.coordinates && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${app.projectId.coordinates.coordinates[1]},${app.projectId.coordinates.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Navigate to Location
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ParticipationFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingApp(null);
          }}
          onSubmit={handleEditSubmit}
          loading={editLoading}
          initialData={editingApp}
          isEdit={true}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </DashboardLayout>
  );
};

export default MyApplications;
