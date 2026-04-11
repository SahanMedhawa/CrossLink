import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const ProjectDonations = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [donations, setDonations] = useState([]);
  const [resourceNeeds, setResourceNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'donatedAt', direction: 'desc' });
  const initialFetchDoneRef = useRef(false);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get donor name from corporateId object
  const getDonorName = (corporateId) => {
    if (!corporateId) return 'Unknown Donor';
    
    if (typeof corporateId === 'object') {
      return corporateId.companyName || corporateId.name || 'Unknown Donor';
    }
    
    return `ID: ${corporateId.toString().slice(-6)}`;
  };

  // Get donor email if available
  const getDonorEmail = (corporateId) => {
    if (!corporateId || typeof corporateId !== 'object') return null;
    return corporateId.email || null;
  };

  // Fetch this NGO's active projects that have donation requirements.
const fetchNgoProjects = async () => {
  try {
    setLoading(true);
    
    if (!token || !user?._id) {
      toast.error('Please login again');
      navigate('/login');
      return;
    }

    const response = await axios.get(
      '/api/projects/ngo/my-projects?status=active',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const allNgoProjects = response.data?.projects || [];
    const projectsList = allNgoProjects.filter(
      (project) => Array.isArray(project.resources) && project.resources.length > 0
    );
    
    setProjects(projectsList);

    // Keep previous selection when possible; otherwise default to first project.
    if (projectsList.length > 0) {
      setSelectedProject((prevSelected) => {
        if (prevSelected?._id) {
          const preserved = projectsList.find((p) => p._id === prevSelected._id);
          if (preserved) return preserved;
        }
        return projectsList[0];
      });
    } else if (projectsList.length === 0) {
      setSelectedProject(null);
      setDonations([]);
      setResourceNeeds([]);
      toast('No projects found for your organization', {
        icon: 'ℹ️',
        style: {
          background: '#e6f7ff',
          color: '#0066cc'
        }
      });
    }
    
  } catch (err) {
    console.error("Error fetching projects:", err);
    
    if (err.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      logout();
      navigate('/login');
    } else {
      setError("Failed to fetch projects");
      toast.error("Failed to load projects");
    }
  } finally {
    setLoading(false);
  }
};
  // Fetch donations and requirement counters for selected project
  const fetchProjectDonations = async (projectId) => {
    if (!projectId) return;
    
    try {
      setLoadingDonations(true);
      
      const [resourcesResponse, statusResponse] = await Promise.all([
        axios.get(`/api/resources/project/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`/api/resources/project/${projectId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      let resources = [];
      if (Array.isArray(resourcesResponse.data)) {
        resources = resourcesResponse.data;
      } else if (resourcesResponse.data.resources && Array.isArray(resourcesResponse.data.resources)) {
        resources = resourcesResponse.data.resources;
      }
      
      // Extract all donations from all resources
      const allDonations = [];
      
      resources.forEach(resource => {
        if (resource.donatedBy && Array.isArray(resource.donatedBy) && resource.donatedBy.length > 0) {
          resource.donatedBy.forEach(donation => {
            allDonations.push({
              _id: `${resource._id}_${donation.donatedAt}`,
              resourceName: resource.name,
              resourceId: resource._id,
              quantity: donation.quantity,
              donatedAt: donation.donatedAt,
              corporateId: donation.corporateId,
              projectId: projectId,
              projectName: resource.projectId?.title || selectedProject?.title || 'Unknown Project',
              organizationName: resource.projectId?.organizationName || selectedProject?.organizationName || '',
              totalQuantity: resource.totalQuantity,
              remainingQuantity: resource.remainingQuantity,
              resourceDescription: resource.description
            });
          });
        }
      });
      
      setDonations(allDonations);

      if (Array.isArray(statusResponse.data)) {
        setResourceNeeds(statusResponse.data);
      } else {
        setResourceNeeds([]);
      }
      
    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load donations for this project");
      setDonations([]);
      setResourceNeeds([]);
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    if (!user?._id || !token || initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    fetchNgoProjects();
  }, [user?._id, token]);

  useEffect(() => {
    if (selectedProject?._id && token) {
      fetchProjectDonations(selectedProject._id);
    }
  }, [selectedProject?._id, token]);

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSearchTerm('');
  };

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort donations
  const sortedDonations = useMemo(() => {
    if (!donations || !Array.isArray(donations)) return [];
    
    let sortableDonations = [...donations];
    if (sortConfig.key) {
      sortableDonations.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'donatedAt') {
          aValue = new Date(a.donatedAt).getTime();
          bValue = new Date(b.donatedAt).getTime();
        }
        
        if (sortConfig.key === 'corporateId') {
          aValue = getDonorName(a.corporateId);
          bValue = getDonorName(b.corporateId);
        }
        
        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDonations;
  }, [donations, sortConfig]);

  // Filter donations
  const filteredDonations = useMemo(() => {
    if (!sortedDonations || !Array.isArray(sortedDonations)) return [];
    if (!searchTerm) return sortedDonations;
    
    const searchLower = searchTerm.toLowerCase();
    return sortedDonations.filter(donation => {
      if (!donation) return false;
      const donorName = getDonorName(donation.corporateId).toLowerCase();
      return (
        (donation.resourceName && donation.resourceName.toLowerCase().includes(searchLower)) ||
        donorName.includes(searchLower)
      );
    });
  }, [sortedDonations, searchTerm]);

  // Calculate statistics
  const totalDonations = donations.length;
  const totalQuantity = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const totalRequired = resourceNeeds.reduce((sum, r) => sum + (r.originalNeed || 0), 0);
  const totalRemaining = resourceNeeds.reduce((sum, r) => sum + (r.remainingNeeded || 0), 0);
  const totalResourceTypes = resourceNeeds.length;
  const uniqueCorporateDonors = new Set(donations.map(d => {
    if (d.corporateId && typeof d.corporateId === 'object') {
      return d.corporateId._id?.toString();
    }
    return d.corporateId?.toString();
  })).size;

  if (loading) {
    return (
      <DashboardLayout userType="ngo">
        <div className="max-w-7xl mx-auto py-16 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading projects...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <div className="relative overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500 opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700 mix-blend-screen pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              NGO Resource Portal
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Project Donations
            </h2>
            <div className="flex justify-center">
              <p className="text-blue-100/90 text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
                Track incoming resource donations, monitor remaining needs, and view donor contributions per project.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <h3 className="text-xl font-bold text-gray-900">Select a Project</h3>
            <button
              onClick={() => navigate('/ngo/dashboard')}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 w-full md:w-auto"
            >
              Back to Dashboard
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <p className="text-gray-700 font-semibold">No projects found for your organization.</p>
              <p className="text-sm text-gray-500 mt-2">
                Only projects created by {user?.organizationName || user?.name || 'your organization'} appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const selected = selectedProject?._id === project._id;
                return (
                  <button
                    key={project._id}
                    onClick={() => handleProjectSelect(project)}
                    className={`text-left rounded-2xl border p-4 transition-all ${
                      selected
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 truncate">{project.title}</p>
                    <p className="text-sm text-gray-500 mt-1 truncate">{project.organizationName}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{project.location}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedProject && (
          <>
          {/*
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalDonations}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Units Required</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalRequired}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Donated Units</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{totalQuantity}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Units Remaining</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{totalRemaining}</p>
              </div>
            </div>
          

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Resource Need Snapshot</h4>
              {resourceNeeds.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No resource requirements found for this project.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {resourceNeeds.map((resource) => (
                    <div key={resource.name} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="font-semibold text-gray-900 mb-2">{resource.name}</p>
                      <p className="text-xs text-gray-600">Required: {resource.originalNeed || 0}</p>
                      <p className="text-xs text-gray-600">Donated: {resource.totalDonated || 0}</p>
                      <p className="text-xs text-gray-600">Remaining: {resource.remainingNeeded || 0}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            */}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full xl:w-auto">
                  <input
                    type="text"
                    placeholder="Search by resource or donor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full lg:w-80 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => fetchProjectDonations(selectedProject._id)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 w-full lg:w-auto"
                  >
                    Refresh
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Resource Types: <strong>{totalResourceTypes}</strong> | Donated Units: <strong>{totalQuantity}</strong> | Donors: <strong>{uniqueCorporateDonors}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 md:p-6">
              {loadingDonations ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading donations...</p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">No Donations Found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try adjusting your search.' : 'No corporate donations have been made for this project yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200 text-gray-600">
                        <th className="py-3 pr-4 font-semibold cursor-pointer" onClick={() => requestSort('resourceName')}>
                          Resource {sortConfig.key === 'resourceName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="py-3 pr-4 font-semibold cursor-pointer" onClick={() => requestSort('quantity')}>
                          Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="py-3 pr-4 font-semibold cursor-pointer" onClick={() => requestSort('donatedAt')}>
                          Donated On {sortConfig.key === 'donatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="py-3 pr-4 font-semibold cursor-pointer" onClick={() => requestSort('corporateId')}>
                          Corporate Donor {sortConfig.key === 'corporateId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="py-3 pr-2 font-semibold">Resource Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.map((donation) => {
                        const donorName = getDonorName(donation.corporateId);
                        const donorEmail = getDonorEmail(donation.corporateId);
                        const fullyFunded = donation.remainingQuantity === 0;

                        return (
                          <tr key={donation._id} className="border-b border-gray-100 align-top">
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-gray-900">{donation.resourceName}</p>
                              {donation.resourceDescription && (
                                <p className="text-xs text-gray-500 mt-1">{donation.resourceDescription}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4 font-semibold text-emerald-600">{donation.quantity}</td>
                            <td className="py-3 pr-4 text-gray-600">{formatDate(donation.donatedAt)}</td>
                            <td className="py-3 pr-4">
                              <div className="inline-block rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                                <p className="text-blue-800 font-semibold text-xs">{donorName}</p>
                                {donorEmail && <p className="text-blue-600 text-[11px] mt-0.5">{donorEmail}</p>}
                              </div>
                            </td>
                            <td className="py-3 pr-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${fullyFunded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {fullyFunded ? 'Fully Funded' : `${donation.remainingQuantity} left`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDonations;