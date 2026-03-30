import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getNgoProjectsWithVolunteers,
  getProjectVolunteers,
  updateParticipationStatus,
} from "../../services/volunteerApi";
import toast from "react-hot-toast";
import { resolveImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../services/socket";

const NgoVolunteerManagement = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProjects = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const result = await getNgoProjectsWithVolunteers();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      toast.error("Failed to load projects.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  const fetchVolunteersForProject = useCallback(async (projectId, showLoader = true) => {
    if (!projectId) return;

    try {
      if (showLoader) {
        setVolunteerLoading(true);
      }
      const result = await getProjectVolunteers(projectId);
      if (result.success) {
        setVolunteers(result.data);
      }
    } catch (error) {
      toast.error("Failed to load volunteers.");
    } finally {
      if (showLoader) {
        setVolunteerLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const scheduleRefresh = (callback) => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(callback, 200);
    };

    const handleProjectEvent = (event) => {
      if (event?.ngoId && currentUserId && event.ngoId !== currentUserId) {
        return;
      }

      scheduleRefresh(async () => {
        await fetchProjects(false);
        if (selectedProject?._id && (!event?.projectId || event.projectId === selectedProject._id)) {
          await fetchVolunteersForProject(selectedProject._id, false);
        }
      });
    };

    const handleParticipationEvent = (event) => {
      if (event?.ngoId && currentUserId && event.ngoId !== currentUserId) {
        return;
      }

      scheduleRefresh(async () => {
        await fetchProjects(false);
        if (selectedProject?._id && (!event?.projectId || event.projectId === selectedProject._id)) {
          await fetchVolunteersForProject(selectedProject._id, false);
        }
      });
    };

    socket.on("project:updated", handleProjectEvent);
    socket.on("participation:updated", handleParticipationEvent);

    return () => {
      clearTimeout(refreshTimer);
      socket.off("project:updated", handleProjectEvent);
      socket.off("participation:updated", handleParticipationEvent);
    };
  }, [currentUserId, selectedProject?._id, fetchProjects, fetchVolunteersForProject]);

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setStatusFilter("all");
    setExpandedId(null);
    await fetchVolunteersForProject(project._id);
  };

  const handleStatusUpdate = async (participationId, newStatus) => {
    try {
      setUpdatingId(participationId);
      const result = await updateParticipationStatus(participationId, newStatus);
      if (result.success) {
        toast.success(`Volunteer ${newStatus} successfully!`);
        if (selectedProject) {
          await fetchVolunteersForProject(selectedProject._id, false);
        }
        fetchProjects(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${newStatus} volunteer.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      approved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredVolunteers =
    statusFilter === "all"
      ? volunteers
      : volunteers.filter((v) => v.status === statusFilter);

  const volunteerCounts = {
    all: volunteers.length,
    requested: volunteers.filter((v) => v.status === "requested").length,
    approved: volunteers.filter((v) => v.status === "approved").length,
    rejected: volunteers.filter((v) => v.status === "rejected").length,
    completed: volunteers.filter((v) => v.status === "completed").length,
  };

  const ngoStats = {
    projects: projects.length,
    totalRequests: projects.reduce((sum, p) => sum + (p.volunteerRequests?.total || 0), 0),
    pending: projects.reduce((sum, p) => sum + (p.volunteerRequests?.requested || 0), 0),
    activeVolunteers: projects.reduce(
      (sum, p) => sum + (p.volunteerRequests?.approved || 0) + (p.volunteerRequests?.completed || 0),
      0
    ),
  };

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              NGO Volunteer Portal
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">Volunteer Management</h2>
            <p className="text-blue-100/90 text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
              Review applications, approve qualified volunteers, and complete participation cycles with confidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
            <p className="text-sm font-medium text-gray-500 mb-1">Projects</p>
            <p className="text-3xl font-bold text-gray-900">{ngoStats.projects}</p>
          </div>
          <div className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{ngoStats.totalRequests}</p>
          </div>
          <div className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
            <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{ngoStats.pending}</p>
          </div>
          <div className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
            <p className="text-sm font-medium text-gray-500 mb-1">Active Volunteers</p>
            <p className="text-3xl font-bold text-emerald-600">{ngoStats.activeVolunteers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Your Projects</h3>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No projects found. Create a project first.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleSelectProject(project)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedProject?._id === project._id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{project.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.location} &middot;{" "}
                        {(project.volunteerRequests?.approved || 0) + (project.volunteerRequests?.completed || 0)}/{project.volunteersNeeded || 5} active
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.volunteerRequests?.requested > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-[10px] font-semibold">
                            {project.volunteerRequests.requested} pending
                          </span>
                        )}
                        {project.volunteerRequests?.approved > 0 && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-md text-[10px] font-semibold">
                            {project.volunteerRequests.approved} approved
                          </span>
                        )}
                        {project.volunteerRequests?.completed > 0 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-semibold">
                            {project.volunteerRequests.completed} completed
                          </span>
                        )}
                        {(project.volunteerRequests?.total || 0) === 0 && (
                          <span className="text-[10px] text-gray-400">No applications yet</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Details */}
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">Select a project to view volunteer requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Project Header with Counts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedProject.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {(selectedProject.volunteerRequests?.approved || 0) + (selectedProject.volunteerRequests?.completed || 0)}/{selectedProject.volunteersNeeded || 5} volunteers active
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedProject.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {["all", "requested", "approved", "completed", "rejected"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          statusFilter === f
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({volunteerCounts[f]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volunteer List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {volunteerLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : filteredVolunteers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                      {statusFilter === "all"
                        ? "No volunteer requests for this project yet."
                        : `No ${statusFilter} volunteers.`}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredVolunteers.map((v) => {
                        const isExpanded = expandedId === v._id;
                        return (
                          <div key={v._id} className="transition-colors">
                            {/* Compact Row */}
                            <div
                              className={`p-4 cursor-pointer transition-colors ${isExpanded ? "bg-gray-50" : "hover:bg-gray-50"}`}
                              onClick={() => setExpandedId(isExpanded ? null : v._id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-base shrink-0 overflow-hidden">
                                  {v.volunteerId?.photoURL ? (
                                    <img
                                      src={resolveImageUrl(v.volunteerId.photoURL)}
                                      alt={v.volunteerId?.name || 'Volunteer'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    v.volunteerId?.name?.charAt(0)?.toUpperCase() || "?"
                                  )}
                                </div>

                                {/* Name + Meta */}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center justify-start gap-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">{v.volunteerId?.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(v.status)}`}>
                                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 text-left">
                                    {v.volunteerId?.email} &middot; {v.volunteerId?.location || "No location"} &middot; Applied {new Date(v.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                  {/* Skills inline */}
                                  <div className="flex flex-wrap gap-1 mt-1.5 justify-start">
                                    {v.volunteerId?.skills?.slice(0, 5).map((skill) => (
                                      <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px]">
                                        {skill}
                                      </span>
                                    ))}
                                    {(v.volunteerId?.skills?.length || 0) > 5 && (
                                      <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                                        +{v.volunteerId.skills.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Actions + Expand Toggle */}
                                <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                                  {v.status === "requested" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(v._id, "approved"); }}
                                        disabled={updatingId === v._id}
                                        className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(v._id, "rejected"); }}
                                        disabled={updatingId === v._id}
                                        className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {v.status === "approved" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(v._id, "completed"); }}
                                      disabled={updatingId === v._id}
                                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      Mark Complete
                                    </button>
                                  )}
                                  <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Application Details */}
                            {isExpanded && (
                              <div className="px-4 pb-5 pt-2 sm:pl-[4.5rem]">
                                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mt-2">
                                  <div className="p-5 sm:p-6 space-y-6">
                                    {/* Motivation Message */}
                                    <div>
                                      <h5 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                        Motivation Message
                                      </h5>
                                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 text-left">
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                          {v.message ? `"${v.message}"` : <span className="text-gray-400">No message provided</span>}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Relevant Experience */}
                                    <div>
                                      <h5 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        Relevant Experience
                                      </h5>
                                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {v.experienceSummary || <span className="text-gray-400 italic">No experience provided</span>}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Preferred Role</p>
                                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{v.preferredRole || "Any Role"}</p>
                                        </div>
                                      </div>
                                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Hours</p>
                                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{v.expectedHours ? `${v.expectedHours} hours` : "Flexible"}</p>
                                        </div>
                                      </div>
                                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Availability</p>
                                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{v.availabilityConfirmed ? "Confirmed" : "TBD"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Volunteer Bio */}
                                    {v.volunteerId?.bio && (
                                      <div>
                                        <h5 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                          About {v.volunteerId?.name?.split(' ')[0]}
                                        </h5>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left">
                                          <p className="text-sm text-gray-700 leading-relaxed">{v.volunteerId.bio}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Footer Stats & Timestamps */}
                                  <div className="bg-gray-50 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100">
                                    <div className="flex flex-wrap items-center justify-start gap-4 text-xs">
                                      <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 font-semibold text-gray-700 shadow-sm">
                                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        {v.volunteerId?.projectsJoinedCount || 0} Projects
                                      </span>
                                      <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 font-semibold text-gray-700 shadow-sm">
                                        <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        {v.volunteerId?.impactPoints || 0} Impact
                                      </span>
                                      <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {v.volunteerId?.phone || "N/A"}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                      <span>Applied: {new Date(v.appliedAt).toLocaleDateString()}</span>
                                      {v.approvedAt && <span>&bull; Approved: {new Date(v.approvedAt).toLocaleDateString()}</span>}
                                      {v.completedAt && <span>&bull; Completed: {new Date(v.completedAt).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NgoVolunteerManagement;
