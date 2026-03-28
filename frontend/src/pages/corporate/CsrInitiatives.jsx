import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

// NEWS API KEY FROM newsapi.org
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const CsrInitiatives = () => {
  const [stats, setStats] = useState({
    totalProposals: 0,
    acceptedCount: 0,
    totalFundingRecords: 0,
    totalValue: 0,
    recentActivities: []
  });
  
  const [news, setNews] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetchCsrStats();
    fetchNews();
  }, []);

  const fetchCsrStats = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      const [propRes, fundRes] = await Promise.all([
        axios.get('http://localhost:5000/api/proposals/my', config),
        axios.get('http://localhost:5000/api/funding/my', config)
      ]);

      const proposals = propRes.data.data || [];
      const funding = fundRes.data.data || [];

      const totalVal = proposals.reduce((sum, p) => sum + (p.amount || 0), 0) + 
                       funding.reduce((sum, f) => sum + (f.amount || 0), 0);
      
      const accepted = proposals.filter(p => p.status === 'Accepted').length;

      const recent = [
        ...proposals.slice(0, 2).map(p => ({ type: 'Proposal', title: p.proposalTitle, amount: p.amount, status: p.status })),
        ...funding.slice(0, 2).map(f => ({ type: 'Funding', title: `Funded: ${f.projectId?.title || 'Project'}`, amount: f.amount, status: 'Completed' }))
      ].sort((a, b) => b.amount - a.amount).slice(0, 4);

      setStats({
        totalProposals: proposals.length,
        acceptedCount: accepted,
        totalFundingRecords: funding.length,
        totalValue: totalVal,
        recentActivities: recent
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(
        `https://newsapi.org/v2/everything?q=(CSR OR "corporate social responsibility" OR sustainability OR climate change)&language=en&sortBy=publishedAt&pageSize=4`,
        { headers: { 'X-Api-Key': NEWS_API_KEY } }
      );
      setNews(res.data.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([
        { title: "Global CSR Trends for 2026", description: "Companies are shifting focus to direct community impact...", source: { name: "CSR World" }, url: "#", publishedAt: new Date().toISOString(), urlToImage: "https://via.placeholder.com/400x200?text=CSR+News" },
        { title: "Climate Action: Corporate Pledges", description: "New initiatives launched to reduce carbon footprint...", source: { name: "Green Business" }, url: "#", publishedAt: new Date().toISOString(), urlToImage: "https://via.placeholder.com/400x200?text=Climate+News" }
      ]);
    } finally {
      setLoadingNews(false);
    }
  };

  if (loadingStats) return <div className="p-10 text-center text-gray-500">Loading Impact Data...</div>;

  return (
    <DashboardLayout userType="corporate">
      <div className="p-8 bg-gray-50 min-h-screen">
        
        {/* ✅ UPDATED HEADER: Blue Gradient (Matching Proposals & NGO Pages) */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white text-center">
          <h2 className="text-3xl font-bold">CSR Impact & Insights</h2>
          <p className="text-blue-100 mt-2 font-medium">Real-time analytics and latest industry news.</p>
        </div>

        {/* 1. Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Proposals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProposals}</p>
            <p className="text-xs text-green-600 mt-1">✅ {stats.acceptedCount} Accepted</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Funding Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFundingRecords}</p>
          </div>
          {/* ✅ Updated Border Color to Blue for Consistency */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">LKR {(stats.totalValue / 1000).toFixed(1)}k</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-600">
            <p className="text-xs font-bold text-gray-400 uppercase">Active Partners</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{new Set(stats.recentActivities.map(i => i.title)).size}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Recent Activity (Left 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity Feed</h3>
            </div>
            {stats.recentActivities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {stats.recentActivities.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${item.type === 'Proposal' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {item.type === 'Proposal' ? '📄' : '💰'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type} • {item.status}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">LKR {item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-gray-400 text-sm">No activity recorded yet.</p>
            )}
          </div>

          {/* 3. Live News Feed (Right 1/3) */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-red-500">🔴</span> Live CSR News
              </h3>
              <p className="text-xs text-gray-500 mt-1">Latest updates on sustainability & impact.</p>
            </div>
            
            <div className="overflow-y-auto max-h-[400px] p-4 space-y-4">
              {loadingNews ? (
                <p className="text-center text-gray-400 text-sm py-4">Loading news...</p>
              ) : (
                news.map((article, idx) => (
                  <a 
                    key={idx} 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group hover:bg-gray-50 rounded-lg p-3 transition border border-transparent hover:border-gray-200"
                  >
                    {article.urlToImage && (
                      <img src={article.urlToImage} alt={article.title} className="w-full h-32 object-cover rounded-md mb-2" />
                    )}
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{article.source.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default CsrInitiatives;