import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const ProposalsAndFundings = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoId, setNgoId] = useState(null);
  
  // For handling action states (optional UX improvement)
  const [actionLoading, setActionLoading] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    // Get NGO ID from logged-in user profile (stored in localStorage or Context)
    // Assuming you store user details in localStorage upon login
    const user = JSON.parse(localStorage.getItem('crosslink_user')); 
    if (user && user._id) {
      setNgoId(user._id);
    } else {
      // Fallback if not found, maybe redirect or show error
      console.warn("NGO ID not found in local storage");
    }
  }, []);

  useEffect(() => {
    if (ngoId) {
      fetchProposals();
    }
  }, [ngoId]);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const res = await axios.get(`http://localhost:5000/api/proposals/ngo/${ngoId}`, config);
      setProposals(res.data.data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      alert("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this proposal?`)) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };

      await axios.patch(
        `http://localhost:5000/api/proposals/${id}/status`, 
        { status: newStatus }, 
        config
      );

      alert(`Proposal successfully ${newStatus}!`);
      fetchProposals(); // Refresh list
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <DashboardLayout userType="ngo">
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <h2 className="text-3xl font-bold">Proposals & Fundings</h2>
          <p className="text-purple-100 mt-2">Review and manage incoming collaboration requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'proposals' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Proposals ({proposals.filter(p => p.status === 'Pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('fundings')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'fundings' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Fundings
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <>
            {/* PROPOSALS TAB */}
            {activeTab === 'proposals' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {proposals.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No proposals received yet.</p>
                  </div>
                ) : (
                  proposals.map((p) => (
                    <div key={p._id} className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 overflow-hidden flex flex-col">
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full uppercase">
                            {p.corporateId?.companyName || 'Corporate Partner'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{p.proposalTitle}</h3>
                        <p className="text-sm text-gray-500 mb-4 font-medium">For Project: {p.projectId?.title}</p>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Description:</strong> {p.description}</p>
                          <p><strong>Impact:</strong> {p.expectedImpact}</p>
                          <p><strong>Message:</strong> {p.message}</p>
                          <p><strong>Amount:</strong> <span className="text-green-600 font-bold">LKR {p.amount.toLocaleString()}</span></p>
                          {p.deliveryLocation?.address && (
                            <p><strong>Location:</strong> {p.deliveryLocation.address}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {p.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                              disabled={actionLoading === p._id}
                              className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(p._id, 'Accepted')}
                              disabled={actionLoading === p._id}
                              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-md disabled:opacity-50"
                            >
                              {actionLoading === p._id ? 'Processing...' : 'Accept Proposal'}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Decision Recorded</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* FUNDINGS TAB (Placeholder for now) */}
            {activeTab === 'fundings' && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">💰</div>
                <p className="text-gray-500 text-lg font-medium">Funding records will appear here once proposals are accepted.</p>
                <p className="text-sm text-gray-400 mt-2">(You can connect this to your Funding API later)</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProposalsAndFundings;