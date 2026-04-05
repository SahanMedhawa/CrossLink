import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const ImpactReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const res = await axios.get('/api/corporate/reports/impact', config);
      
      // Ensure data structure is correct
      if (res.data && res.data.data) {
        setReportData(res.data.data);
      } else {
        console.error("Invalid API response structure:", res.data);
        alert("Failed to load report data structure.");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text("CrossLink CSR Impact Report", 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      // ✅ SAFETY CHECK: Ensure reportData and transactions exist
      if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
        doc.text("No transaction data available for this report.", 14, 40);
        doc.save('CSR_Report_Empty.pdf');
        return;
      }

      const { metrics, transactions } = reportData;

      // Metrics
      doc.text(`Total Investment: LKR ${metrics.totalInvestment.toLocaleString()}`, 14, 40);
      doc.text(`Projects Supported: ${metrics.projectsSupported}`, 14, 48);
      doc.text(`Success Rate: ${metrics.successRate}%`, 14, 56);

      // Table Data Preparation with Safety Checks
      const tableBody = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type || 'N/A',
        (t.title || 'Unknown Project').length > 25 ? (t.title || '').substring(0, 25) + '...' : (t.title || 'Unknown'),
        `LKR ${(t.amount || 0).toLocaleString()}`,
        t.status || 'Pending'
      ]);

      // Generate Table
      autoTable(doc, {
        head: [['Date', 'Type', 'Project', 'Amount', 'Status']],
        body: tableBody,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.save('CSR_Impact_Report.pdf');
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Report...</div>;
  if (!reportData) return <div className="p-10 text-center">No Data Available</div>;

  // Chart Data Prep with Safety
  const statusCounts = (reportData.transactions || []).reduce((acc, curr) => {
    const status = curr.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  return (
    <DashboardLayout userType="corporate">
      <div className="p-8 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Impact Reports</h2>
            <p className="text-blue-100 mt-2 font-medium">Analyze your CSR contributions and social impact.</p>
          </div>
          <button 
            onClick={downloadPDF}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition shadow-md"
          >
            📄 Download PDF Report
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">LKR {((reportData.metrics?.totalInvestment || 0) / 1000).toFixed(1)}k</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Projects Supported</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.metrics?.projectsSupported || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.metrics?.successRate || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Proposals Sent</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.metrics?.totalProposalsSent || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Activity Volume</h3>
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={(reportData.transactions || []).slice(0, 5)}>
                 <XAxis dataKey="type" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="amount" fill="#3b82f6" />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(reportData.transactions || []).map((t, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{t.type}</span></td>
                  <td className="px-6 py-4 font-medium">{t.title}</td>
                  <td className="px-6 py-4 font-bold">LKR {t.amount.toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${t.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ImpactReports;