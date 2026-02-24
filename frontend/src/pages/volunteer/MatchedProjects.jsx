import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getMatchedProjects, requestParticipation } from "../../services/volunteerApi";
import toast from "react-hot-toast";

const MatchedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [filterScore, setFilterScore] = useState(0);

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

  const handleApply = async (projectId) => {
    try {
      setApplying(projectId);
      const result = await requestParticipation(projectId);
      if (result.success) {
        toast.success("Participation request submitted!");
        // Update local state to mark as applied
        setProjects((prev) =>
          prev.map((p) =>
            p.project._id === projectId
              ? { ...p, alreadyApplied: "requested" }
              : p
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setApplying(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-400";
  };

  const filteredProjects = projects.filter((p) => p.matchScore >= filterScore);

  return (
    <DashboardLayout userType="volunteer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Find Projects</h2>
          <p className="text-blue-100">
            Projects ranked by how well your skills match their requirements.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Min Match Score:</label>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={filterScore}
            onChange={(e) => setFilterScore(Number(e.target.value))}
            className="w-48"
          />
          <span className="text-sm font-semibold text-blue-600">{filterScore}%+</span>
          <span className="ml-auto text-sm text-gray-500">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Running matchmaking engine...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">No matching projects found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Try lowering the minimum match score or update your skills in your profile.
            </p>
          </div>
        )}

        {/* Project Cards */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map(({ project, matchScore, matchedSkills, missingSkills, alreadyApplied, distance }) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {project.image && (
                  <img
                    src={`http://localhost:5000${project.image}`}
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-5">
                  {/* Title + Score */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500">
                        {project.ngo?.organizationName || "Unknown NGO"} &middot; {project.location}
                      </p>
                    </div>
                    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg border ${getScoreColor(matchScore)}`}>
                      <span className="text-lg font-bold">{matchScore}%</span>
                      <span className="text-[10px] font-medium uppercase">Match</span>
                    </div>
                  </div>

                  {/* Match Score Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${getScoreBarColor(matchScore)}`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                  {/* Matched Skills */}
                  {matchedSkills && matchedSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">Matched Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {missingSkills && missingSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-orange-700 mb-1">Skills to Learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {missingSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>{project.focusArea}</span>
                    <span>&middot;</span>
                    <span>
                      {project.volunteersCount}/{project.volunteersNeeded} volunteers
                    </span>
                    {distance !== null && distance !== undefined && (
                      <>
                        <span>&middot;</span>
                        <span>{distance} km away</span>
                      </>
                    )}
                  </div>

                  {/* Action */}
                  {alreadyApplied ? (
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                        alreadyApplied === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {alreadyApplied === "approved" ? "Approved" : "Request Pending"}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(project._id)}
                      disabled={applying === project._id}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {applying === project._id ? "Submitting..." : "Request Participation"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MatchedProjects;
