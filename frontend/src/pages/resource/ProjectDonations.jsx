import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProjectDonations = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'donatedAt', direction: 'desc' });

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
    
    // If corporateId is populated with user data
    if (typeof corporateId === 'object') {
      return corporateId.companyName || corporateId.name || 'Unknown Donor';
    }
    
    // If it's just an ID (not populated), show last 6 chars
    return `ID: ${corporateId.toString().slice(-6)}`;
  };

  // Get donor email if available
  const getDonorEmail = (corporateId) => {
    if (!corporateId || typeof corporateId !== 'object') return null;
    return corporateId.email || null;
  };

  // Fetch only this NGO's projects from resources
  const fetchNgoProjects = async () => {
    try {
      setLoading(true);
      
      if (!token || !user?._id) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      console.log('Fetching resources for NGO:', user._id);
      
      // Get all resources
      const response = await axios.get(
        'http://localhost:5000/api/resources/all',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("All Resources Response:", response.data);
      
      let resources = [];
      if (Array.isArray(response.data)) {
        resources = response.data;
      } else if (response.data.resources && Array.isArray(response.data.resources)) {
        resources = response.data.resources;
      }
      
      // Extract unique projects from resources
      const projectMap = new Map();
      
      resources.forEach(resource => {
        if (resource.projectId && resource.projectId._id) {
          const project = resource.projectId;
          if (!projectMap.has(project._id.toString())) {
            projectMap.set(project._id.toString(), {
              _id: project._id,
              title: project.title,
              organizationName: project.organizationName,
              focusArea: project.focusArea,
              location: project.location
            });
          }
        }
      });
      
      const projectsList = Array.from(projectMap.values());
      console.log("All Projects from resources:", projectsList);
      
      setProjects(projectsList);
      
      // Auto-select first project if available
      if (projectsList.length > 0 && !selectedProject) {
        setSelectedProject(projectsList[0]);
        fetchProjectDonations(projectsList[0]._id);
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

  // Fetch donations for selected project
  const fetchProjectDonations = async (projectId) => {
    if (!projectId) return;
    
    try {
      setLoadingDonations(true);
      
      console.log('Fetching resources for project:', projectId);
      
      const response = await axios.get(
        `http://localhost:5000/api/resources/project/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Project Resources Response:", response.data);
      
      let resources = [];
      if (Array.isArray(response.data)) {
        resources = response.data;
      } else if (response.data.resources && Array.isArray(response.data.resources)) {
        resources = response.data.resources;
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
              corporateId: donation.corporateId, // This will be populated with user data
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
      
      console.log("Extracted Donations:", allDonations);
      setDonations(allDonations);
      
    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load donations for this project");
      setDonations([]);
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    if (user?._id && token) {
      fetchNgoProjects();
    }
  }, [user, token]);

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchProjectDonations(project._id);
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
  const uniqueCorporateDonors = new Set(donations.map(d => {
    if (d.corporateId && typeof d.corporateId === 'object') {
      return d.corporateId._id?.toString();
    }
    return d.corporateId?.toString();
  })).size;

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
    projectSelector: {
      padding: '1.5rem 2rem',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    projectGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    projectCard: {
      padding: '1rem',
      background: 'white',
      borderRadius: '10px',
      border: '2px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    selectedProjectCard: {
      border: '2px solid #667eea',
      background: '#e6f7ff',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
    },
    projectName: {
      fontWeight: '600',
      fontSize: '1rem',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    projectMeta: {
      fontSize: '0.85rem',
      color: '#64748b'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
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
      borderBottom: '1px solid #e2e8f0'
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
    emptyState: {
      textAlign: 'center',
      padding: '4rem',
      color: '#64748b'
    },
    refreshButton: {
      padding: '0.5rem 1rem',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginLeft: '1rem'
    },
    donorBadge: {
      padding: '8px 12px',
      background: '#e6f7ff',
      color: '#0066cc',
      borderRadius: '6px',
      fontSize: '0.85rem',
      display: 'inline-block',
      maxWidth: '200px',
      lineHeight: '1.4'
    },
    donorName: {
      fontWeight: '600',
      marginBottom: '2px'
    },
    donorEmail: {
      fontSize: '0.7rem',
      opacity: 0.8
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading projects...</div>
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
          <h1 style={styles.headerTitle}>Project Donations</h1>
          <p style={styles.headerSubtitle}>
            View all donations received for your projects
          </p>
        </div>

        {/* Project Selector */}
        <div style={styles.projectSelector}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Select a Project</h3>
          {projects.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No projects found with donations.</p>
            </div>
          ) : (
            <div style={styles.projectGrid}>
              {projects.map((project) => (
                <div
                  key={project._id}
                  style={{
                    ...styles.projectCard,
                    ...(selectedProject?._id === project._id ? styles.selectedProjectCard : {})
                  }}
                  onClick={() => handleProjectSelect(project)}
                  onMouseEnter={(e) => {
                    if (selectedProject?._id !== project._id) {
                      e.currentTarget.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProject?._id !== project._id) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <div style={styles.projectName}>{project.title}</div>
                  <div style={styles.projectMeta}>{project.organizationName}</div>
                  <div style={styles.projectMeta}>{project.location}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProject && (
          <>
            {/* Statistics Cards */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{totalDonations}</div>
                <div style={styles.statLabel}>Total Donations</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{totalQuantity}</div>
                <div style={styles.statLabel}>Units Donated</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{uniqueCorporateDonors}</div>
                <div style={styles.statLabel}>Corporate Donors</div>
              </div>
            </div>

            {/* Search and Refresh */}
            <div style={styles.controls}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by resource or donor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchBox}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button 
                  onClick={() => fetchProjectDonations(selectedProject._id)}
                  style={styles.refreshButton}
                  onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
                  onMouseLeave={(e) => e.target.style.background = '#667eea'}
                >
                  🔄 Refresh
                </button>
              </div>
              <button 
                onClick={() => navigate('/ngo/dashboard')}
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

            {/* Donations Table */}
            <div style={styles.tableContainer}>
              {loadingDonations ? (
                <div style={styles.emptyState}>
                  <p>Loading donations...</p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    No Donations Found
                  </h3>
                  <p style={{ color: '#94a3b8' }}>
                    {searchTerm 
                      ? 'Try adjusting your search' 
                      : 'No corporate donations have been made for this project yet'}
                  </p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th} onClick={() => requestSort('resourceName')}>
                        Resource {sortConfig.key === 'resourceName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => requestSort('quantity')}>
                        Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => requestSort('donatedAt')}>
                        Donated On {sortConfig.key === 'donatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => requestSort('corporateId')}>
                        Corporate Donor {sortConfig.key === 'corporateId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th}>Resource Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => {
                      const donorName = getDonorName(donation.corporateId);
                      const donorEmail = getDonorEmail(donation.corporateId);
                      
                      return (
                        <tr key={donation._id}>
                          <td style={styles.td}>
                            <strong>{donation.resourceName}</strong>
                            {donation.resourceDescription && (
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                {donation.resourceDescription}
                              </div>
                            )}
                          </td>
                          <td style={styles.td}>
                            <span style={{ 
                              color: '#10b981',
                              fontWeight: '600'
                            }}>
                              {donation.quantity}
                            </span>
                          </td>
                          <td style={styles.td}>{formatDate(donation.donatedAt)}</td>
                          <td style={styles.td}>
                            <div style={styles.donorBadge}>
                              <div style={styles.donorName}>
                                {donorName}
                              </div>
                              {donorEmail && (
                                <div style={styles.donorEmail}>
                                  {donorEmail}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              background: donation.remainingQuantity === 0 ? '#dcfce7' : '#fff3cd',
                              color: donation.remainingQuantity === 0 ? '#166534' : '#856404'
                            }}>
                              {donation.remainingQuantity === 0 ? 'Fully Funded' : `${donation.remainingQuantity} left`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDonations;