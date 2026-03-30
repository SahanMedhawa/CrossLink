import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ResourceForm from '../resource/ResourceForm';
import { resolveImageUrl } from '../../utils/imageUrl';

const ResourceDonationManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const preselectedProjectId = queryParams.get('projectId');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/projects/all');
      const allProjects = response.data?.projects || response.data?.data || [];

      const donationEligible = allProjects.filter(
        (project) =>
          project?.status === 'active' &&
          Array.isArray(project?.resources) &&
          project.resources.length > 0
      );

      setProjects(donationEligible);
    } catch (error) {
      console.error('Error loading projects for donation:', error);
      toast.error('Failed to load donation opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!preselectedProjectId || projects.length === 0) return;

    const match = projects.find((project) => project._id === preselectedProjectId);
    if (match) {
      setSelectedProject(match);
      setShowDonationModal(true);
    }
  }, [preselectedProjectId, projects]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;

    const term = searchTerm.toLowerCase();
    return projects.filter((project) => {
      return (
        project?.title?.toLowerCase().includes(term) ||
        project?.organizationName?.toLowerCase().includes(term) ||
        project?.focusArea?.toLowerCase().includes(term) ||
        project?.location?.toLowerCase().includes(term)
      );
    });
  }, [projects, searchTerm]);

  const openDonationModal = (project) => {
    setSelectedProject(project);
    setShowDonationModal(true);
  };

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <h2 className="text-3xl font-bold">Resource Donation Management</h2>
          <p className="text-blue-100 mt-2 font-medium">
            Select an active NGO project and donate resources based on real-time remaining needs.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
          Donations are validated against remaining project requirements, and NGOs receive notifications after successful donations.
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project, NGO, focus area, or location"
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 text-center py-20">
            <p className="text-gray-500 text-lg font-medium">No resource donation opportunities found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="h-44 bg-gray-100">
                  {project?.image ? (
                    <img
                      src={resolveImageUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
                    {project.focusArea || 'General'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{project.organizationName}</p>
                  <p className="text-sm text-gray-500 mb-4">{project.location}</p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
                    <p><span className="font-semibold">Resource Types:</span> {project.resources?.length || 0}</p>
                    <p><span className="font-semibold">Volunteer Capacity:</span> {project.volunteersCount || 0}/{project.volunteersNeeded || 0}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={() => openDonationModal(project)}
                      className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Donate Resources
                    </button>
                    <button
                      onClick={() => navigate(`/corporate/ngo/${project.ngoId?._id || project.ngoId}/projects`)}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      View NGO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDonationModal && selectedProject && (
        <ResourceForm
          project={selectedProject}
          onClose={() => {
            setShowDonationModal(false);
            setSelectedProject(null);
            if (preselectedProjectId) {
              navigate('/corporate/resourcehManage', { replace: true });
            }
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ResourceDonationManagement;
