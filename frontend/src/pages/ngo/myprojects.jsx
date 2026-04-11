import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SKILL_OPTIONS, FOCUS_AREA_OPTIONS } from '../../constants/skillsAndInterests';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import L from 'leaflet';
import { resolveImageUrl } from '../../utils/imageUrl';
import { getSocket } from '../../services/socket';

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Click-to-place marker on map
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  let currentUserId = null;
  try {
    const rawUser = localStorage.getItem('crosslink_user');
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      currentUserId = parsedUser?.id || parsedUser?._id || null;
    }
  } catch (error) {
    currentUserId = null;
  }

  const commonSkills = SKILL_OPTIONS;

  const fetchProjects = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const token = localStorage.getItem('crosslink_token');
      const url = statusFilter
        ? `/api/projects/ngo/my-projects?status=${statusFilter}`
        : '/api/projects/ngo/my-projects';

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setProjects(response.data.projects);
      setTotalPages(Math.ceil(response.data.projects.length / projectsPerPage));
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setLoading(false);
    }
  }, [statusFilter, projectsPerPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    let refreshTimer;

    const handleProjectEvent = (event) => {
      if (event?.ngoId && currentUserId && event.ngoId !== currentUserId) {
        return;
      }

      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchProjects(false);
      }, 200);
    };

    socket.on('project:updated', handleProjectEvent);

    return () => {
      clearTimeout(refreshTimer);
      socket.off('project:updated', handleProjectEvent);
    };
  }, [currentUserId, fetchProjects]);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('crosslink_token');
      await axios.delete(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus, currentStatus) => {
    if (currentStatus === 'active' && newStatus === 'draft') {
      alert('Cannot change an active project back to draft'); return;
    }
    if (currentStatus === 'completed' && newStatus !== 'completed') {
      alert('Cannot change a completed project'); return;
    }
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      alert('Cannot reactivate a cancelled project. Please create a new project instead.'); return;
    }
    try {
      const token = localStorage.getItem('crosslink_token');
      await axios.put(
        `/api/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('Project status updated successfully');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':    return { bg: '#EBF5FF', text: '#0052CC', border: '#0052CC' };
      case 'draft':     return { bg: '#F8F9FA', text: '#6C757D', border: '#ADB5BD' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' };
      case 'cancelled': return { bg: '#FFEBEE', text: '#C62828', border: '#EF5350' };
      default:          return { bg: '#F8F9FA', text: '#495057', border: '#CED4DA' };
    }
  };

  const canDeleteProject = (status) => status === 'draft' || status === 'cancelled';

  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'draft':     return ['draft', 'active', 'cancelled'];
      case 'active':    return ['active', 'completed', 'cancelled'];
      case 'completed': return ['completed'];
      case 'cancelled': return ['cancelled'];
      default:          return ['draft', 'active', 'completed', 'cancelled'];
    }
  };

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">My Projects</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Manage and track all your organisation's projects</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 sm:px-4 py-2">
              <label className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white text-gray-800 text-xs sm:text-sm font-medium rounded-lg px-3 py-1.5 border-0 outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="">All Projects</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-500 font-medium">Loading your projects…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">No projects found</p>
            <p className="text-gray-500 text-sm">You haven't created any projects yet. Create your first project to get started!</p>
          </div>
        )}

        {/* Projects grid */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 sm:px-5 py-2 sm:py-3 flex items-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                Showing {indexOfFirstProject + 1}–{Math.min(indexOfLastProject, projects.length)} of {projects.length} project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
              {currentProjects.map(project => {
                const statusColors = getStatusColor(project.status);
                const canDelete = canDeleteProject(project.status);
                const availableStatuses = getAvailableStatusOptions(project.status);
                const isLocked = availableStatuses.length === 1;
                const isFinished = project.status === 'completed' || project.status === 'cancelled';

                return (
                  <div
                    key={project._id}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                    style={{ minHeight: '260px' }}
                  >
                    {/* Image */}
                    <div className="w-full sm:w-44 shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden h-40 sm:h-auto">
                      {project.image && (
                        <img
                          src={resolveImageUrl(project.image)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 sm:p-5 overflow-hidden">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug truncate flex-1">
                          {project.title}
                        </h3>
                        <span
                          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border shrink-0"
                          style={{ background: statusColors.bg, color: statusColors.text, borderColor: statusColors.border }}
                        >
                          {project.status}
                        </span>
                      </div>

                      <p className="text-gray-500 text-xs leading-relaxed mb-2 sm:mb-3 line-clamp-2">{project.description}</p>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 bg-gray-50 rounded-lg px-2 sm:px-3 py-2 border border-gray-100 mb-2 sm:mb-3 text-xs">
                        <div className="flex justify-between gap-1"><span className="font-semibold text-gray-700 shrink-0">Focus:</span><span className="text-gray-500 truncate text-[11px]">{project.focusArea}</span></div>
                        <div className="flex justify-between gap-1"><span className="font-semibold text-gray-700 shrink-0">Location:</span><span className="text-gray-500 truncate text-[11px]">{project.location}</span></div>
                        <div className="flex justify-between gap-1"><span className="font-semibold text-gray-700 shrink-0">Start:</span><span className="text-gray-500 text-[11px]">{formatDate(project.startDate)}</span></div>
                        <div className="flex justify-between gap-1"><span className="font-semibold text-gray-700 shrink-0">End:</span><span className="text-gray-500 text-[11px]">{formatDate(project.endDate)}</span></div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                        {project.skills.slice(0, 4).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] sm:text-[10px] font-semibold">{skill}</span>
                        ))}
                        {project.skills.length > 4 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] sm:text-[10px] font-semibold">+{project.skills.length - 4}</span>
                        )}
                      </div>

                      {project.resources?.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg px-2 sm:px-3 py-1.5 mb-2 sm:mb-3 text-[10px] sm:text-[11px]">
                          <span className="font-bold text-orange-800 uppercase tracking-wide text-[8px] sm:text-[9px]">Resources · </span>
                          <span className="text-orange-700 font-medium">
                            {project.resources[0].name}: {project.resources[0].quantity}
                            {project.resources.length > 1 && ` +${project.resources.length - 1} more`}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Status:</label>
                          <select
                            value={project.status}
                            onChange={(e) => handleStatusChange(project._id, e.target.value, project.status)}
                            disabled={isLocked}
                            className={`flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 font-medium bg-white text-gray-800 outline-none w-full
                              ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                          >
                            {availableStatuses.map(s => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}{isLocked ? ' (locked)' : ''}
                              </option>
                            ))}
                          </select>
                          {isLocked && (
                            <span className="text-[9px] sm:text-[10px] text-gray-400 italic whitespace-nowrap">
                              {project.status === 'completed' ? 'Completed — locked' : 'Cancelled — locked'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => !isFinished && setEditingProject(project)}
                            disabled={isFinished}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors
                              ${isFinished
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
                          >
                            {isFinished ? 'View Only' : 'Edit'}
                          </button>
                          <button
                            onClick={() => canDelete && handleDelete(project._id)}
                            disabled={!canDelete}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors
                              ${!canDelete
                                ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 sm:gap-2 py-4 overflow-x-auto px-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                  const show =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                  const showEllipsis = pageNumber === currentPage - 2 || pageNumber === currentPage + 2;
                  if (show) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg border transition-colors
                          ${currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  if (showEllipsis) return <span key={pageNumber} className="text-gray-400 text-xs sm:text-sm px-1">…</span>;
                  return null;
                })}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onUpdate={fetchProjects}
            commonSkills={commonSkills}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditProjectModal = ({ project, onClose, onUpdate, commonSkills }) => {
  const initialMapPos = project.coordinates?.coordinates
    ? [project.coordinates.coordinates[1], project.coordinates.coordinates[0]]
    : null;

  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    skills: project.skills,
    focusArea: project.focusArea,
    location: project.location,
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate.split('T')[0],
    volunteersNeeded: project.volunteersNeeded || 5,
    resources: project.resources || []
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [mapPosition, setMapPosition] = useState(initialMapPos);

  const focusAreaOptions = FOCUS_AREA_OPTIONS;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('crosslink_token');
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'skills' || key === 'resources') {
          fd.append(key, JSON.stringify(formData[key]));
        } else {
          fd.append(key, formData[key]);
        }
      });
      if (mapPosition) {
        fd.append('coordinates', JSON.stringify({
          type: 'Point',
          coordinates: [mapPosition[1], mapPosition[0]]
        }));
      }
      if (imageFile) fd.append('image', imageFile);

      await axios.put(`/api/projects/${project._id}`, fd, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Project updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Edit Project</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Project Title *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleInputChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Description *</label>
            <textarea
              name="description" value={formData.description} onChange={handleInputChange} required rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 resize-y transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Focus Area *</label>
            <select
              name="focusArea" value={formData.focusArea} onChange={handleInputChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 bg-white transition-colors"
            >
              {focusAreaOptions.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Skills *</label>
            <input
              type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Type a skill and press Enter"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
            />
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {commonSkills.filter(s => !formData.skills.includes(s)).slice(0, 18).map(skill => (
                <button
                  key={skill} type="button" onClick={() => addSkill(skill)}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs sm:text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
                >
                  + {skill}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {formData.skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white text-sm leading-none transition-colors"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Location *</label>
            <input
              type="text" name="location" value={formData.location} onChange={handleInputChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Volunteers Needed</label>
            <input
              type="number" name="volunteersNeeded" min="1" max="500" value={formData.volunteersNeeded}
              onChange={handleInputChange}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors w-32 sm:w-36"
            />
            <p className="text-xs text-gray-400">How many volunteers does this project need?</p>
          </div>

          {/* Map */}
          <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">
              📍 Pin Project Location on Map
              <span className="font-normal text-gray-400 text-xs ml-2">(optional)</span>
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={mapPosition || [7.8731, 80.7718]}
                zoom={mapPosition ? 13 : 7}
                style={{ height: '240px', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
            </div>
            {mapPosition ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                <span className="text-gray-700">📌 Lat: {mapPosition[0].toFixed(5)}, Lng: {mapPosition[1].toFixed(5)}</span>
                <button type="button" onClick={() => setMapPosition(null)}
                  className="text-red-500 underline hover:text-red-700 transition-colors text-left sm:text-auto"
                >Clear pin</button>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Click on the map to place a pin at your project location.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Update Image (optional)</label>
            <input
              type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Start Date *</label>
              <input
                type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">End Date *</label>
              <input
                type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
            <button
              type="button" onClick={onClose}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProjects;