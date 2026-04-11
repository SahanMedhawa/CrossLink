import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NGOCard from '../../components/ngo/ngo_card';
import Footer from '../../components/Footer';
import Header from '../../components/user/Navbar';


const NGOList = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNGOs, setTotalNGOs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNGOs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/ngos?page=${page}&limit=9`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setNgos(data.data);
          setTotalPages(data.totalPages);
          setTotalNGOs(data.total || data.data.length);
        }
      } catch (error) {
        console.error('Error fetching NGOs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNGOs();
  }, [page]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#F8FAFD',
    },
    pageHeader: {
      background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
      padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem)',
      boxShadow: '0 2px 8px rgba(0, 82, 204, 0.15)',
    },
    headerContent: {
      maxWidth: '1600px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem',
    },
    titleSection: {
      flex: 1,
      minWidth: '250px',
    },
    h1: {
      color: '#FFFFFF',
      fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
      fontWeight: '600',
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
      margin: 0,
      fontWeight: '400',
    },
    backButton: {
      padding: '0.75rem 1.75rem',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    mainContent: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 1.5rem)',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem)',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED',
    },
    loadingText: {
      color: '#172B4D',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: '500',
    },
    noNGOsContainer: {
      textAlign: 'center',
      padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem)',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED',
    },
    noNGOsTitle: {
      fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
      fontWeight: '600',
      color: '#172B4D',
      marginBottom: '0.75rem',
    },
    noNGOsText: {
      color: '#5E6C84',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      margin: '0.5rem 0',
    },
    statsBar: {
      background: 'white',
      padding: 'clamp(0.75rem, 3vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)',
      borderRadius: '8px',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E1E8ED',
    },
    projectCount: {
      color: '#172B4D',
      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
      fontWeight: '600',
      margin: 0,
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
      gap: 'clamp(1rem, 3vw, 1.5rem)',
      marginBottom: '2rem',
    },
    card: {
      background: 'white',
      border: '1px solid #E1E8ED',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      height: '100%',
      minHeight: '280px',
      display: 'flex',
      flexDirection: 'column',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'clamp(0.25rem, 1vw, 0.5rem)',
      marginTop: '3rem',
      padding: '1rem',
      flexWrap: 'wrap',
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
      minWidth: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paginationButtonActive: {
      background: '#0052CC',
      color: 'white',
      borderColor: '#0052CC',
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    nextButton: {
      padding: '0.625rem 1rem',
      background: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)',
      whiteSpace: 'nowrap',
    },
    previousButton: {
      padding: '0.625rem 1rem',
      border: '1px solid #E1E8ED',
      background: 'white',
      color: '#172B4D',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      whiteSpace: 'nowrap',
    },
    filterSection: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    filterSelect: {
      padding: '0.625rem 2rem 0.625rem 1rem',
      border: '1px solid #E1E8ED',
      borderRadius: '6px',
      fontSize: '0.9rem',
      background: 'white',
      color: '#172B4D',
      minWidth: '200px',
    },
  };


  return (
    <div style={styles.container}>
    <Header />
      {/* Hero Section */}
      <div style={styles.pageHeader}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.h1}>Registered NGOs</h1>
            <p style={styles.subtitle}>
              Verified organizations driving social impact • {totalNGOs} organizations
            </p>
          </div>

          {/* Back Button */}
        </div>
      </div>

      {/* Content Section */}
      <div style={styles.mainContent}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingText}>Loading organizations...</div>
          </div>
        ) : ngos.length === 0 ? (
          <div style={styles.noNGOsContainer}>
            <div style={styles.noNGOsTitle}>No NGOs found</div>
            <p style={styles.noNGOsText}>There are no registered NGOs at the moment.</p>
            <p style={styles.noNGOsText}>Please check back later.</p>
          </div>
        ) : (
          <>
            <div style={styles.statsBar}>
              <p style={styles.projectCount}>
                Showing {(page - 1) * 9 + 1}-{Math.min(page * 9, ngos.length)} of {totalNGOs} organizations
              </p>
              <div>
                <span style={{ color: '#5E6C84', fontSize: '0.8rem' }}>
                  {ngos.filter(ngo => ngo.isVerified).length} verified
                </span>
              </div>
            </div>

            <div style={styles.gridContainer}>
              {ngos.map((ngo) => (
                <div key={ngo._id} style={styles.card}>
                  <NGOCard ngo={ngo} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  style={{
                    ...styles.previousButton,
                    ...(page === 1 ? styles.paginationButtonDisabled : {}),
                  }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (page <= 3) {
                      pageNumber = index + 1;
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = page - 2 + index;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        style={{
                          ...styles.paginationButton,
                          ...(page === pageNumber ? styles.paginationButtonActive : {}),
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  style={{
                    ...styles.nextButton,
                    ...(page === totalPages ? styles.paginationButtonDisabled : {}),
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NGOList;