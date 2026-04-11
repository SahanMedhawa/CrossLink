import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';  // Import DashboardLayout
import DonationCharts from '../../components/resources/DonationCharts';

const ResourceManage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    totalQuantity: '',
    remainingQuantity: '',
    description: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showCharts, setShowCharts] = useState(false);
  const [showReport, setShowReport] = useState(false);

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

  // Set up axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Fetch all resources
  const fetchAllResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources/all');
      
      let resourcesData = [];
      if (Array.isArray(response.data)) {
        resourcesData = response.data;
      } else if (response.data.resources && Array.isArray(response.data.resources)) {
        resourcesData = response.data.resources;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        resourcesData = response.data.data;
      }
      
      setResources(resourcesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to fetch resources");
      toast.error("Failed to load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResources();
  }, []);

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort resources
  const sortedResources = useMemo(() => {
    if (!resources || !Array.isArray(resources)) {
      return [];
    }
    
    let sortableResources = [...resources];
    if (sortConfig.key) {
      sortableResources.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'project') {
          aValue = a.projectId?.title || '';
          bValue = b.projectId?.title || '';
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
    return sortableResources;
  }, [resources, sortConfig]);

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!sortedResources || !Array.isArray(sortedResources)) {
      return [];
    }
    
    if (!searchTerm) {
      return sortedResources;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return sortedResources.filter(resource => {
      if (!resource) return false;
      
      return (
        (resource.name && resource.name.toLowerCase().includes(searchLower)) ||
        (resource.projectId?.title && resource.projectId.title.toLowerCase().includes(searchLower)) ||
        (resource.projectId?.organizationName && resource.projectId.organizationName.toLowerCase().includes(searchLower)) ||
        (resource.description && resource.description.toLowerCase().includes(searchLower))
      );
    });
  }, [sortedResources, searchTerm]);

  // Calculate statistics
  const totalResources = resources?.length || 0;
  const totalQuantity = resources?.reduce((sum, res) => sum + (res?.totalQuantity || 0), 0) || 0;
  const totalRemaining = resources?.reduce((sum, res) => sum + (res?.remainingQuantity || 0), 0) || 0;
  const totalDonated = totalQuantity - totalRemaining;
  const fullyFundedCount = resources?.filter(res => res?.remainingQuantity === 0)?.length || 0;

  // Prepare data for charts
  const getAllDonations = useMemo(() => {
    const donations = [];
    resources.forEach(resource => {
      if (resource.donatedBy && Array.isArray(resource.donatedBy)) {
        resource.donatedBy.forEach(donation => {
          donations.push({
            _id: `${resource._id}_${donation.donatedAt}`,
            resourceName: resource.name,
            resourceId: resource._id,
            quantity: donation.quantity,
            donatedAt: donation.donatedAt,
            corporateId: donation.corporateId,
            projectId: resource.projectId?._id,
            projectName: resource.projectId?.title || 'Unknown Project',
            organizationName: resource.projectId?.organizationName || '',
            totalQuantity: resource.totalQuantity,
            remainingQuantity: resource.remainingQuantity,
            resourceDescription: resource.description
          });
        });
      }
    });
    return donations;
  }, [resources]);

  // Handle update
  const handleUpdateClick = (resource) => {
    if (resource.remainingQuantity === 0) {
      toast.error('Cannot edit a fully funded resource');
      return;
    }
    setSelectedResource(resource);
    setUpdateForm({
      name: resource.name || '',
      totalQuantity: resource.totalQuantity || '',
      remainingQuantity: resource.remainingQuantity || '',
      description: resource.description || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSubmit = async () => {
    try {
      if (!updateForm.name || !updateForm.totalQuantity) {
        toast.error('Name and total quantity are required');
        return;
      }

      await axios.put(`/api/resources/${selectedResource._id}`, {
        name: updateForm.name,
        totalQuantity: Number(updateForm.totalQuantity),
        remainingQuantity: Number(updateForm.remainingQuantity),
        description: updateForm.description
      });

      toast.success('Resource updated successfully!');
      setShowUpdateModal(false);
      fetchAllResources();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || 'Failed to update resource');
    }
  };

  // Handle delete
  const handleDeleteClick = (resource) => {
    if (resource.remainingQuantity === 0) {
      toast.error('Cannot delete a fully funded resource');
      return;
    }
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/resources/${selectedResource._id}`);
      toast.success('Resource deleted successfully!');
      setShowDeleteModal(false);
      fetchAllResources();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  const toggleCharts = () => {
    setShowCharts(!showCharts);
    if (!showCharts && getAllDonations.length === 0) {
      toast.error('No donation data available for charts');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout userType="corporate">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading resources...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Main return with DashboardLayout wrapper
  return (
    <DashboardLayout userType="corporate">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '20px',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
            Resource Management
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
            Manage all resources across projects
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{totalResources}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Resources</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{totalQuantity}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Units</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{totalDonated}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Donated</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{totalRemaining}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Remaining</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{fullyFundedCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Fully Funded</div>
          </div>
        </div>

        {/* Search and Feature Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Search by resource name, project, organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                width: '350px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button 
              onClick={fetchAllResources}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.background = '#667eea'}
            >
              🔄 Refresh
            </button>
          </div>
          
          <button 
            onClick={toggleCharts}
            style={{
              padding: '0.75rem 1.5rem',
              background: showCharts ? '#059669' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{showCharts ? '📊 Hide Charts' : '📊 Show Analytics'}</span>
          </button>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <DonationCharts donations={getAllDonations} />
        )}

        {/* Resources Table */}
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {filteredResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#64748b' }}>No Resources Found</h3>
              <p style={{ color: '#94a3b8' }}>{searchTerm ? 'Try adjusting your search' : 'No resources have been created yet'}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc', cursor: 'pointer' }} onClick={() => requestSort('name')}>
                    Resource Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc', cursor: 'pointer' }} onClick={() => requestSort('project')}>
                    Project {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc', cursor: 'pointer' }} onClick={() => requestSort('totalQuantity')}>
                    Total {sortConfig.key === 'totalQuantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc', cursor: 'pointer' }} onClick={() => requestSort('remainingQuantity')}>
                    Remaining {sortConfig.key === 'remainingQuantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc' }}>Progress</th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc' }}>Last Updated</th>
                  <th style={{ padding: '1rem', textAlign: 'left', background: '#f8fafc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => {
                  const totalQty = resource?.totalQuantity || 0;
                  const remainingQty = resource?.remainingQuantity || 0;
                  const donated = totalQty - remainingQty;
                  const progress = totalQty > 0 ? (donated / totalQty) * 100 : 0;
                  const isFullyFunded = remainingQty === 0;

                  return (
                    <tr key={resource._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong>{resource.name || 'Unnamed Resource'}</strong>
                        {resource.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            {resource.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div><strong>{resource.projectId?.title || 'Unknown Project'}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {resource.projectId?.organizationName || ''}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{totalQty}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: remainingQty > 0 ? '#e67e22' : '#10b981', fontWeight: '600' }}>
                          {remainingQty}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', width: '120px' }}>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b' }}>{donated}/{totalQty}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: isFullyFunded ? '#dcfce7' : '#fff3cd',
                          color: isFullyFunded ? '#166534' : '#856404'
                        }}>
                          {isFullyFunded ? '✓ Fully Funded' : '🔄 In Progress'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{formatDate(resource.updatedAt)}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            marginRight: '0.5rem',
                            background: isFullyFunded ? '#f3f4f6' : '#e6f7ff',
                            color: isFullyFunded ? '#9ca3af' : '#0066cc',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isFullyFunded ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}
                          onClick={() => !isFullyFunded && handleUpdateClick(resource)}
                          disabled={isFullyFunded}
                          title={isFullyFunded ? "Cannot edit fully funded resource" : "Edit resource"}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            background: isFullyFunded ? '#f3f4f6' : '#fff1f0',
                            color: isFullyFunded ? '#9ca3af' : '#cf1322',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isFullyFunded ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}
                          onClick={() => !isFullyFunded && handleDeleteClick(resource)}
                          disabled={isFullyFunded}
                          title={isFullyFunded ? "Cannot delete fully funded resource" : "Delete resource"}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedResource && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowUpdateModal(false)}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Update Resource</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Resource Name *</label>
              <input
                type="text"
                name="name"
                value={updateForm.name}
                onChange={handleUpdateChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                placeholder="Enter resource name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Total Quantity *</label>
              <input
                type="number"
                name="totalQuantity"
                value={updateForm.totalQuantity}
                onChange={handleUpdateChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                placeholder="Enter total quantity"
                min="1"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Remaining Quantity</label>
              <input
                type="number"
                name="remainingQuantity"
                value={updateForm.remainingQuantity}
                onChange={handleUpdateChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                placeholder="Enter remaining quantity"
                min="0"
                max={updateForm.totalQuantity}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                name="description"
                value={updateForm.description}
                onChange={handleUpdateChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter description (optional)"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                style={{ flex: 1, padding: '0.75rem', background: 'white', color: '#64748b', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ flex: 1, padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={handleUpdateSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              Are you sure you want to delete <strong>{selectedResource?.name}</strong>? 
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                style={{ flex: 1, padding: '0.75rem', background: 'white', color: '#64748b', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ flex: 1, padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={handleDeleteConfirm}
              >
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResourceManage;