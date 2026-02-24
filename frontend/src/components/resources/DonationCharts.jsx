import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  prepareTrendData, 
  prepareResourceData, 
  prepareDonorData,
  lineChartOptions,
  pieChartOptions,
  donorChartOptions 
} from '../../pages/resource/utils/chartHelpers';

const DonationCharts = ({ donations }) => {
  const trendChartRef = useRef(null);
  const resourceChartRef = useRef(null);
  const donorChartRef = useRef(null);
  
  const trendChartInstance = useRef(null);
  const resourceChartInstance = useRef(null);
  const donorChartInstance = useRef(null);

  useEffect(() => {
    if (!donations.length) return;

    // Clean up existing charts
    if (trendChartInstance.current) trendChartInstance.current.destroy();
    if (resourceChartInstance.current) resourceChartInstance.current.destroy();
    if (donorChartInstance.current) donorChartInstance.current.destroy();

    // Create trend chart
    if (trendChartRef.current) {
      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: prepareTrendData(donations),
        options: lineChartOptions
      });
    }

    // Create resource distribution pie chart
    if (resourceChartRef.current) {
      resourceChartInstance.current = new Chart(resourceChartRef.current, {
        type: 'pie',
        data: prepareResourceData(donations),
        options: pieChartOptions
      });
    }

    // Create donor contribution bar chart
    if (donorChartRef.current) {
      donorChartInstance.current = new Chart(donorChartRef.current, {
        type: 'bar',
        data: prepareDonorData(donations),
        options: donorChartOptions
      });
    }

    return () => {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (resourceChartInstance.current) resourceChartInstance.current.destroy();
      if (donorChartInstance.current) donorChartInstance.current.destroy();
    };
  }, [donations]);

  if (!donations.length) {
    return (
      <div style={styles.emptyState}>
        <p>No donation data available for charts</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Donation Analytics</h3>
      
      <div style={styles.chartsGrid}>
        {/* Trend Chart */}
        <div style={styles.chartCard}>
          <canvas ref={trendChartRef} style={styles.canvas} />
        </div>
        
        {/* Resource Distribution Chart */}
        <div style={styles.chartCard}>
          <canvas ref={resourceChartRef} style={styles.canvas} />
        </div>
        
        {/* Donor Contribution Chart */}
        <div style={styles.chartCard}>
          <canvas ref={donorChartRef} style={styles.canvas} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '2rem 0',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  title: {
    fontSize: '1.3rem',
    color: '#1e293b',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e2e8f0'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  chartCard: {
    background: '#ffffff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    minHeight: '300px'
  },
  canvas: {
    width: '100%',
    height: '300px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '12px',
    color: '#64748b',
    fontSize: '1rem'
  }
};

export default DonationCharts;