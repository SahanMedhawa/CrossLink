import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const EmployeeVolunteering = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects/all');
      const allProjects = response.data?.projects || response.data?.data || [];

      const activeProjects = allProjects.filter((project) => project?.status === 'active');
      setProjects(activeProjects);
    } catch (error) {
      console.error('Error fetching volunteering opportunities:', error);
      toast.error('Failed to load employee volunteering opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const volunteerOpenProjects = useMemo(() => {
    return filteredProjects.filter((project) => {
      const needed = project?.volunteersNeeded || 0;
      const count = project?.volunteersCount || 0;
      return needed > count;
    });
  }, [filteredProjects]);

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <h2 className="text-3xl font-bold">Employee Volunteering</h2>
          <p className="text-blue-100 mt-2 font-medium">
            Discover active projects that need volunteers and coordinate CSR volunteering programs with partner NGOs.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          Business rule: direct participation requests are created by volunteer accounts and approved by NGOs. Corporate users coordinate initiatives by partnering with NGOs and sponsoring projects.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Active Projects</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Open for Volunteers</p>
            <p className="text-2xl font-bold text-blue-700">{projects.filter((p) => (p?.volunteersNeeded || 0) > (p?.volunteersCount || 0)).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Projects Near Capacity</p>
            <p className="text-2xl font-bold text-green-700">{projects.filter((p) => (p?.volunteersNeeded || 0) > 0 && ((p?.volunteersCount || 0) / (p?.volunteersNeeded || 1)) >= 0.8).length}</p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, NGO, focus area, or location"
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : volunteerOpenProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 text-center py-20">
            <p className="text-gray-500 text-lg font-medium">No active projects currently need additional volunteers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteerOpenProjects.map((project) => {
              const needed = project?.volunteersNeeded || 0;
              const count = project?.volunteersCount || 0;
              const remaining = Math.max(needed - count, 0);

              return (
                <div key={project._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
                    {project.focusArea || 'General'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{project.organizationName}</p>
                  <p className="text-sm text-gray-500 mb-4">{project.location}</p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 space-y-1">
                    <p><span className="font-semibold">Needed:</span> {needed}</p>
                    <p><span className="font-semibold">Joined:</span> {count}</p>
                    <p><span className="font-semibold">Open Slots:</span> {remaining}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/corporate/ngo/${project.ngoId?._id || project.ngoId}/projects`)}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Partner With NGO
                    </button>
                    <button
                      onClick={() => navigate(`/corporate/resourcehManage?projectId=${project._id}`)}
                      className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Support Resources
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeVolunteering;
