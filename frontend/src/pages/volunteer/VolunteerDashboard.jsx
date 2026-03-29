import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getVolunteerStats, getMatchedProjects } from "../../services/volunteerApi";
import { resolveImageUrl } from "../../utils/imageUrl";

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, matchRes] = await Promise.all([
          getVolunteerStats(),
          getMatchedProjects(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (matchRes.success) setTopMatches(matchRes.data.slice(0, 3));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getScoreBarColor = (score) => {
    if (score >= 80) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (score >= 50) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        {/* Modern Premium Welcome Hero */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 group">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in-up">
                ✨ Volunteer Portal
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
                Welcome back, <span className="text-cyan-300 font-black">{user?.name}</span>
              </h2>
              <p className="text-blue-100/90 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                Find meaningful projects, contribute your unique skills, and make a real difference in the world today.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards with Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Projects Joined", value: stats?.projectsJoined, icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "blue", stat: stats?.projectsJoined || 0 },
            { label: "Pending Requests", value: stats?.pending, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "amber", stat: stats?.pending || 0 },
            { label: "NGOs Helped", value: stats?.ngosHelped, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "emerald", stat: stats?.ngosHelped || 0 },
            { label: "Impact Points", value: stats?.impactPoints, icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "violet", stat: stats?.impactPoints || 0 }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white rounded-3xl p-6 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-${item.color}-500/10 blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-gray-900">{loading ? <span className="animate-pulse">...</span> : item.stat}</p>
                </div>
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-sm border border-${item.color}-100`}>
                  <svg className={`w-7 h-7 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Skills & Interests) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Skills</h3>
                </div>
                <Link to="/volunteer/profile" className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Edit</Link>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="px-3.5 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-full text-sm font-medium hover:border-blue-300 hover:text-blue-700 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet. <Link to="/volunteer/profile" className="text-blue-600 hover:underline font-medium">Update profile &rarr;</Link></p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Interests</h3>
                </div>
                <Link to="/volunteer/profile" className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors">Edit</Link>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="px-3.5 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-full text-sm font-medium hover:border-purple-300 hover:text-purple-700 transition-colors cursor-default">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No interests added yet. <Link to="/volunteer/profile" className="text-purple-600 hover:underline font-medium">Update profile &rarr;</Link></p>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2rem] p-7 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Quick Actions
              </h3>
              <div className="space-y-3 relative z-10">
                <Link to="/volunteer/projects" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl transition-all border border-white/5 hover:border-white/20 group/btn">
                  <div className="bg-blue-400/20 w-10 h-10 rounded-xl flex items-center justify-center text-blue-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white group-hover/btn:text-blue-100 transition-colors">Find Projects</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/volunteer/applications" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl transition-all border border-white/5 hover:border-white/20 group/btn">
                  <div className="bg-emerald-400/20 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white group-hover/btn:text-emerald-100 transition-colors">My Applications</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (Top Matches) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 group flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </span>
                Top Matched Projects
              </h3>
              <Link to="/volunteer/projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group transition-colors">
                View All <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-gray-100 rounded-3xl w-full"></div>
                ))}
              </div>
            ) : topMatches.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 pt-2">
                {topMatches.map(({ project, matchScore, matchedSkills }) => (
                  <div key={project._id} className="group flex flex-col sm:flex-row bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                    <div className="sm:w-1/3 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                      {project.image ? (
                        <div className="w-full h-32 sm:h-full rounded-2xl overflow-hidden shadow-base">
                          <img src={resolveImageUrl(project.image)} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center border border-dashed border-blue-200">
                          <svg className="w-12 h-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <h4 className="font-extrabold text-xl text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">{project.title}</h4>
                        <span className={`px-3 py-1 rounded-xl text-sm font-black border ${getScoreBackground(matchScore)} shadow-sm`}>
                          {matchScore}% Match
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {project.ngo?.organizationName} <span className="mx-1 text-gray-300">&bull;</span> {project.location}
                      </p>

                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBarColor(matchScore)}`} style={{ width: `${matchScore}%` }} />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {matchedSkills?.slice(0, 4).map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-emerald-50/50 text-emerald-700 border border-emerald-100/50 rounded-lg text-xs font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 border-dashed">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">No Matches Yet</h4>
                <p className="text-gray-500 max-w-sm mx-auto">Update your profile with more skills and interests to find the perfect volunteer opportunity.</p>
                <Link to="/volunteer/profile" className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50">Update Profile</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
