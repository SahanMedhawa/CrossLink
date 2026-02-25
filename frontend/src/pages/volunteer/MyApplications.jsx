import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getMyApplications, updateParticipationRequest, deleteParticipationRequest } from "../../services/volunteerApi";
import ParticipationFormModal from "../../components/volunteer/ParticipationFormModal";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

const STATUS_LABELS = {
  requested: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await getMyApplications();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">My Applications</h2>
          <p className="text-blue-100">Track the status of your project participation requests.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["all", "requested", "approved", "rejected", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}{" "}
              <span className="ml-1 opacity-70">({counts[filter]})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading applications...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">No applications found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by finding projects and requesting participation.
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApplications.length > 0 && (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {app.projectId?.title || "Unknown Project"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {app.ngoId?.organizationName || "Unknown NGO"} &middot;{" "}
                      {app.projectId?.location || ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.projectId?.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status + Date */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        STATUS_COLORS[app.status]
                      }`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      Applied{" "}
                      {new Date(app.appliedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {app.approvedAt && (
                      <span className="text-xs text-green-500">
                        Approved{" "}
                        {new Date(app.approvedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Application Details */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {app.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivation</p>
                      <p className="text-sm text-gray-700 mt-0.5">{app.message}</p>
                    </div>
                  )}
                  {app.experienceSummary && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</p>
                      <p className="text-sm text-gray-700 mt-0.5">{app.experienceSummary}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {app.preferredRole && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Role</p>
                        <p className="text-sm text-gray-700 mt-0.5">{app.preferredRole}</p>
                      </div>
                    )}
                    {app.expectedHours && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Hours</p>
                        <p className="text-sm text-gray-700 mt-0.5">{app.expectedHours} hours</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit / Delete Actions — Only for pending requests */}
                {app.status === "requested" && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => handleEdit(app)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={() => handleDelete(app._id)}
                      disabled={deletingId === app._id}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === app._id ? "Withdrawing..." : "Withdraw"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Participation Modal */}
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
    </DashboardLayout>
  );
};

export default MyApplications;
