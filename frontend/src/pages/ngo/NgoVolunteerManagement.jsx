import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getNgoProjectsWithVolunteers,
  getProjectVolunteers,
  updateParticipationStatus,
} from "../../services/volunteerApi";
import toast from "react-hot-toast";

const NgoVolunteerManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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
        // Refresh volunteers for this project
        if (selectedProject) {
          const res = await getProjectVolunteers(selectedProject._id);
          if (res.success) setVolunteers(res.data);
        }
        // Refresh project counts
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
      requested: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
                        selectedProject?._id === project._id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 text-sm truncate">{project.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{project.location}</p>
                      <div className="flex gap-2 mt-2">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">{selectedProject.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedProject.volunteersCount || 0}/{selectedProject.volunteersNeeded || 5} volunteers
                  </p>
                </div>

                {volunteerLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-sm">
                    No volunteer requests for this project yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {volunteers.map((v) => (
                      <div key={v._id} className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {v.volunteerId?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{v.volunteerId?.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(v.status)}`}>
                                {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{v.volunteerId?.email}</p>
                            <p className="text-xs text-gray-500">{v.volunteerId?.location || "No location"}</p>
                            {v.volunteerId?.bio && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{v.volunteerId.bio}</p>
                            )}

                            {/* Skills */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {v.volunteerId?.skills?.map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                              <span>{v.volunteerId?.projectsJoinedCount || 0} projects joined</span>
                              <span>{v.volunteerId?.impactPoints || 0} impact points</span>
                              <span>Applied {new Date(v.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 shrink-0">
                            {v.status === "requested" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(v._id, "approved")}
                                  disabled={updatingId === v._id}
                                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(v._id, "rejected")}
                                  disabled={updatingId === v._id}
                                  className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {v.status === "approved" && (
                              <button
                                onClick={() => handleStatusUpdate(v._id, "completed")}
                                disabled={updatingId === v._id}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NgoVolunteerManagement;
