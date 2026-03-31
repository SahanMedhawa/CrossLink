import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const ProposalsAndFundings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'fundings' ? 'fundings' : 'proposals';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [proposals, setProposals] = useState([]);
  const [fundings, setFundings] = useState([]); // State for fundings
  const [loading, setLoading] = useState(true);
  const [ngoId, setNgoId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); 

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('crosslink_user')); 
    if (user && user._id) {
      setNgoId(user._id);
    }
  }, []);

  useEffect(() => {
    if (ngoId) {
      fetchData();
    }
  }, [ngoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // Fetch both once to avoid repeated endpoint calls when switching tabs.
      const [proposalRes, fundingRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/proposals/ngo/${ngoId}`, config),
        axios.get(`http://localhost:5000/api/funding/ngo/${ngoId}`, config),
      ]);

      setProposals(proposalRes.data.data || []);
      setFundings(fundingRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data.");
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
      fetchData(); // Refresh list
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

  const corporateFilterId = searchParams.get('corporateId') || '';

  const filteredProposals = corporateFilterId
    ? proposals.filter((p) => p?.corporateId?._id === corporateFilterId)
    : proposals;

  const filteredFundings = corporateFilterId
    ? fundings.filter((f) => f?.corporateId?._id === corporateFilterId)
    : fundings;

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  const clearCorporateFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('corporateId');
    setSearchParams(nextParams);
  };

  return (
    <DashboardLayout userType="ngo">
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <h2 className="text-3xl font-bold">Proposals & Fundings</h2>
          <p className="text-blue-100 mt-2">Review and manage incoming collaboration requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => handleTabChange('proposals')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'proposals' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Proposals ({filteredProposals.filter(p => p.status === 'Pending').length} Pending)
          </button>
          <button
            onClick={() => handleTabChange('fundings')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'fundings' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Fundings ({filteredFundings.length})
          </button>
        </div>

        {corporateFilterId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-blue-800 font-medium">Filtered by selected corporate partner.</p>
            <button
              onClick={clearCorporateFilter}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Clear Filter
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <>
            {/* PROPOSALS TAB */}
            {activeTab === 'proposals' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProposals.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No proposals received yet.</p>
                  </div>
                ) : (
                  filteredProposals.map((p) => (
                    <div key={p._id} className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 overflow-hidden flex flex-col">
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
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
                          <p><strong>Amount:</strong> <span className="text-green-600 font-bold">LKR {p.amount.toLocaleString()}</span></p>
                          {p.deliveryLocation?.address && <p><strong>Location:</strong> {p.deliveryLocation.address}</p>}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {p.status === 'Pending' ? (
                          <>
                            <button onClick={() => handleStatusUpdate(p._id, 'Rejected')} disabled={actionLoading === p._id} className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50">Reject</button>
                            <button onClick={() => handleStatusUpdate(p._id, 'Accepted')} disabled={actionLoading === p._id} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50">{actionLoading === p._id ? 'Processing...' : 'Accept Proposal'}</button>
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

            {/* ✅ FUNDINGS TAB */}
            {activeTab === 'fundings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFundings.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-4">💰</div>
                    <p className="text-gray-500 text-lg font-medium">No funding records found.</p>
                    <p className="text-sm text-gray-400 mt-2">Accept some proposals to see funding records here!</p>
                  </div>
                ) : (
                  filteredFundings.map((f) => (
                    <div key={f._id} className="bg-white rounded-2xl shadow-sm border-l-4 border-green-500 overflow-hidden flex flex-col">
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">
                            {f.corporateId?.companyName || 'Corporate Partner'}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                            {f.status || 'Confirmed'}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Funded: {f.fundingTitle || f.projectId?.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 font-medium">For Project: {f.projectId?.title}</p>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Type:</strong> {f.fundingType}</p>
                          <p><strong>Payment Method:</strong> {f.paymentMethod}</p>
                          {f.transactionRefId && <p><strong>Ref ID:</strong> {f.transactionRefId}</p>}
                          {f.note && <p><strong>Note:</strong> {f.note}</p>}
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Contribution</p>
                            <p className="text-2xl font-bold text-green-600">LKR {f.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Received on {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProposalsAndFundings;