import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
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
      const response = await axios.get(
        '/api/resources/all'
      );
      
      // Handle different response formats
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
        
        // Handle nested objects
        if (sortConfig.key === 'project') {
          aValue = a.projectId?.title || '';
          bValue = b.projectId?.title || '';
        }
        
        // Handle undefined values
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

  // Prepare data for charts (extract all donations)
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

  // Handle update button click
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

  // Handle update form change
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    try {
      if (!updateForm.name || !updateForm.totalQuantity) {
        toast.error('Name and total quantity are required');
        return;
      }

      await axios.put(
        `/api/resources/${selectedResource._id}`,
        {
          name: updateForm.name,
          totalQuantity: Number(updateForm.totalQuantity),
          remainingQuantity: Number(updateForm.remainingQuantity),
          description: updateForm.description
        }
      );

      toast.success('Resource updated successfully!');
      setShowUpdateModal(false);
      fetchAllResources();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || 'Failed to update resource');
    }
  };

  // Handle delete click
  const handleDeleteClick = (resource) => {
    if (resource.remainingQuantity === 0) {
      toast.error('Cannot delete a fully funded resource');
      return;
    }
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `/api/resources/${selectedResource._id}`
      );

      toast.success('Resource deleted successfully!');
      setShowDeleteModal(false);
      fetchAllResources();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  // Toggle charts visibility
  const toggleCharts = () => {
    setShowCharts(!showCharts);
    if (!showCharts && getAllDonations.length === 0) {
      toast.error('No donation data available for charts');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      color: 'white'
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0'
    },
    headerSubtitle: {
      fontSize: '1rem',
      opacity: 0.9,
      margin: 0
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '1rem',
      padding: '2rem',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    statCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    controls: {
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    leftControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    searchBox: {
      padding: '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      width: '350px',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      outline: 'none'
    },
    featureButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    featureButton: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    chartsButton: {
      background: '#10b981',
      color: 'white'
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      background: 'white',
      color: '#667eea',
      border: '2px solid #667eea',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tableContainer: {
      padding: '0 2rem 2rem 2rem',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    th: {
      background: '#f8fafc',
      padding: '1rem',
      textAlign: 'left',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      borderBottom: '2px solid #e2e8f0'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
      color: '#1e293b'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      margin: '0 0.25rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    editButton: {
      background: '#e6f7ff',
      color: '#0066cc'
    },
    deleteButton: {
      background: '#fff1f0',
      color: '#cf1322'
    },
    disabledButton: {
      background: '#f3f4f6',
      color: '#9ca3af',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-block'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#1e293b'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#475569'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.2s',
      outline: 'none'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    saveButton: {
      flex: 1,
      padding: '0.75rem',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    cancelButton: {
      flex: 1,
      padding: '0.75rem',
      background: 'white',
      color: '#64748b',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    deleteConfirmButton: {
      flex: 1,
      padding: '0.75rem',
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading resources...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Resource Management</h1>
          <p style={styles.headerSubtitle}>
            Manage all resources across projects
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalResources}</div>
            <div style={styles.statLabel}>Total Resources</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalQuantity}</div>
            <div style={styles.statLabel}>Total Units</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalDonated}</div>
            <div style={styles.statLabel}>Donated</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalRemaining}</div>
            <div style={styles.statLabel}>Remaining</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{fullyFundedCount}</div>
            <div style={styles.statLabel}>Fully Funded</div>
          </div>
        </div>

        {/* Search and Feature Buttons */}
        <div style={styles.controls}>
          <div style={styles.leftControls}>
            <input
              type="text"
              placeholder="🔍 Search by resource name, project, organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchBox}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button 
              onClick={fetchAllResources}
              style={{
                ...styles.actionButton,
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.background = '#667eea'}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div style={styles.featureButtons}>
            <button 
              onClick={toggleCharts}
              style={{
                ...styles.featureButton,
                ...styles.chartsButton,
                background: showCharts ? '#059669' : '#10b981'
              }}
              onMouseEnter={(e) => !showCharts && (e.target.style.background = '#059669')}
              onMouseLeave={(e) => !showCharts && (e.target.style.background = '#10b981')}
            >
              <span>{showCharts ? '📊 Hide Charts' : '📊 Show Analytics'}</span>
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <DonationCharts donations={getAllDonations} />
        )}

        {/* Resources Table */}
        <div style={styles.tableContainer}>
          {filteredResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#64748b' }}>
                No Resources Found
              </h3>
              <p style={{ color: '#94a3b8' }}>
                {searchTerm ? 'Try adjusting your search' : 'No resources have been created yet'}
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => requestSort('name')}>
                    Resource Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th} onClick={() => requestSort('project')}>
                    Project {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th} onClick={() => requestSort('totalQuantity')}>
                    Total {sortConfig.key === 'totalQuantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th} onClick={() => requestSort('remainingQuantity')}>
                    Remaining {sortConfig.key === 'remainingQuantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={styles.th}>Progress</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={styles.th}>Actions</th>
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
                    <tr key={resource._id}>
                      <td style={styles.td}>
                        <strong>{resource.name || 'Unnamed Resource'}</strong>
                        {resource.description && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            {resource.description}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div><strong>{resource.projectId?.title || 'Unknown Project'}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {resource.projectId?.organizationName || ''}
                        </div>
                      </td>
                      <td style={styles.td}>{totalQty}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          color: remainingQty > 0 ? '#e67e22' : '#10b981',
                          fontWeight: '600'
                        }}>
                          {remainingQty}
                        </span>
                      </td>
                      <td style={{ ...styles.td, width: '120px' }}>
                        <div style={styles.progressBar}>
                          <div 
                            style={{
                              ...styles.progressFill,
                              width: `${progress}%`
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b' }}>
                          {donated}/{totalQty}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: isFullyFunded ? '#dcfce7' : '#fff3cd',
                          color: isFullyFunded ? '#166534' : '#856404'
                        }}>
                          {isFullyFunded ? '✓ Fully Funded' : '🔄 In Progress'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {formatDate(resource.updatedAt)}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...(isFullyFunded ? styles.disabledButton : styles.editButton),
                            marginRight: '0.5rem'
                          }}
                          onClick={() => !isFullyFunded && handleUpdateClick(resource)}
                          disabled={isFullyFunded}
                          title={isFullyFunded ? "Cannot edit fully funded resource" : "Edit resource"}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...(isFullyFunded ? styles.disabledButton : styles.deleteButton)
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
        <div style={styles.modalOverlay} onClick={() => setShowUpdateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Update Resource</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Resource Name *</label>
              <input
                type="text"
                name="name"
                value={updateForm.name}
                onChange={handleUpdateChange}
                style={styles.input}
                placeholder="Enter resource name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Total Quantity *</label>
              <input
                type="number"
                name="totalQuantity"
                value={updateForm.totalQuantity}
                onChange={handleUpdateChange}
                style={styles.input}
                placeholder="Enter total quantity"
                min="1"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Remaining Quantity</label>
              <input
                type="number"
                name="remainingQuantity"
                value={updateForm.remainingQuantity}
                onChange={handleUpdateChange}
                style={styles.input}
                placeholder="Enter remaining quantity"
                min="0"
                max={updateForm.totalQuantity}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={updateForm.description}
                onChange={handleUpdateChange}
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter description (optional)"
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowUpdateModal(false)}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={handleUpdateSubmit}
                onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              Are you sure you want to delete <strong>{selectedResource?.name}</strong>? 
              This action cannot be undone.
            </p>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                style={styles.deleteConfirmButton}
                onClick={handleDeleteConfirm}
                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
              >
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManage;