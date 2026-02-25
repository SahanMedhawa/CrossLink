// Prepare data for donation trend chart
export const prepareTrendData = (donations) => {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailyTotals = last7Days.map(date => {
    return donations
      .filter(d => new Date(d.donatedAt).toISOString().split('T')[0] === date)
      .reduce((sum, d) => sum + d.quantity, 0);
  });

  return {
    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [{
      label: 'Donations Received',
      data: dailyTotals,
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };
};

// Prepare data for resource distribution pie chart
export const prepareResourceData = (donations) => {
  const resourceMap = new Map();
  donations.forEach(d => {
    resourceMap.set(d.resourceName, (resourceMap.get(d.resourceName) || 0) + d.quantity);
  });

  return {
    labels: Array.from(resourceMap.keys()),
    datasets: [{
      data: Array.from(resourceMap.values()),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC44C', '#E7E9ED', '#F7464A', '#949FB1'
      ]
    }]
  };
};

// Prepare data for donor contribution chart
export const prepareDonorData = (donations) => {
  const donorMap = new Map();
  donations.forEach(d => {
    const donorId = d.corporateId?._id || d.corporateId;
    const donorName = d.corporateId?.companyName || 
                     d.corporateId?.name || 
                     `Donor ${donorId?.toString().slice(-4)}`;
    donorMap.set(donorName, (donorMap.get(donorName) || 0) + d.quantity);
  });

  // Get top 5 donors
  const sortedDonors = Array.from(donorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: sortedDonors.map(([name]) => name),
    datasets: [{
      data: sortedDonors.map(([_, total]) => total),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ]
    }]
  };
};

// Chart options
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#334155',
        font: { size: 12 }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1'
    }
  }
};

export const lineChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Donation Trends - Last 7 Days',
      color: '#1e293b',
      font: { size: 16, weight: 'bold' }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#e2e8f0' }
    }
  }
};

export const pieChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Resource Distribution',
      color: '#1e293b',
      font: { size: 16, weight: 'bold' }
    }
  }
};

export const donorChartOptions = {
  ...chartOptions,
  indexAxis: 'y',
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Top Corporate Donors',
      color: '#1e293b',
      font: { size: 16, weight: 'bold' }
    }
  }
};