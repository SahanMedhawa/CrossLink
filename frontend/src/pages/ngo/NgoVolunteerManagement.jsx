import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getNgoProjectsWithVolunteers,
  getProjectVolunteers,
  updateParticipationStatus,
} from "../../services/volunteerApi";
import toast from "react-hot-toast";
import { resolveImageUrl } from "../../utils/imageUrl";

const NgoVolunteerManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const result = await getNgoProjectsWithVolunteers();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setVolunteerLoading(true);
    setStatusFilter("all");
    setExpandedId(null);
    try {
      const result = await getProjectVolunteers(project._id);
      if (result.success) {
        setVolunteers(result.data);
      }
    } catch (error) {
      toast.error("Failed to load volunteers.");
    } finally {
      setVolunteerLoading(false);
    }
  };

  const handleStatusUpdate = async (participationId, newStatus) => {
    try {
      setUpdatingId(participationId);
      const result = await updateParticipationStatus(participationId, newStatus);
      if (result.success) {
        toast.success(`Volunteer ${newStatus} successfully!`);
        if (selectedProject) {
          const res = await getProjectVolunteers(selectedProject._id);
          if (res.success) setVolunteers(res.data);
        }
        fetchProjects();
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

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Volunteer Management</h2>
          <p className="text-emerald-100">
            Review and manage volunteer participation requests for your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Your Projects</h3>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No projects found. Create a project first.
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleSelectProject(project)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedProject?._id === project._id ? "bg-emerald-50 border-l-4 border-emerald-600" : ""
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 text-sm truncate">{project.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.location} &middot;{" "}
                        {(project.volunteerRequests?.approved || 0) + (project.volunteerRequests?.completed || 0)}/{project.volunteersNeeded || 5} active
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.volunteerRequests?.requested > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">
                            {project.volunteerRequests.requested} pending
                          </span>
                        )}
                        {project.volunteerRequests?.approved > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                            {project.volunteerRequests.approved} approved
                          </span>
                        )}
                        {project.volunteerRequests?.completed > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
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
                      <h3 className="text-lg font-semibold text-gray-900">{selectedProject.title}</h3>
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
                            ? "bg-emerald-600 text-white"
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
                      <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
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
                          <div key={v._id} className="hover:bg-gray-50/50 transition-colors">
                            {/* Compact Row */}
                            <div
                              className="p-4 cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : v._id)}
                            >
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">{v.volunteerId?.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(v.status)}`}>
                                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {v.volunteerId?.email} &middot; {v.volunteerId?.location || "No location"} &middot; Applied {new Date(v.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                  {/* Skills inline */}
                                  <div className="flex flex-wrap gap-1 mt-1.5">
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
                                <div className="flex items-center gap-3 shrink-0">
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
                                        className="px-3.5 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
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
                              <div className="px-4 pb-4 pt-0 ml-15">
                                <div className="bg-gray-50 rounded-xl p-5 ml-15 space-y-4">
                                  {/* Motivation Message */}
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Motivation Message</p>
                                    <p className="text-sm text-gray-800 leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                                      {v.message || <span className="text-gray-400 italic">No message provided</span>}
                                    </p>
                                  </div>

                                  {/* Relevant Experience */}
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Relevant Experience</p>
                                    <p className="text-sm text-gray-800 leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                                      {v.experienceSummary || <span className="text-gray-400 italic">No experience provided</span>}
                                    </p>
                                  </div>

                                  {/* Preferred Role + Expected Hours */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Preferred Role</p>
                                      <p className="text-sm font-medium text-gray-800 mt-0.5">{v.preferredRole || "Not specified"}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Expected Hours</p>
                                      <p className="text-sm font-medium text-gray-800 mt-0.5">{v.expectedHours ? `${v.expectedHours} hours` : "Not specified"}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Availability</p>
                                      <p className="text-sm font-medium text-gray-800 mt-0.5">{v.availabilityConfirmed ? "Confirmed" : "Not confirmed"}</p>
                                    </div>
                                  </div>

                                  {/* Volunteer Bio */}
                                  {v.volunteerId?.bio && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Volunteer Bio</p>
                                      <p className="text-sm text-gray-700 leading-relaxed">{v.volunteerId.bio}</p>
                                    </div>
                                  )}

                                  {/* Stats */}
                                  <div className="flex gap-6 pt-1 text-xs text-gray-500">
                                    <span><strong className="text-gray-700">{v.volunteerId?.projectsJoinedCount || 0}</strong> projects joined</span>
                                    <span><strong className="text-gray-700">{v.volunteerId?.impactPoints || 0}</strong> impact points</span>
                                    <span>Phone: <strong className="text-gray-700">{v.volunteerId?.phone || "N/A"}</strong></span>
                                  </div>

                                  {/* Timestamps */}
                                  <div className="flex gap-4 text-[10px] text-gray-400 pt-1">
                                    <span>Applied: {new Date(v.appliedAt).toLocaleString()}</span>
                                    {v.approvedAt && <span>Approved: {new Date(v.approvedAt).toLocaleString()}</span>}
                                    {v.completedAt && <span>Completed: {new Date(v.completedAt).toLocaleString()}</span>}
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
