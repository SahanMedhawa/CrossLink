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
      case "requested": return "text-amber-500 bg-amber-50 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)]";
      case "approved": return "text-emerald-500 bg-emerald-50 border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
      case "rejected": return "text-rose-500 bg-rose-50 border-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.2)]";
      case "completed": return "text-blue-500 bg-blue-50 border-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.2)]";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="volunteer">
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 max-w-7xl mx-auto">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
          <p className="text-xl font-bold text-gray-800 animate-pulse">Loading your activity...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 lg:p-14 shadow-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-400 opacity-20 blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-50 text-sm font-bold tracking-wide mb-6 shadow-xl animate-fade-in-up">
                <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Overall Progress
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Activity</span> Impact
              </h2>
              <p className="text-indigo-100/95 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                A comprehensive overview of your volunteering journey. See how your contributions have made a difference.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] min-w-[160px] shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <span className="text-5xl font-black text-white drop-shadow-md">{stats?.impactPoints || 0}</span>
              <span className="text-sm font-bold text-cyan-200 mt-2 uppercase tracking-widest text-center">Impact Rate</span>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-cyan-400 w-3/4 h-full rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 grid grid-cols-2 gap-4">
              {[
                { label: "Points", value: stats?.impactPoints, textColor: "text-violet-600", hoverBg: "hover:bg-violet-50", hoverBorder: "hover:border-violet-200" },
                { label: "Projects", value: stats?.projectsJoined, textColor: "text-blue-600", hoverBg: "hover:bg-blue-50", hoverBorder: "hover:border-blue-200" },
                { label: "NGOs", value: stats?.ngosHelped, textColor: "text-emerald-600", hoverBg: "hover:bg-emerald-50", hoverBorder: "hover:border-emerald-200" },
                { label: "Pending", value: stats?.pending, textColor: "text-amber-600", hoverBg: "hover:bg-amber-50", hoverBorder: "hover:border-amber-200" },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center group transition-colors ${stat.hoverBg} ${stat.hoverBorder}`}>
                  <span className={`text-3xl font-black text-gray-900 transition-colors ${stat.textColor}`}>{stat.value || 0}</span>
                  <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 transition-colors`}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-80"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-xl text-indigo-600 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </span>
                Request Analysis
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Approved", value: stats?.approved, colorClass: "text-emerald-700", bgClass: "bg-emerald-500" },
                  { label: "Pending", value: stats?.pending, colorClass: "text-amber-700", bgClass: "bg-amber-500" },
                  { label: "Completed", value: stats?.completed, colorClass: "text-blue-700", bgClass: "bg-blue-500" },
                  { label: "Rejected", value: stats?.rejected, colorClass: "text-rose-700", bgClass: "bg-rose-500" }
                ].map((item, idx) => {
                  const total = (stats?.approved || 0) + (stats?.pending || 0) + (stats?.completed || 0) + (stats?.rejected || 0);
                  const pct = total === 0 ? 0 : Math.round(((item.value || 0) / total) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className={item.colorClass}>{item.label}</span>
                        <span className="text-gray-900">{item.value || 0}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-full ${item.bgClass} rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 h-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 shadow-inner">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  Recent Activity
                </h3>
              </div>

              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">No trace of activity yet</h4>
                  <p className="text-gray-500 max-w-sm">Start your volunteering journey by requesting to join a project.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentActivity.map((activity, idx) => (
                    <div key={activity._id} className="group relative flex gap-6 hover:bg-gray-50 p-4 -mx-4 rounded-[1.5rem] transition-colors">
                      {idx !== recentActivity.length - 1 && (
                        <div className="absolute left-[38px] top-14 bottom-[-1.5rem] w-px bg-gray-200 group-hover:bg-indigo-200 transition-colors"></div>
                      )}

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border z-10 bg-white ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status) === "check" && (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {getStatusIcon(activity.status) === "clock" && (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {getStatusIcon(activity.status) === "x" && (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {getStatusIcon(activity.status) === "star" && (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <h4 className="text-lg font-extrabold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                            {activity.projectId?.title || "Unknown Project"}
                          </h4>
                          <span className="text-sm font-semibold text-gray-400 shrink-0 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {new Date(activity.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                            {activity.ngoId?.organizationName || "System Update"}
                          </p>
                          <span className="text-gray-300">&bull;</span>
                          <span className={`text-xs font-black uppercase tracking-widest ${activity.status === 'approved' ? 'text-emerald-600' :
                              activity.status === 'requested' ? 'text-amber-600' :
                                activity.status === 'rejected' ? 'text-rose-600' : 'text-blue-600'
                            }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
      `}} />
    </DashboardLayout>
  );
};

export default VolunteerActivity;
