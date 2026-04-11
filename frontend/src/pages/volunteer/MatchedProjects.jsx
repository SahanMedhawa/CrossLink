import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getMatchedProjects,
  requestParticipation,
  updateParticipationRequest,
  deleteParticipationRequest,
  getParticipationById,
} from "../../services/volunteerApi";
import ParticipationFormModal from "../../components/volunteer/ParticipationFormModal";
import toast from "react-hot-toast";
import { resolveImageUrl } from "../../utils/imageUrl";

const MatchedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editingParticipation, setEditingParticipation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const result = await getMatchedProjects();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      toast.error("Failed to load matched projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (projectId) => {
    setSelectedProjectId(projectId);
    setIsEditMode(false);
    setEditingParticipation(null);
    setShowForm(true);
  };

  const handleEdit = async (participationId) => {
    try {
      const result = await getParticipationById(participationId);
      if (result.success) {
        setEditingParticipation(result.data);
        setIsEditMode(true);
        setShowForm(true);
      }
    } catch (error) {
      toast.error("Failed to load application details.");
    }
  };

  const handleWithdraw = async (participationId, projectId) => {
    if (!window.confirm("Are you sure you want to withdraw this request? This cannot be undone.")) return;
    try {
      setWithdrawingId(participationId);
      const result = await deleteParticipationRequest(participationId);
      if (result.success) {
        toast.success("Request withdrawn successfully!");
        setProjects((prev) =>
          prev.map((p) =>
            p.project._id === projectId
              ? { ...p, alreadyApplied: null, participationId: null }
              : p
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to withdraw request.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      if (isEditMode && editingParticipation) {
        const result = await updateParticipationRequest(editingParticipation._id, formData);
        if (result.success) {
          toast.success("Application updated successfully!");
          setShowForm(false);
          setEditingParticipation(null);
          setIsEditMode(false);
        }
      } else {
        const result = await requestParticipation(selectedProjectId, formData);
        if (result.success) {
          toast.success("Participation request submitted!");
          fetchMatches();
          setShowForm(false);
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    return "text-rose-700 bg-rose-50 border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    if (score >= 50) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
  };

  const filteredProjects = projects.filter((p) => p.matchScore >= filterScore);

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        {/* Modern Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-sm font-semibold mb-6 animate-fade-in-up">
                <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Find Your Match
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Meaningful Projects</span>
              </h2>
              <p className="text-indigo-100/90 text-lg md:text-xl max-w-2xl font-medium">
                Our AI considers your skills, interests, and location to find the perfect volunteer opportunities for you.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 flex flex-col lg:flex-row items-center gap-6 z-20 relative sticky top-6">
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Filter Results</h3>
          </div>

          <div className="flex items-center gap-4 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 flex-1 w-full lg:w-auto">
            <label className="text-sm font-semibold text-gray-600 px-2 whitespace-nowrap">Match Score:</label>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={filterScore}
              onChange={(e) => setFilterScore(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">{filterScore}%+</span>
          </div>

          <div className="text-sm font-bold text-gray-500 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 whitespace-nowrap flex gap-2 items-center">
            <span className="text-indigo-600 text-xl leading-none">&bull;</span>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
            <p className="text-xl font-bold text-gray-800 animate-pulse">Running advanced matchmaking...</p>
            <p className="text-gray-500 mt-2">Analyzing your profile against hundreds of projects</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 border-dashed shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              We couldn't find any projects matching your current minimum score of {filterScore}%.
            </p>
            <button onClick={() => setFilterScore(0)} className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">Reset Filter</button>
          </div>
        )}

        {/* Project Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map(({ project, matchScore, matchedSkills, missingSkills, alreadyApplied, distance, participationId }, idx) => (
              <div
                key={project._id}
                className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {project.image ? (
                    <img
                      src={resolveImageUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-200">
                      <svg className="w-20 h-20 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {/* Floating Match Score Badge */}
                  <div className="absolute top-4 right-4 z-10 animate-fade-in">
                    <div className={`flex flex-col items-center px-4 py-2 rounded-2xl border backdrop-blur-md bg-white/90 ${getScoreColor(matchScore)}`}>
                      <span className="text-2xl font-black">{matchScore}%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Match</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/60 text-white backdrop-blur-md px-4 py-1.5 text-xs font-bold rounded-xl border border-white/10 uppercase tracking-wider shadow-lg">
                      {project.focusArea}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-extrabold line-clamp-1 drop-shadow-md mb-1">{project.title}</h3>
                    <p className="text-sm font-medium flex items-center gap-2 text-gray-200 drop-shadow-sm line-clamp-1">
                      {project.ngo?.photoURL ? (
                        <img
                          src={resolveImageUrl(project.ngo.photoURL)}
                          alt={project.ngo?.organizationName || 'NGO'}
                          className="w-5 h-5 rounded-full object-cover border border-white/30"
                        />
                      ) : (
                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                      )}
                      {project.ngo?.organizationName || "Unknown NGO"}
                    </p>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  {/* Match Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${getScoreBarColor(matchScore)}`} style={{ width: `${matchScore}%` }} />
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">
                    {project.description}
                  </p>

                  {/* Skills Grid */}
                  <div className="space-y-4 mb-6">
                    {matchedSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Your matched skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchedSkills.map((s) => (
                            <span key={s} className="px-3 py-1 bg-emerald-50/70 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-bold shadow-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {missingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Skills you can learn
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {missingSkills.map((s) => (
                            <span key={s} className="px-3 py-1 bg-amber-50/70 text-amber-700 border border-amber-200/50 rounded-xl text-xs font-bold shadow-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-6 text-sm font-semibold text-gray-500 pb-6 mb-6 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {project.volunteersCount}/{project.volunteersNeeded} <span className="text-gray-400 font-medium">Volunteers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {project.location} {distance !== null && <span className="text-indigo-500 ml-1">({distance}km)</span>}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-auto">
                    {alreadyApplied === "requested" && participationId ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center p-3.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm border-dashed">
                          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            Request Pending Approval
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(participationId)}
                            className="flex-[1.5] w-full px-5 py-3.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-sm focus:ring-4 focus:ring-blue-100"
                          >
                            Edit Match Entry
                          </button>
                          <button
                            onClick={() => handleWithdraw(participationId, project._id)}
                            disabled={withdrawingId === participationId}
                            className="flex-1 w-full px-5 py-3.5 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-rose-100 group/btn"
                          >
                            {withdrawingId === participationId ? "Withdrawing..." : "Withdraw"}
                          </button>
                        </div>
                      </div>
                    ) : alreadyApplied === "approved" ? (
                      <div className="space-y-4">
                        <div className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 shadow-sm font-bold border-dashed">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Officially Approved
                        </div>
                        {project.coordinates?.coordinates && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${project.coordinates.coordinates[1]},${project.coordinates.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Navigate to Location
                          </a>
                        )}
                      </div>
                    ) : alreadyApplied ? (
                      <div className="w-full text-center p-4 bg-gray-50 text-gray-600 rounded-2xl font-bold uppercase tracking-wide text-xs">
                        {alreadyApplied}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(project._id)}
                        className="w-full group/btn relative overflow-hidden px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Join Project Now
                          <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ParticipationFormModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedProjectId(null);
            setEditingParticipation(null);
            setIsEditMode(false);
          }}
          onSubmit={handleFormSubmit}
          loading={formLoading}
          initialData={editingParticipation}
          isEdit={isEditMode}
        />
      </div>

      {/* Tailwind Animations & Utilities specific to this file */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </DashboardLayout>
  );
};

export default MatchedProjects;
