import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const ResourceForm = ({ project, onClose }) => {
  const { user } = useAuth();
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [resourceStatus, setResourceStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Use resources directly from the project prop
  const resources = project?.resources || [];

  // Add axios interceptor to include token in all requests
  useEffect(() => {
    // Get token from localStorage (check for both possible keys)
    const token = localStorage.getItem('crosslink_token') || localStorage.getItem('token');
    
    // Add request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Fetch current resource status from backend
  useEffect(() => {
    if (project?._id) {
      fetchResourceStatus();
    }
  }, [project]);

  const fetchResourceStatus = async () => {
    try {
      setLoadingStatus(true);
      
      // Get token
      const token = localStorage.getItem('crosslink_token') || localStorage.getItem('token');
      
      const response = await axios.get(
        `/api/resources/project/${project._id}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}` // Explicitly add token
          }
        }
      );
      
      console.log("Resource status response:", response.data);
      
      // Handle the response data - create a map by resource name
      const statusMap = {};
      
      if (Array.isArray(response.data)) {
        response.data.forEach(item => {
          statusMap[item.name] = {
            name: item.name,
            originalNeed: item.originalNeed || item.needed || 0,
            totalDonated: item.totalDonated || 0,
            remainingNeeded: item.remainingNeeded || item.remaining || 0,
            isFullyFunded: item.isFullyFunded || item.remainingNeeded === 0 || item.remaining === 0,
            donations: item.donations || []
          };
        });
      }
      
      setResourceStatus(statusMap);
    } catch (error) {
      console.log("Error fetching status, using project data as fallback");
      // Create status object from project data
      const initialStatus = {};
      resources.forEach(res => {
        initialStatus[res.name] = {
          name: res.name,
          originalNeed: res.quantity,
          totalDonated: 0,
          remainingNeeded: res.quantity,
          isFullyFunded: false,
          donations: []
        };
      });
      setResourceStatus(initialStatus);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Get current status for a resource
  const getResourceStatus = (resourceName) => {
    const status = resourceStatus[resourceName];
    if (status) {
      return {
        originalNeed: status.originalNeed,
        totalDonated: status.totalDonated,
        remaining: status.remainingNeeded,
        isFullyFunded: status.isFullyFunded || status.remainingNeeded === 0,
        donations: status.donations || []
      };
    }
    
    // Fallback to project data
    const projectRes = resources.find(r => r.name === resourceName);
    return {
      originalNeed: projectRes?.quantity || 0,
      totalDonated: 0,
      remaining: projectRes?.quantity || 0,
      isFullyFunded: false,
      donations: []
    };
  };

  const handleChange = (index, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    // Check if user is corporate
    if (!user || user.userType !== 'corporate') {
      toast.error('Only corporate users can donate resources. Please login as a corporate partner.');
      return;
    }

    // Get token
    const token = localStorage.getItem('crosslink_token') || localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login again. Session token not found.');
      return;
    }

    try {
      setLoading(true);
      
      // Filter resources that have quantities entered
      const donationsToSubmit = resources
        .map((res, index) => {
          const status = getResourceStatus(res.name);
          return {
            ...res,
            donationQuantity: Number(formValues[index]?.totalQuantity) || 0,
            description: formValues[index]?.description || "",
            index,
            remainingQuantity: status.remaining
          };
        })
        .filter(item => item.donationQuantity > 0);

      if (donationsToSubmit.length === 0) {
        toast.error("Please enter at least one quantity to donate");
        setLoading(false);
        return;
      }

      // Validate quantities
      for (let item of donationsToSubmit) {
        if (item.donationQuantity > item.remainingQuantity) {
          toast.error(`Cannot donate more than available quantity for ${item.name}. Available: ${item.remainingQuantity}`);
          setLoading(false);
          return;
        }
      }

      // Submit each donation with token in headers
      const donationPromises = donationsToSubmit.map(item => {
        const requestBody = {
          name: item.name.trim(),
          quantity: item.donationQuantity,
          description: item.description || "",
          corporateId: user._id
        };
        
        return axios.post(
          `/api/resources/${project._id}/donate`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // ADD TOKEN HERE
            }
          }
        );
      });

      const results = await Promise.all(donationPromises);
      
      // Refresh resource status to get updated donations
      await fetchResourceStatus();
      
      // Show success toast with donation summary
      const totalDonated = donationsToSubmit.reduce((sum, item) => sum + item.donationQuantity, 0);
      toast.success(
        <div>
          <strong>🎉 Donation Successful!</strong>
          <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
            Total donated: {totalDonated} units
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Resources: {donationsToSubmit.map(d => d.name).join(', ')}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'white' }}>
            📧 Confirmation email sent to your registered email address
          </div>
        </div>,
        { duration: 5000 }
      );
      
      // Clear form inputs
      setFormValues({});
      
      // Close the modal after successful submission
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Donation failed", error);
      
      // Better error handling for 401
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to submit donation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total donation amount
  const calculateTotalDonation = () => {
    let total = 0;
    Object.values(formValues).forEach(value => {
      if (value?.totalQuantity) {
        total += Number(value.totalQuantity);
      }
    });
    return total;
  };

  // Check if all resources are fully funded
  const allFullyFunded = () => {
    return resources.every(res => {
      const status = getResourceStatus(res.name);
      return status.isFullyFunded || status.remaining === 0;
    });
  };

  // Modal styles (keeping your existing styles)
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: 'modalSlideIn 0.3s ease-out'
    },
    header: {
      padding: '24px 30px',
      borderBottom: '1px solid #eef2f6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 10,
      borderRadius: '20px 20px 0 0'
    },
    title: {
      fontSize: '1.6rem',
      fontWeight: '700',
      color: '#1a2b3c',
      margin: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    closeButton: {
      background: '#f1f5f9',
      border: 'none',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      cursor: 'pointer',
      color: '#475569',
      fontSize: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    content: {
      padding: '30px'
    },
    corporateCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '30px',
      color: 'white',
      boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.5)'
    },
    corporateHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '15px'
    },
    corporateAvatar: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '600',
      border: '3px solid white'
    },
    corporateInfo: {
      flex: 1
    },
    corporateName: {
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '4px'
    },
    corporateType: {
      fontSize: '1rem',
      opacity: 0.9,
      marginBottom: '4px'
    },
    corporateEmail: {
      fontSize: '0.9rem',
      opacity: 0.8
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '30px',
      fontSize: '0.85rem',
      backdropFilter: 'blur(10px)'
    },
    projectSummary: {
      backgroundColor: '#f8fafd',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '30px',
      border: '1px solid #e9eef3'
    },
    projectTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '15px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      marginBottom: '20px'
    },
    statItem: {
      textAlign: 'center',
      padding: '10px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    statValue: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '0.8rem',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    resourceCard: {
      backgroundColor: 'white',
      border: '1px solid #e9eef3',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden'
    },
    resourceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    resourceName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    resourceStats: {
      display: 'flex',
      gap: '15px',
      fontSize: '0.95rem',
      flexWrap: 'wrap'
    },
    progressContainer: {
      width: '100%',
      height: '10px',
      backgroundColor: '#e9eef3',
      borderRadius: '10px',
      marginBottom: '15px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '10px',
      transition: 'width 0.3s ease'
    },
    progressBarCompleted: {
      height: '100%',
      background: '#10b981',
      borderRadius: '10px',
      transition: 'width 0.3s ease'
    },
    donationHistory: {
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '15px',
      fontSize: '0.9rem',
      border: '1px solid #e2e8f0'
    },
    donationItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      borderBottom: '1px dashed #e2e8f0'
    },
    inputRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '15px',
      marginTop: '15px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e9eef3',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      outline: 'none'
    },
    disabledInput: {
      backgroundColor: '#f1f5f9',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    remainingBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: '#e6f7e6',
      color: '#2e7d32',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginLeft: '10px'
    },
    fullyFundedBadge: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: '#10b981',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '30px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    actionBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '30px',
      padding: '20px 0 0',
      borderTop: '2px solid #eef2f6'
    },
    totalBadge: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    totalAmount: {
      color: '#667eea',
      fontSize: '1.5rem',
      marginLeft: '10px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '14px 32px',
      borderRadius: '40px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 15px -5px #667eea'
    },
    cancelButton: {
      backgroundColor: 'white',
      color: '#64748b',
      border: '2px solid #e9eef3',
      padding: '14px 32px',
      borderRadius: '40px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    disabledButton: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
      opacity: 0.6,
      background: '#94a3b8'
    }
  };

  // Add animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!project) return null;

  // Calculate totals
  const totalResources = resources.length;
  const totalNeeded = resources.reduce((sum, res) => sum + res.quantity, 0);
  const totalDonated = Object.values(resourceStatus).reduce((sum, status) => sum + (status.totalDonated || 0), 0);
  const currentDonationTotal = calculateTotalDonation();

  return (
    <div style={modalStyles.overlay} onClick={handleOverlayClick}>
      <div style={modalStyles.modal}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {allFullyFunded() ? '🎉 Project Fully Funded!' : '🤝 Make a Difference'}
          </h2>
          <button 
            onClick={onClose}
            style={modalStyles.closeButton}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={modalStyles.content}>
          {/* Corporate Info */}
          {user && (
            <div style={modalStyles.corporateCard}>
              <div style={modalStyles.corporateHeader}>
                <div style={modalStyles.corporateAvatar}>
                  {user.companyName?.[0] || user.name?.[0] || 'C'}
                </div>
                <div style={modalStyles.corporateInfo}>
                  <div style={modalStyles.corporateName}>
                    {user.companyName || user.name}
                  </div>
                  <div style={modalStyles.corporateType}>
                    {user.userType === 'corporate' ? '🏢 Corporate Partner' : '👤 User'}
                  </div>
                  <div style={modalStyles.corporateEmail}>{user.email}</div>
                </div>
              </div>
              {user.userType !== 'corporate' && (
                <div style={modalStyles.badge}>
                  ⚠️ Note: Only corporate accounts can submit donations
                </div>
              )}
            </div>
          )}

          {/* Project Summary */}
          <div style={modalStyles.projectSummary}>
            <div style={modalStyles.projectTitle}>📋 {project.title}</div>
            <div style={modalStyles.statsGrid}>
              <div style={modalStyles.statItem}>
                <div style={modalStyles.statValue}>{totalResources}</div>
                <div style={modalStyles.statLabel}>Resources</div>
              </div>
              <div style={modalStyles.statItem}>
                <div style={modalStyles.statValue}>{totalNeeded}</div>
                <div style={modalStyles.statLabel}>Total Needed</div>
              </div>
              <div style={modalStyles.statItem}>
                <div style={modalStyles.statValue}>{totalDonated}</div>
                <div style={modalStyles.statLabel}>Donated</div>
              </div>
            </div>
          </div>

          {loadingStatus ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={modalStyles.loadingSpinner}></div>
              <p style={{ marginTop: '15px', color: '#64748b' }}>Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 30px', color: '#94a3b8' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>🎯</span>
              <p style={{ fontSize: '1.1rem' }}>No resources needed for this project yet</p>
            </div>
          ) : (
            <>
              {/* Resource Cards */}
              {resources.map((res, index) => {
                const status = getResourceStatus(res.name);
                const progress = ((status.originalNeed - status.remaining) / status.originalNeed) * 100;
                const fullyFunded = status.isFullyFunded || status.remaining === 0;

                return (
                  <div
                    key={index}
                    style={{
                      ...modalStyles.resourceCard,
                      opacity: fullyFunded ? 0.8 : 1,
                      backgroundColor: fullyFunded ? '#f0fdf4' : 'white',
                      borderColor: fullyFunded ? '#86efac' : '#e9eef3'
                    }}
                  >
                    {fullyFunded && (
                      <div style={modalStyles.fullyFundedBadge}>
                        ✅ Fully Funded
                      </div>
                    )}

                    <div style={modalStyles.resourceHeader}>
                      <span style={modalStyles.resourceName}>{res.name}</span>
                      <div style={modalStyles.resourceStats}>
                        <span>📊 Needed: <strong>{status.originalNeed}</strong></span>
                        <span>💝 Donated: <strong>{status.totalDonated}</strong></span>
                        <span>
                          💝 Remaining: 
                          <strong style={{ 
                            color: !fullyFunded ? '#10b981' : '#ef4444',
                            marginLeft: '5px'
                          }}>
                            {fullyFunded ? 0 : status.remaining}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={modalStyles.progressContainer}>
                      <div 
                        style={{
                          ...(fullyFunded ? modalStyles.progressBarCompleted : modalStyles.progressBar),
                          width: `${progress}%`
                        }}
                      />
                    </div>

                    {/* Donation History */}
                    {status.donations && status.donations.length > 0 && (
                      <div style={modalStyles.donationHistory}>
                        <strong style={{ display: 'block', marginBottom: '8px' }}>📜 Donation History:</strong>
                        {status.donations.map((donation, idx) => (
                          <div key={idx} style={modalStyles.donationItem}>
                            <span>Donation {idx + 1}:</span>
                            <span>
                              <strong>{donation.quantity}</strong> units 
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input Fields - Only show if not fully funded */}
                    {!fullyFunded && (
                      <div style={modalStyles.inputRow}>
                        <input
                          type="number"
                          min={1}
                          max={status.remaining}
                          value={formValues[index]?.totalQuantity || ""}
                          onChange={e =>
                            handleChange(
                              index,
                              "totalQuantity",
                              Number(e.target.value)
                            )
                          }
                          style={modalStyles.input}
                          placeholder={`Qty (max ${status.remaining})`}
                          disabled={loading || user?.userType !== 'corporate'}
                        />
                        <input
                          type="text"
                          value={formValues[index]?.description || ""}
                          onChange={e =>
                            handleChange(index, "description", e.target.value)
                          }
                          style={modalStyles.input}
                          placeholder="Add notes (optional)"
                          disabled={loading || user?.userType !== 'corporate'}
                        />
                      </div>
                    )}

                    {/* Fully Funded Message */}
                    {fullyFunded && (
                      <div style={{ 
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '8px',
                        color: '#166534',
                        textAlign: 'center'
                      }}>
                        ✓ This resource has been fully funded! Thank you for your support.
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Bar - Only show if not all fully funded */}
              {!allFullyFunded() && (
                <div style={modalStyles.actionBar}>
                  <div style={modalStyles.totalBadge}>
                    Your Donation: 
                    <span style={modalStyles.totalAmount}>
                      {currentDonationTotal} units
                    </span>
                  </div>
                  <div style={modalStyles.buttonGroup}>
                    <button
                      onClick={onClose}
                      style={modalStyles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || user?.userType !== 'corporate' || currentDonationTotal === 0}
                      style={{
                        ...modalStyles.submitButton,
                        ...(loading || user?.userType !== 'corporate' || currentDonationTotal === 0 ? modalStyles.disabledButton : {}),
                      }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={modalStyles.loadingSpinner}></span>
                          Submitting...
                        </span>
                      ) : (
                        '💝 Complete Donation'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* All funded message */}
              {allFullyFunded() && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  color: '#166534',
                  marginTop: '20px',
                  border: '2px solid #86efac'
                }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🎉</span>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>All Resources Fully Funded!</h3>
                  <p style={{ fontSize: '1.1rem' }}>This project has received all the resources it needs.</p>
                  <p style={{ marginTop: '15px' }}>Thank you to all the corporate partners who made this possible! 🙏</p>
                </div>
              )}

              {/* User type warning */}
              {user?.userType !== 'corporate' && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeeba',
                  borderRadius: '12px',
                  color: '#856404',
                  textAlign: 'center'
                }}>
                  ⚠️ Please login with a corporate account to make donations
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceForm;