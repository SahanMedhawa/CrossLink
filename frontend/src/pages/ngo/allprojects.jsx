import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/user/Navbar';
import ResourceForm from '../resource/ResourceForm';
import { resolveImageUrl } from '../../utils/imageUrl';
import { getSocket } from '../../services/socket';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({ 
    focusArea: '', 
    location: '', 
    skills: '' 
  });
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [projectFundingStatus, setProjectFundingStatus] = useState(null);
  const [checkingFunding, setCheckingFunding] = useState(false);

  // Volunteer application state
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [volunteerApplication, setVolunteerApplication] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    availability: '',
    message: ''
  });
  const [applyingVolunteer, setApplyingVolunteer] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');
  const [volunteerSuccess, setVolunteerSuccess] = useState('');

  // Map view state
  const [showMap, setShowMap] = useState(false);

  // Map reference
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#F8FAFD',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      paddingBottom: '2rem'
    },
    contentWidth: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },
    filterCard: {
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E1E8ED',
      padding: '1.5rem 2rem',
      marginBottom: '2.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1.5rem 2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    },
    inputWrapper: {
      flex: 1,
      minWidth: '220px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontWeight: '600',
      color: '#172B4D',
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      textTransform: 'uppercase'
    },
    select: {
      height: '48px',
      padding: '0 1rem 0 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '8px',
      background: 'white',
      fontSize: '0.95rem',
      color: '#172B4D',
      transition: 'all 0.2s',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230052CC' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 1rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.25rem'
    },
    input: {
      height: '48px',
      padding: '0 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '8px',
      background: 'white',
      fontSize: '0.95rem',
      color: '#172B4D',
      transition: 'all 0.2s'
    },
    textarea: {
      padding: '0.75rem 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '8px',
      background: 'white',
      fontSize: '0.95rem',
      color: '#172B4D',
      transition: 'all 0.2s',
      minHeight: '100px',
      resize: 'vertical'
    },
    applyButton: {
      background: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0 2rem',
      height: '48px',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)'
    },
    projectGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.75rem'
    },
    card: {
      background: 'white',
      border: '1px solid #E1E8ED',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    },
    cardImage: {
      width: '100%',
      height: '210px',
      objectFit: 'cover',
      background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)'
    },
    cardBody: {
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      flex: 1,
      position: 'relative'
    },
    statusBadge: {
      position: 'absolute',
      top: '-14px',
      right: '1.5rem',
      padding: '0.35rem 1rem',
      background: '#E8F5E9',
      color: '#2E7D32',
      fontSize: '0.75rem',
      fontWeight: '700',
      borderRadius: '4px',
      border: '2px solid white',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
    },
    volunteerBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 0.75rem',
      background: '#EBF5FF',
      color: '#0052CC',
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: '600',
      border: '1px solid #B3D4FF'
    },
    focusArea: {
      display: 'inline-block',
      color: '#0052CC',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.25rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      margin: '0 0 0.5rem 0',
      color: '#172B4D',
      letterSpacing: '-0.01em'
    },
    metaInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem 1rem',
      fontSize: '0.9rem',
      color: '#5E6C84',
      marginBottom: '1rem'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    resourcePill: {
      display: 'inline-flex',
      alignItems: 'center',
      background: '#F8F9FA',
      color: '#172B4D',
      padding: '0.35rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '500',
      margin: '0.25rem 0.4rem 0.25rem 0',
      border: '1px solid #E1E8ED'
    },
    exploreButton: {
      marginTop: 'auto',
      padding: '0.75rem',
      background: '#DEEBFF',
      color: '#0052CC',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED',
      color: '#172B4D',
      fontSize: '1rem',
      fontWeight: '500'
    },
    errorContainer: {
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
    // Modal Styles
    modalOverlay: {
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
      padding: '2rem 1rem'
    },
    modalContent: {
      background: 'white',
      width: '100%',
      maxWidth: '960px',
      maxHeight: '90vh',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      '@media (max-width: 768px)': {
        maxHeight: '95vh',
        borderRadius: '8px'
      }
    },
    modalHeader: {
      padding: '1.75rem 2rem',
      borderBottom: '2px solid #E1E8ED',
      position: 'sticky',
      top: 0,
      background: 'white',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalHeaderTitle: {
      margin: 0,
      color: '#172B4D',
      fontSize: '1.5rem',
      fontWeight: '600',
      letterSpacing: '-0.01em'
    },
    modalCloseButton: {
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
    modalBody: {
      padding: '2rem',
      overflowY: 'auto',
      '@media (max-width: 768px)': {
        padding: '1.25rem'
      }
    },
    modalGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '1.5rem'
      }
    },
    modalSidebar: {
      background: '#F8F9FA',
      borderRadius: '8px',
      padding: '1.5rem',
      border: '1px solid #E1E8ED'
    },
    modalSection: {
      marginBottom: '2rem'
    },
    modalSectionTitle: {
      margin: '0 0 1rem 0',
      color: '#172B4D',
      fontSize: '1rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #E1E8ED',
      paddingBottom: '0.5rem'
    },
    resourceItem: {
      background: 'white',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      border: '1px solid #E1E8ED',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    resourceName: {
      fontWeight: '600',
      color: '#172B4D'
    },
    resourceQuantity: {
      color: '#0052CC',
      fontWeight: '600'
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '1.5rem'
    },
    primaryButton: {
      width: '100%',
      padding: '1rem',
      background: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)'
    },
    secondaryButton: {
      width: '100%',
      padding: '1rem',
      background: '#DEEBFF',
      color: '#0052CC',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    volunteerButton: {
      width: '100%',
      padding: '1rem',
      background: '#E8F5E9',
      color: '#2E7D32',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    mapButton: {
      width: '100%',
      padding: '0.75rem',
      background: '#F8F9FA',
      color: '#172B4D',
      border: '1px solid #E1E8ED',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    mapContainer: {
      marginTop: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #E1E8ED'
    },
    mapPlaceholder: {
      background: '#F8F9FA',
      height: '200px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#5E6C84',
      border: '2px dashed #E1E8ED'
    },
    coordinates: {
      fontSize: '0.85rem',
      color: '#5E6C84',
      marginTop: '0.5rem',
      fontFamily: 'monospace'
    },
    // Volunteer Form Styles
    volunteerForm: {
      marginTop: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #E1E8ED'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontWeight: '600',
      color: '#172B4D',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #DFE1E6',
      borderRadius: '8px',
      fontSize: '0.95rem',
      transition: 'all 0.2s'
    },
    skillChip: {
      display: 'inline-block',
      padding: '0.35rem 0.75rem',
      background: '#F8F9FA',
      border: '1px solid #E1E8ED',
      borderRadius: '4px',
      fontSize: '0.85rem',
      margin: '0.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    skillChipSelected: {
      background: '#0052CC',
      color: 'white',
      borderColor: '#0052CC'
    },
    successMessage: {
      padding: '1rem',
      background: '#E8F5E9',
      color: '#2E7D32',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    errorMessage: {
      padding: '1rem',
      background: '#FFEBEE',
      color: '#C62828',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.95rem',
      fontWeight: '500'
    }
  };

  // Function to check project funding status
  const checkProjectFunding = async (projectId) => {
    if (!projectId) return;
    
    try {
      setCheckingFunding(true);
      const response = await axios.get(
        `/api/resources/project/${projectId}/status`
      );
      
      console.log("Funding status response:", response.data);
      
      // Calculate if all resources are fully funded
      const allFullyFunded = response.data.every(
        resource => resource.isFullyFunded || resource.remaining === 0 || resource.remainingNeeded === 0
      );
      
      // Calculate total remaining amount
      const totalRemaining = response.data.reduce(
        (sum, resource) => {
          const remaining = resource.remainingNeeded || resource.remaining || 0;
          return sum + remaining;
        }, 
        0
      );
      
      console.log("Total remaining:", totalRemaining);
      
      setProjectFundingStatus({
        isFullyFunded: allFullyFunded,
        totalRemaining,
        resources: response.data
      });
      
    } catch (error) {
      console.error("Error checking funding status:", error);
      // Fallback to project data
      if (selectedProject?.resources) {
        const totalNeeded = selectedProject.resources.reduce((sum, r) => sum + r.quantity, 0);
        setProjectFundingStatus({
          isFullyFunded: false,
          totalRemaining: totalNeeded,
          resources: []
        });
      }
    } finally {
      setCheckingFunding(false);
    }
  };

  // Check funding when selected project changes
  useEffect(() => {
    if (selectedProject?._id) {
      checkProjectFunding(selectedProject._id);
    }
  }, [selectedProject]);

  // Reset map state when switching projects
  useEffect(() => {
    setShowMap(false);
    // Destroy previous map instance when switching projects
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [selectedProject?._id]);

  // Also check funding when modal closes (after donation)
  const handleResourceFormClose = async () => {
    setShowResourceForm(false);
    // Refresh funding status
    if (selectedProject?._id) {
      await checkProjectFunding(selectedProject._id);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/projects/all?${query}`);
      setProjects(response.data.projects);
      setError('');
    } catch (err) { 
      setError('Failed to fetch data'); 
    } finally { 
      setLoading(false); 
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const handleProjectEvent = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchProjects();
      }, 250);
    };

    socket.on('project:updated', handleProjectEvent);
    return () => {
      clearTimeout(refreshTimer);
      socket.off('project:updated', handleProjectEvent);
    };
  }, [fetchProjects]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!showMap || !selectedProject?.coordinates || !mapRef.current) return;

    const [lng, lat] = selectedProject.coordinates.coordinates;

    try {
      // Initialize map - always create fresh map for each project to avoid conflicts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add marker for project location
      L.marker([lat, lng])
        .bindPopup(`<div style="font-weight: 600; color: #172B4D;">${selectedProject.title}</div><small>${selectedProject.location}</small>`)
        .addTo(mapInstanceRef.current)
        .openPopup();

      // Ensure map is properly sized
      const resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Add resize listener for responsive behavior
      const handleResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [showMap, selectedProject]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      case 'active': return { bg: '#EBF5FF', text: '#0052CC' };
      case 'draft': return { bg: '#F8F9FA', text: '#6C757D' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'cancelled': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#F8F9FA', text: '#495057' };
    }
  };

  // Handle volunteer application
  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setApplyingVolunteer(true);
    setVolunteerError('');
    setVolunteerSuccess('');

    try {
      const response = await axios.post(
        `/api/projects/${selectedProject._id}/volunteer`,
        {
          ...volunteerApplication,
          projectId: selectedProject._id,
          projectTitle: selectedProject.title
        }
      );

      setVolunteerSuccess('Application submitted successfully! The NGO will contact you soon.');
      setVolunteerApplication({
        name: '',
        email: '',
        phone: '',
        skills: [],
        availability: '',
        message: ''
      });
      
      // Close form after 3 seconds
      setTimeout(() => {
        setShowVolunteerForm(false);
        setVolunteerSuccess('');
      }, 3000);

    } catch (error) {
      setVolunteerError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplyingVolunteer(false);
    }
  };

  const handleVolunteerInputChange = (e) => {
    setVolunteerApplication({
      ...volunteerApplication,
      [e.target.name]: e.target.value
    });
  };

  const toggleSkill = (skill) => {
    setVolunteerApplication(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Get coordinates display
  const getCoordinatesDisplay = (project) => {
    if (project.coordinates && project.coordinates.coordinates) {
      const [lng, lat] = project.coordinates.coordinates;
      return `📍 ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
    }
    return null;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWidth}>
          <div style={styles.loadingContainer}>Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWidth}>
          <div style={styles.errorContainer}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.contentWidth}>
        {/* Filter Bar */}
        <div style={styles.filterCard}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Focus Area</label>
            <select 
              style={styles.select}
              value={filters.focusArea} 
              onChange={e => handleFilterChange('focusArea', e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            >
            <option value="">All Focus Areas</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Environment">Environment</option>
            <option value="Youth">Youth</option>
            <option value="Women Empowerment">Women Empowerment</option>
            <option value="Poverty Alleviation">Poverty Alleviation</option>
            <option value="Animal Welfare">Animal Welfare</option>
            <option value="Disaster Relief">Disaster Relief</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="Technology">Technology</option>
            </select>
          </div>
          
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Location</label>
            <input 
              style={styles.input}
              type="text" 
              placeholder="Enter city or region..." 
              value={filters.location} 
              onChange={e => handleFilterChange('location', e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>
          
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Skills</label>
            <input 
              style={styles.input}
              type="text" 
              placeholder="Filter by skills..." 
              value={filters.skills} 
              onChange={e => handleFilterChange('skills', e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#0052CC'}
              onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>
          
          <div style={{ ...styles.inputWrapper, flex: '0 0 auto', justifyContent: 'flex-end' }}>
            <button 
              style={styles.applyButton}
              onClick={fetchProjects}
              onMouseOver={(e) => e.target.style.background = '#0747A6'}
              onMouseOut={(e) => e.target.style.background = '#0052CC'}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div style={styles.loadingContainer}>No projects found matching your criteria</div>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map(project => {
              const statusColors = getStatusColor(project.status);
              const coordinates = getCoordinatesDisplay(project);
              
              return (
                <div 
                  key={project._id} 
                  style={styles.card}
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
                    <img 
                      src={resolveImageUrl(project.image)} 
                      style={styles.cardImage} 
                      alt={project.title}
                    />
                  ) : (
                    <div style={styles.cardImage} />
                  )}
                  
                  <div style={styles.cardBody}>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusColors.bg,
                      color: statusColors.text
                    }}>
                      {project.status}
                    </div>
                    
                    <span style={styles.focusArea}>{project.focusArea}</span>
                    <h3 style={styles.cardTitle}>{project.title}</h3>
                    
                    <div style={styles.metaInfo}>
                      <div style={styles.metaItem}>
                        <span>🏢</span>
                        <span>{project.organizationName}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span>📍</span>
                        <span>{project.location}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span>📅</span>
                        <span>Start: {formatDate(project.startDate)}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span>🛠️</span>
                        <span>{project.skills?.length || 0} skills needed</span>
                      </div>
                    </div>

                    {/* Volunteers Needed Section */}
                    {project.volunteersNeeded && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={styles.volunteerBadge}>
                          <span>👥</span>
                          <span>{project.volunteersNeeded} {project.volunteersNeeded === 1 ? 'Volunteer' : 'Volunteers'} Needed</span>
                        </div>
                      </div>
                    )}

                    {/* Coordinates Display */}
                    {coordinates && (
                      <div style={{ fontSize: '0.8rem', color: '#5E6C84', marginBottom: '0.5rem' }}>
                        {coordinates}
                      </div>
                    )}

                    {project.resources && project.resources.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#172B4D', marginBottom: '0.5rem' }}>
                          RESOURCES NEEDED:
                        </div>
                        {project.resources.slice(0, 2).map((res, i) => (
                          <span key={i} style={styles.resourcePill}>
                            📦 {res.name} ({res.quantity})
                          </span>
                        ))}
                        {project.resources.length > 2 && (
                          <span style={styles.resourcePill}>
                            +{project.resources.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <button 
                      style={styles.exploreButton}
                      onClick={() => setSelectedProject(project)}
                      onMouseOver={(e) => {
                        e.target.style.background = '#0052CC';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#DEEBFF';
                        e.target.style.color = '#0052CC';
                      }}
                    >
                      Explore Opportunities
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div style={styles.modalOverlay} onClick={() => {
          setSelectedProject(null);
          setShowVolunteerForm(false);
          setVolunteerSuccess('');
          setVolunteerError('');
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalHeaderTitle}>Project Details</h2>
              <button 
                style={styles.modalCloseButton}
                onClick={() => {
                  setSelectedProject(null);
                  setShowVolunteerForm(false);
                  setVolunteerSuccess('');
                  setVolunteerError('');
                }}
                onMouseOver={(e) => e.target.style.background = '#DFE1E6'}
                onMouseOut={(e) => e.target.style.background = '#F4F5F7'}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalGrid}>
                {/* Main Content */}
                <div>
                  <span style={styles.focusArea}>{selectedProject.focusArea}</span>
                  <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0 1rem 0', color: '#172B4D' }}>
                    {selectedProject.title}
                  </h1>
                  <p style={{ color: '#5E6C84', lineHeight: '1.8', fontSize: '1rem', marginBottom: '2rem' }}>
                    {selectedProject.description}
                  </p>
                  
                  <div style={styles.modalSection}>
                    <h3 style={styles.modalSectionTitle}>Required Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedProject.skills?.map(skill => (
                        <span key={skill} style={{ ...styles.resourcePill, background: '#DEEBFF', color: '#0052CC', border: '1px solid #B3D4FF' }}>
                          🛠️ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Volunteers Needed Detail */}
                  {selectedProject.volunteersNeeded && (
                    <div style={styles.modalSection}>
                      <h3 style={styles.modalSectionTitle}>Volunteers Needed</h3>
                      <div style={{
                        background: '#EBF5FF',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid #B3D4FF'
                      }}>
                        <span style={{ fontSize: '2rem' }}>👥</span>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0052CC' }}>
                            {selectedProject.volunteersNeeded}
                          </div>
                          <div style={{ color: '#5E6C84', fontSize: '0.9rem' }}>
                            {selectedProject.volunteersNeeded === 1 ? 'Volunteer position available' : 'Volunteer positions available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={styles.modalSection}>
                    <h3 style={styles.modalSectionTitle}>Material Needs</h3>
                    {selectedProject.resources && selectedProject.resources.length > 0 ? (
                      selectedProject.resources.map((res, i) => (
                        <div key={i} style={styles.resourceItem}>
                          <div>
                            <div style={styles.resourceName}>📦 {res.name}</div>
                            {res.description && (
                              <div style={{ fontSize: '0.85rem', color: '#5E6C84' }}>{res.description}</div>
                            )}
                          </div>
                          <div style={styles.resourceQuantity}>Qty: {res.quantity}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#5E6C84' }}>No resources specified</p>
                    )}
                  </div>

                  {/* Map View */}
                  {selectedProject.coordinates && (
                    <div style={styles.modalSection}>
                      <h3 style={styles.modalSectionTitle}>Project Location</h3>
                      <button 
                        style={styles.mapButton}
                        onClick={() => setShowMap(!showMap)}
                        onMouseOver={(e) => e.target.style.background = '#F1F3F5'}
                        onMouseOut={(e) => e.target.style.background = '#F8F9FA'}
                      >
                        <span>🗺️</span>
                        <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                      </button>
                      
                      {showMap && (
                        <div style={styles.mapContainer}>
                          <div 
                            ref={mapRef}
                            style={{
                              height: 'calc(min(400px, 50vh))',
                              borderRadius: '8px',
                              border: '1px solid #E1E8ED',
                              width: '100%'
                            }}
                            className="leaflet-height-responsive"
                          ></div>
                          <div style={styles.coordinates}>
                            {getCoordinatesDisplay(selectedProject)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div style={styles.modalSidebar}>
                  <h4 style={{ margin: '0 0 1.5rem 0', color: '#172B4D', fontWeight: 600 }}>Project Information</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: '0.25rem' }}>Organization</div>
                      <div style={{ color: '#5E6C84' }}>🏢 {selectedProject.organizationName}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: '0.25rem' }}>Timeline</div>
                      <div style={{ color: '#5E6C84' }}>
                        📅 {formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: '0.25rem' }}>Location</div>
                      <div style={{ color: '#5E6C84' }}>📍 {selectedProject.location}</div>
                      {getCoordinatesDisplay(selectedProject) && (
                        <div style={{ fontSize: '0.8rem', color: '#5E6C84', marginTop: '0.25rem' }}>
                          {getCoordinatesDisplay(selectedProject)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: '0.25rem' }}>Current Status</div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: getStatusColor(selectedProject.status).bg,
                        color: getStatusColor(selectedProject.status).text,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.buttonGroup}>
                    <button 
                      style={styles.primaryButton}
                      onClick={() => handleSubmitProposal(selectedProject)}
                      onMouseOver={(e) => e.target.style.background = '#0747A6'}
                      onMouseOut={(e) => e.target.style.background = '#0052CC'}
                    >
                      Submit Proposal
                    </button>
                    
                    <button 
                      style={styles.secondaryButton}
                      onClick={() => handleFundProject(selectedProject)}
                      onMouseOver={(e) => {
                        e.target.style.background = '#0052CC';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#DEEBFF';
                        e.target.style.color = '#0052CC';
                      }}
                    >
                      Fund Project
                    </button>
                    
                    {selectedProject.resources && selectedProject.resources.length > 0 && (
                      <div style={{ width: '100%', marginTop: '10px' }}>
                        {checkingFunding ? (
                          <div style={{
                            display: 'flex',alignItems: 'center',justifyContent: 'center',gap: '10px',padding: '12px',background: '#F3F4F6',borderRadius: '12px',color: '#6B7280'
                          }}>
                            <span style={{
                              width: '16px',height: '16px',border: '2px solid #E5E7EB',borderTopColor: '#2E7D32',borderRadius: '50%',animation: 'spin 1s linear infinite'
                            }}></span>
                            Checking availability...
                          </div>
                        ) : (
                          <button 
                            style={{
                              width: '100%',padding: '12px 20px', border: 'none',borderRadius: '14px', fontWeight: '600',fontSize: '0.95rem',
                              cursor: projectFundingStatus?.isFullyFunded ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',display: 'flex',
                              alignItems: 'center',justifyContent: 'space-between',minHeight: '52px',
                              background: projectFundingStatus?.isFullyFunded ? '#F3F4F6' : '#E8F5E9',
                              color: projectFundingStatus?.isFullyFunded ? '#9CA3AF' : '#2E7D32',
                              opacity: projectFundingStatus?.isFullyFunded ? 0.8 : 1
                            }}
                            onClick={() => {
                              if (!projectFundingStatus?.isFullyFunded) {
                                setShowResourceForm(true);
                              }
                            }}
                            disabled={projectFundingStatus?.isFullyFunded}
                            onMouseEnter={(e) => {
                              if (!projectFundingStatus?.isFullyFunded) {
                                e.currentTarget.style.background = '#2E7D32';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(46, 125, 50, 0.3)';
                                
                                const badge = e.currentTarget.querySelector('.remaining-badge');
                                if (badge) {
                                  badge.style.background = 'rgba(255, 255, 255, 0.25)';
                                  badge.style.color = 'white';
                                  badge.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                }
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!projectFundingStatus?.isFullyFunded) {
                                e.currentTarget.style.background = '#E8F5E9';
                                e.currentTarget.style.color = '#2E7D32';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                
                                const badge = e.currentTarget.querySelector('.remaining-badge');
                                if (badge) {
                                  badge.style.background = 'rgba(46, 125, 50, 0.15)';
                                  badge.style.color = '#2E7D32';
                                  badge.style.borderColor = 'rgba(46, 125, 50, 0.2)';
                                }
                              }
                            }}
                          >
                            <span style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px'
                            }}>
                              <span style={{ fontSize: '1.3rem' }}>🤝</span>
                              <span style={{ fontWeight: '600' }}>Provide Resources</span>
                            </span>
                            
                            {projectFundingStatus && !projectFundingStatus.isFullyFunded && (
                              <span 
                                className="remaining-badge"
                                style={{
                                  background: 'rgba(46, 125, 50, 0.15)', padding: '6px 14px',borderRadius: '30px', fontSize: '0.85rem',fontWeight: '600',
                                  transition: 'all 0.2s ease', display: 'flex',alignItems: 'center',gap: '6px', border: '1px solid rgba(46, 125, 50, 0.2)'
                                }}
                              >
                                <span style={{ fontSize: '0.9rem' }}>📦</span>
                                <span>{projectFundingStatus.totalRemaining} {projectFundingStatus.totalRemaining === 1 ? 'unit' : 'units'} needed</span>
                              </span>
                            )}
                            
                            {projectFundingStatus?.isFullyFunded && (
                              <span 
                                style={{
                                  background: 'rgba(156, 163, 175, 0.15)', padding: '6px 14px', borderRadius: '30px',fontSize: '0.85rem',fontWeight: '600',display: 'flex',
                                  alignItems: 'center', gap: '6px',border: '1px solid rgba(156, 163, 175, 0.2)', color: '#6B7280'
                                }}
                              >
                                <span style={{ fontSize: '0.9rem' }}>✅</span>
                                <span>Fully Funded</span>
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Resource Form Modal */}
                    {showResourceForm && (
                      <ResourceForm 
                        project={selectedProject} 
                        onClose={handleResourceFormClose}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Responsive Leaflet Map */
          .leaflet-container {
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .leaflet-popup-content {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.4;
          }

          /* Tablet and below */
          @media (max-width: 1024px) {
            .leaflet-container {
              height: 350px;
            }
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .leaflet-container {
              height: 280px !important;
            }

            .leaflet-control-attribution {
              font-size: 0.7rem;
              padding: 2px 4px;
            }

            .leaflet-popup-content-wrapper {
              font-size: 0.85rem;
              padding: 8px;
              border-radius: 6px;
            }

            .leaflet-popup-content {
              margin: 4px;
            }

            .leaflet-control-zoom {
              border-radius: 6px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }

            .leaflet-control-zoom-in,
            .leaflet-control-zoom-out {
              font-size: 1.2rem;
              line-height: 1.8;
              width: 36px;
              height: 36px;
            }

            /* Modal adjustments for mobile */
            div[style*="maxHeight: 90vh"] {
              max-height: 95vh !important;
            }
          }

          @media (max-width: 640px) {
            .leaflet-container {
              height: 240px !important;
            }

            .leaflet-popup-content-wrapper {
              font-size: 0.8rem;
              margin-top: -10px;
            }

            .leaflet-popup {
              margin-bottom: 20px;
            }

            .leaflet-control-zoom {
              margin: 6px !important;
            }

            .leaflet-control-zoom-in,
            .leaflet-control-zoom-out {
              width: 32px;
              height: 32px;
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
            .leaflet-container {
              height: 200px !important;
            }

            .leaflet-popup-content-wrapper {
              font-size: 0.75rem;
            }

            .leaflet-control-zoom {
              margin: 4px !important;
            }

            .leaflet-control-zoom-in,
            .leaflet-control-zoom-out {
              width: 30px;
              height: 30px;
              font-size: 0.9rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AllProjects;