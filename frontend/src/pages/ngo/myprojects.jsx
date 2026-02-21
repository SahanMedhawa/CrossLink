import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/dashboard/Sidebar'; // Import the sidebar
import Header from '../../components/dashboard/Header';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // Common skills array - defined here so it can be passed to the modal
  const commonSkills = [
    'Teaching', 'Healthcare', 'Technology', 'Marketing', 'Design',
    'Writing', 'Photography', 'Video Editing', 'Social Media',
    'Event Planning', 'Fundraising', 'Project Management',
    'Data Analysis', 'Web Development', 'Counseling',
    'Communication', 'Leadership', 'Public Speaking'
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const url = statusFilter 
        ? `http://localhost:5000/api/projects/ngo/my-projects?status=${statusFilter}`
        : 'http://localhost:5000/api/projects/ngo/my-projects';
        
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProjects(response.data.projects);
      setTotalPages(Math.ceil(response.data.projects.length / projectsPerPage));
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setLoading(false);
    }
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('crosslink_token');
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('crosslink_token');
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Project status updated successfully');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#EBF5FF', text: '#0052CC', border: '#0052CC' };
      case 'draft': return { bg: '#F8F9FA', text: '#6C757D', border: '#ADB5BD' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' };
      case 'cancelled': return { bg: '#FFEBEE', text: '#C62828', border: '#EF5350' };
      default: return { bg: '#F8F9FA', text: '#495057', border: '#CED4DA' };
    }
  };

  const styles = {
    appContainer: {
      display: 'flex',
      minHeight: '100%',
      background: '#F8FAFD',
      position: 'relative'
    },
    sidebarWrapper: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '',
      zIndex: 10,
      background: 'white',
    },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? 0 : '16rem',
      width: isMobile ? '100%' : 'calc(100% - 16rem)',
      minHeight: '100vh'
    },
    mobileHeader: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      padding: '1rem',
      background: 'white',
      borderBottom: '1px solid #E1E8ED',
      position: 'sticky',
      top: 0,
      zIndex: 20
    },
    menuButton: {
      padding: '0.5rem',
      marginRight: '1rem',
      background: 'white',
      border: '1px solid #E1E8ED',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    container: {
      minHeight: '100vh',
      background: 'transparent',
      padding: '0'
    },
    innerContainer: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },
    pageHeader: {
      background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
      padding: '2.5rem 2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0, 82, 204, 0.15)',
      borderRadius: '0'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem'
    },
    titleSection: {
      flex: 1
    },
    h1: {
      color: '#FFFFFF',
      fontSize: '2.25rem',
      fontWeight: '600',
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1rem',
      margin: 0,
      fontWeight: '400'
    },
    filterSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'rgba(255, 255, 255, 0.15)',
      padding: '0.75rem 1.25rem',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    label: {
      fontWeight: '500',
      color: '#FFFFFF',
      fontSize: '0.9rem'
    },
    select: {
      padding: '0.625rem 2.5rem 0.625rem 1rem',
      border: '1px solid #E1E8ED',
      borderRadius: '6px',
      fontSize: '0.9rem',
      cursor: 'pointer',
      background: 'white',
      color: '#172B4D',
      fontWeight: '500',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230052CC' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5rem',
      transition: 'all 0.2s'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED'
    },
    loadingText: {
      color: '#172B4D',
      fontSize: '1rem',
      fontWeight: '500'
    },
    error: {
      textAlign: 'center',
      padding: '3rem 2rem',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #FFEBEE',
      color: '#C62828',
      fontSize: '1rem',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(198, 40, 40, 0.1)'
    },
    noProjects: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED'
    },
    noProjectsTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#172B4D',
      marginBottom: '0.75rem'
    },
    noProjectsText: {
      color: '#5E6C84',
      fontSize: '1rem',
      margin: '0.5rem 0'
    },
    statsBar: {
      background: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED'
    },
    projectCount: {
      color: '#172B4D',
      fontSize: '0.9rem',
      fontWeight: '600',
      margin: 0
    },
    projectsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    projectCard: {
      background: 'white',
      border: '1px solid #E1E8ED',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      height: '100%',
      minHeight: '280px'
    },
    projectImage: {
      height: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
      position: 'relative'
    },
    projectImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    projectContent: {
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    projectHeader: {
      marginBottom: '0.75rem'
    },
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '0.5rem'
    },
    h2: {
      margin: 0,
      color: '#172B4D',
      fontSize: '1.1rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1
    },
    statusBadge: {
      padding: '0.25rem 0.625rem',
      borderRadius: '4px',
      fontSize: '0.65rem',
      fontWeight: '700',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      border: '1px solid',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    description: {
      color: '#5E6C84',
      lineHeight: '1.5',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    projectDetails: {
      background: '#F8F9FA',
      padding: '0.875rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid #E1E8ED',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem 1rem'
    },
    detailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem'
    },
    detailLabel: {
      fontWeight: '600',
      color: '#172B4D',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      whiteSpace: 'nowrap'
    },
    detailValue: {
      color: '#5E6C84',
      fontSize: '0.75rem',
      textAlign: 'right',
      fontWeight: '500',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    skillsSection: {
      marginBottom: '1rem'
    },
    h4: {
      margin: '0 0 0.5rem 0',
      color: '#172B4D',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.375rem'
    },
    skillBadge: {
      padding: '0.25rem 0.625rem',
      background: '#DEEBFF',
      color: '#0052CC',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
      border: '1px solid #B3D4FF',
      whiteSpace: 'nowrap'
    },
    resourcesSection: {
      marginBottom: '1rem',
      background: '#FFF4E6',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '1px solid #FFE0B2'
    },
    resourcesDisplay: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem'
    },
    resourceItem: {
      color: '#E65100',
      fontSize: '0.75rem',
      padding: '0.375rem 0.625rem',
      background: 'white',
      borderRadius: '4px',
      border: '1px solid #FFCC80',
      fontWeight: '500',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    projectActions: {
      marginTop: 'auto',
      paddingTop: '1rem',
      borderTop: '1px solid #E1E8ED',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    statusChange: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statusLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#172B4D',
      whiteSpace: 'nowrap'
    },
    statusSelect: {
      flex: 1,
      padding: '0.375rem 2rem 0.375rem 0.625rem',
      border: '1px solid #E1E8ED',
      borderRadius: '6px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      background: 'white',
      color: '#172B4D',
      fontWeight: '500',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230052CC' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1rem',
      transition: 'all 0.2s'
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem'
    },
    editButton: {
      padding: '0.5rem 1rem',
      background: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)'
    },
    deleteButton: {
      padding: '0.5rem 1rem',
      background: 'white',
      color: '#C62828',
      border: '1px solid #FFCDD2',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      padding: '1rem'
    },
    paginationButton: {
      padding: '0.625rem 1rem',
      border: '1px solid #E1E8ED',
      background: 'white',
      color: '#172B4D',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s',
      minWidth: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activePage: {
      background: '#0052CC',
      color: 'white',
      borderColor: '#0052CC'
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    },
    pageInfo: {
      margin: '0 1rem',
      color: '#5E6C84',
      fontSize: '0.875rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.appContainer}>
        {!isMobile && (
          <div style={styles.sidebarWrapper}>
            <Sidebar 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={isMobile}
              userType="ngo"
            />
          </div>
        )}
        {isMobile && (
          <Sidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            userType="ngo"
          />
        )}
        <div style={styles.mainContent}>
          {isMobile && (
            <div style={styles.mobileHeader}>
              <button 
                style={styles.menuButton}
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#172B4D', margin: 0 }}>My Projects</h2>
            </div>
          )}
          <div style={styles.container}>
            <div style={styles.innerContainer}>
              <div style={styles.loading}>
                <div style={styles.loadingText}>Loading your projects...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.appContainer}>
        {!isMobile && (
          <div style={styles.sidebarWrapper}>
            <Sidebar 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={isMobile}
              userType="ngo"
            />
          </div>
        )}
        {isMobile && (
          <Sidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            userType="ngo"
          />
        )}
        <div style={styles.mainContent}>
          {isMobile && (
            <div style={styles.mobileHeader}>
              <button 
                style={styles.menuButton}
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#172B4D', margin: 0 }}>My Projects</h2>
            </div>
          )}
          <div style={styles.container}>
            <div style={styles.innerContainer}>
              <div style={styles.error}>{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {!isMobile && (
        <div style={styles.sidebarWrapper}>
          <Sidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            userType="ngo"
          />
        </div>
      )}
      
      {isMobile && (
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          userType="ngo"
        />
      )}
      
      <div style={styles.mainContent}>
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button 
              style={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#172B4D', margin: 0 }}>My Projects</h2>
          </div>
        )}

        <div style={styles.container}>
        <Header/>
          <div style={styles.innerContainer}>
            <div style={styles.pageHeader}>
              <div style={styles.headerContent}>
                <div style={styles.titleSection}>
                  <h1 style={styles.h1}>My Projects</h1>
                  <p style={styles.subtitle}>Manage and track all your organization's projects</p>
                </div>
                <div style={styles.filterSection}>
                  <label style={styles.label}>Filter:</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.select}
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

            {projects.length === 0 ? (
              <div style={styles.noProjects}>
                <div style={styles.noProjectsTitle}>No projects found</div>
                <p style={styles.noProjectsText}>You haven't created any projects yet.</p>
                <p style={styles.noProjectsText}>Create your first project to get started!</p>
              </div>
            ) : (
              <>
                <div style={styles.statsBar}>
                  <p style={styles.projectCount}>
                    Showing {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, projects.length)} of {projects.length} project{projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div style={styles.projectsList}>
                  {currentProjects.map(project => {
                    const statusColors = getStatusColor(project.status);
                    return (
                      <div 
                        key={project._id} 
                        style={styles.projectCard}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 82, 204, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                        }}
                      >
                        {project.image ? (
                          <div style={styles.projectImage}>
                            <img 
                              src={`http://localhost:5000${project.image}`} 
                              alt={project.title}
                              style={styles.projectImg}
                            />
                          </div>
                        ) : (
                          <div style={styles.projectImage} />
                        )}
                        
                        <div style={styles.projectContent}>
                          <div style={styles.projectHeader}>
                            <div style={styles.titleRow}>
                              <h2 style={styles.h2}>{project.title}</h2>
                              <span 
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor: statusColors.bg,
                                  color: statusColors.text,
                                  borderColor: statusColors.border
                                }}
                              >
                                {project.status}
                              </span>
                            </div>
                          </div>

                          <p style={styles.description}>{project.description}</p>

                          <div style={styles.projectDetails}>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Focus:</span>
                              <span style={styles.detailValue}>{project.focusArea}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Location:</span>
                              <span style={styles.detailValue}>{project.location}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Start:</span>
                              <span style={styles.detailValue}>{formatDate(project.startDate)}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>End:</span>
                              <span style={styles.detailValue}>{formatDate(project.endDate)}</span>
                            </div>
                          </div>

                          <div style={styles.skillsSection}>
                            <h4 style={styles.h4}>Required Skills</h4>
                            <div style={styles.skillsList}>
                              {project.skills.slice(0, 4).map(skill => (
                                <span key={skill} style={styles.skillBadge}>{skill}</span>
                              ))}
                              {project.skills.length > 4 && (
                                <span style={styles.skillBadge}>+{project.skills.length - 4}</span>
                              )}
                            </div>
                          </div>

                          {project.resources && project.resources.length > 0 && (
                            <div style={styles.resourcesSection}>
                              <h4 style={{...styles.h4, color: '#92400E', margin: '0 0 0.375rem 0'}}>Resources</h4>
                              <div style={styles.resourcesDisplay}>
                                {project.resources.slice(0, 1).map((resource, index) => (
                                  <div key={index} style={styles.resourceItem}>
                                    <strong>{resource.name}</strong>: {resource.quantity}
                                  </div>
                                ))}
                                {project.resources.length > 1 && (
                                  <div style={styles.resourceItem}>
                                    +{project.resources.length - 1} more resource(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div style={styles.projectActions}>
                            <div style={styles.statusChange}>
                              <label style={styles.statusLabel}>Status:</label>
                              <select
                                value={project.status}
                                onChange={(e) => handleStatusChange(project._id, e.target.value)}
                                style={styles.statusSelect}
                              >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div style={styles.actionButtons}>
                              <button 
                                style={styles.editButton}
                                onClick={() => setEditingProject(project)}
                                onMouseOver={(e) => e.target.style.background = '#0747A6'}
                                onMouseOut={(e) => e.target.style.background = '#0052CC'}
                              >
                                Edit
                              </button>
                              <button 
                                style={styles.deleteButton}
                                onClick={() => handleDelete(project._id)}
                                onMouseOver={(e) => {
                                  e.target.style.background = '#FFEBEE';
                                  e.target.style.borderColor = '#C62828';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'white';
                                  e.target.style.borderColor = '#FFCDD2';
                                }}
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

                {totalPages > 1 && (
                  <div style={styles.paginationContainer}>
                    <button
                      onClick={prevPage}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === 1 ? styles.disabledButton : {})
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            style={{
                              ...styles.paginationButton,
                              ...(currentPage === pageNumber ? styles.activePage : {})
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      } 
                      else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber} style={styles.pageInfo}>...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={nextPage}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === totalPages ? styles.disabledButton : {})
                      }}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {editingProject && (
              <EditProjectModal
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onUpdate={fetchProjects}
                commonSkills={commonSkills}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Modal Component
const EditProjectModal = ({ project, onClose, onUpdate, commonSkills }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    skills: project.skills,
    focusArea: project.focusArea,
    location: project.location,
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate.split('T')[0],
    resources: project.resources || []
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [resourceInput, setResourceInput] = useState({ name: '', quantity: '', description: '' });

  const focusAreaOptions = [
    'Education', 'Healthcare', 'Environment', 'Youth',
    'Women Empowerment', 'Poverty Alleviation', 'Animal Welfare',
    'Disaster Relief', 'Arts & Culture', 'Technology'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addResource = () => {
    if (resourceInput.name && resourceInput.quantity) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, {
          name: resourceInput.name,
          quantity: parseInt(resourceInput.quantity),
          description: resourceInput.description
        }]
      }));
      setResourceInput({ name: '', quantity: '', description: '' });
    }
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('crosslink_token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'skills' || key === 'resources') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await axios.put(
        `http://localhost:5000/api/projects/${project._id}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Project updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(9, 30, 66, 0.54)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
      animation: 'fadeIn 0.2s ease-out'
    },
    content: {
      background: 'white',
      borderRadius: '8px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
      animation: 'slideUp 0.3s ease-out'
    },
    header: {
      padding: '1.75rem 2rem',
      borderBottom: '2px solid #E1E8ED',
      position: 'sticky',
      top: 0,
      background: 'white',
      zIndex: 10,
      borderRadius: '8px 8px 0 0'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    h2: {
      margin: 0,
      color: '#172B4D',
      fontSize: '1.5rem',
      fontWeight: '600',
      letterSpacing: '-0.01em'
    },
    closeButton: {
      background: '#F4F5F7',
      border: 'none',
      width: '36px',
      height: '36px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1.5rem',
      color: '#5E6C84'
    },
    form: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontWeight: '600',
      color: '#172B4D',
      fontSize: '0.875rem',
      letterSpacing: '0.01em'
    },
    input: {
      padding: '0.75rem 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '6px',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      background: 'white',
      color: '#172B4D'
    },
    textarea: {
      padding: '0.75rem 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      transition: 'all 0.2s',
      background: 'white',
      color: '#172B4D',
      lineHeight: '1.6'
    },
    select: {
      padding: '0.75rem 2.5rem 0.75rem 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '6px',
      fontSize: '0.95rem',
      background: 'white',
      color: '#172B4D',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230052CC' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.75rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    skillButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.625rem',
      marginTop: '0.75rem'
    },
    skillButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #B3D4FF',
      background: '#DEEBFF',
      color: '#0052CC',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    selectedSkills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.625rem',
      marginTop: '0.875rem'
    },
    skillTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.625rem 1rem',
      background: '#0052CC',
      color: 'white',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    removeBtn: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'none',
      color: 'white',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      padding: '1.5rem 2rem',
      borderTop: '2px solid #E1E8ED',
      position: 'sticky',
      bottom: 0,
      background: 'white',
      borderRadius: '0 0 8px 8px'
    },
    cancelButton: {
      padding: '0.75rem 1.75rem',
      background: 'white',
      color: '#5E6C84',
      border: '1px solid #DFE1E6',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    },
    saveButton: {
      padding: '0.75rem 1.75rem',
      background: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.headerContent}>
            <h2 style={modalStyles.h2}>Edit Project</h2>
            <button 
              style={modalStyles.closeButton} 
              onClick={onClose}
              onMouseOver={(e) => e.target.style.background = '#DFE1E6'}
              onMouseOut={(e) => e.target.style.background = '#F4F5F7'}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Project Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              style={modalStyles.textarea}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Focus Area *</label>
            <select
              name="focusArea"
              value={formData.focusArea}
              onChange={handleInputChange}
              required
              style={modalStyles.select}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            >
              {focusAreaOptions.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Skills *</label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              placeholder="Type a skill and press Enter"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
            <div style={modalStyles.skillButtons}>
              {commonSkills.filter(s => !formData.skills.includes(s)).slice(0, 18).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  style={modalStyles.skillButton}
                  onMouseOver={(e) => {
                    e.target.style.background = '#0052CC';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#DEEBFF';
                    e.target.style.color = '#0052CC';
                  }}
                >
                  + {skill}
                </button>
              ))}
            </div>
            <div style={modalStyles.selectedSkills}>
              {formData.skills.map(skill => (
                <span key={skill} style={modalStyles.skillTag}>
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => removeSkill(skill)} 
                    style={modalStyles.removeBtn}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Update Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={modalStyles.input}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                style={modalStyles.input}
                onFocus={(e) => e.target.style.borderColor = '#0052CC'}
                onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
              />
            </div>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                style={modalStyles.input}
                onFocus={(e) => e.target.style.borderColor = '#0052CC'}
                onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
              />
            </div>
          </div>

          <div style={modalStyles.modalActions}>
            <button 
              type="button" 
              onClick={onClose} 
              style={modalStyles.cancelButton}
              onMouseOver={(e) => e.target.style.background = '#F4F5F7'}
              onMouseOut={(e) => e.target.style.background = 'white'}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={modalStyles.saveButton}
              onMouseOver={(e) => !loading && (e.target.style.background = '#0747A6')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#0052CC')}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProjects;
