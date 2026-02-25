import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getVolunteerStats, getMyApplications } from "../../services/volunteerApi";
import toast from "react-hot-toast";

const VolunteerActivity = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        getVolunteerStats(),
        getMyApplications(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (appsRes.success) setRecentActivity(appsRes.data.slice(0, 10));
    } catch (error) {
      toast.error("Failed to load activity data.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "requested": return "clock";
      case "approved": return "check";
      case "rejected": return "x";
      case "completed": return "star";
      default: return "circle";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "requested": return "text-yellow-500 bg-yellow-50";
      case "approved": return "text-green-500 bg-green-50";
      case "rejected": return "text-red-500 bg-red-50";
      case "completed": return "text-blue-500 bg-blue-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="volunteer">
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading activity...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">My Activity</h2>
          <p className="text-blue-100">Your volunteering journey at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats?.projectsJoined || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Projects Joined</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats?.impactPoints || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Impact Points</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{stats?.ngosHelped || 0}</p>
            <p className="text-sm text-gray-500 mt-1">NGOs Helped</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Requests</p>
          </div>
        </div>

        {/* Application Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{stats?.pending || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{stats?.approved || 0}</p>
              <p className="text-xs text-green-600 mt-1">Approved</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{stats?.completed || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{stats?.rejected || 0}</p>
              <p className="text-xs text-red-600 mt-1">Rejected</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No activity yet. Start by finding and requesting participation in projects!
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status) === "check" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {getStatusIcon(activity.status) === "clock" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {getStatusIcon(activity.status) === "x" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {getStatusIcon(activity.status) === "star" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.projectId?.title || "Unknown Project"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.ngoId?.organizationName || ""} &middot;{" "}
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(activity.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerActivity;
