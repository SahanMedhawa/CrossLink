import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ProposalForm from '../../components/corporate/ProposalForm';

// --- Icon Components ---
const EditIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MyProposalsAndFunding = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [funding, setFunding] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);

  const navigate = useNavigate();

  // ✅ UPDATED: Fetch data depends on searchTerm
  useEffect(() => {
    fetchData();
  }, [searchTerm]); // Re-run whenever search term changes

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // ✅ Send search query to backend
      const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      
      const propRes = await axios.get(`/api/proposals/my${searchQuery}`, config);
      setProposals(propRes.data.data || propRes.data.proposals || []);

      // Note: Funding search can be added similarly if needed
      const fundRes = await axios.get('/api/funding/my', config);
      setFunding(fundRes.data.data || fundRes.data.funding || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProposal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const token = localStorage.getItem('crosslink_token');
      await axios.delete(`/api/proposals/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Proposal deleted!");
      fetchData();
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const handleEditClick = (proposal) => {
    setEditingProposal(proposal);
    setSelectedProjectForEdit(proposal.projectId);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

      if (editingProposal) {
        await axios.put(`/api/proposals/${editingProposal._id}`, formData, config);
        alert("Proposal updated!");
      }
      
      setShowForm(false);
      setEditingProposal(null);
      fetchData();
    } catch (error) {
      alert("Failed to save.");
    }
  };

  // Helper for Status Colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold">My CSR Activities</h2>
              <p className="text-blue-100 mt-2 font-medium">Manage your proposals and funding records.</p>
            </div>
            <button 
              onClick={() => navigate('/corporate/ngo-partners')}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition shadow-md flex items-center gap-2"
            >
              <span>+ New Proposal</span>
            </button>
          </div>
        </div>

        {/* ✅ NEW: Search Bar */}
        {activeTab === 'proposals' && (
          <div className="mb-6 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search proposals by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'proposals' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Proposals ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'funding' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Funding ({funding.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <>
            {/* PROPOSALS TAB */}
            {activeTab === 'proposals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-4 text-5xl">📄</div>
                    {searchTerm ? (
                      <>
                        <p className="text-gray-500 text-lg font-medium">No proposals found for "<strong>{searchTerm}</strong>".</p>
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-600 font-semibold hover:underline">Clear Search</button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-lg font-medium">No proposals sent yet.</p>
                        <button onClick={() => navigate('/corporate/ngo-partners')} className="mt-4 text-blue-600 font-semibold hover:underline">Browse NGOs to send one</button>
                      </>
                    )}
                  </div>
                ) : (
                  proposals.map((p) => (
                    <div key={p._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 overflow-hidden flex flex-col relative">
                      {/* Card Header */}
                      <div className="p-5 pb-3">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide border border-blue-100">
                            {p.projectId?.ngoId?.organizationName || 'NGO Partner'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1 leading-tight">{p.proposalTitle}</h3>
                        <p className="text-sm text-gray-500 mb-3 font-medium">For: {p.projectId?.title || 'Unknown Project'}</p>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{p.description}</p>
                      </div>

                      {/* Card Body Stats */}
                      <div className="px-5 py-3 bg-gray-50 border-y border-gray-100 flex items-center justify-between">
                        <div className="flex items-center text-gray-500 text-xs">
                          <MapPinIcon />
                          <span className="truncate max-w-[150px]">
                            {p.deliveryLocation?.address || 
                             p.deliveryAddress || 
                             p.location || 
                             'No Location'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-gray-400 uppercase font-bold">Amount</span>
                          <span className="block text-lg font-bold text-green-600">LKR {p.amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-white flex justify-end gap-3 mt-auto">
                        {p.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleEditClick(p)} 
                              className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
                            >
                              <EditIcon /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProposal(p._id)} 
                              className="flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200"
                            >
                              <TrashIcon /> Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium italic bg-gray-100 px-3 py-2 rounded-lg">Locked ({p.status})</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* FUNDING TAB (View Only) */}
            {activeTab === 'funding' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funding.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-4 text-5xl">💰</div>
                    <p className="text-gray-500 text-lg font-medium">No funding records yet.</p>
                  </div>
                ) : (
                  funding.map((f) => {
                    const ngoName = f.projectId?.ngoId?.organizationName || 'NGO Partner';
                    const projectTitle = f.projectId?.title || 'Unknown Project';

                    return (
                      <div key={f._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 overflow-hidden flex flex-col">
                        {/* Card Header */}
                        <div className="p-5 pb-3">
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide border border-green-100">
                              {ngoName}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                              Confirmed
                            </span>
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1 leading-tight">Funded: {projectTitle}</h3>
                          <p className="text-sm text-gray-500 mb-4 font-medium">Direct support contribution</p>
                          
                          <div className="flex items-center text-gray-400 text-xs mb-2">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(f.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Card Body Stats */}
                        <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-white border-t border-green-100 flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-800">Total Contribution</span>
                          <span className="text-2xl font-bold text-green-600">LKR {f.amount.toLocaleString()}</span>
                        </div>

                        {/* Card Footer: View Only Label */}
                        <div className="p-4 bg-white border-t border-gray-50 flex justify-end">
                          <span className="text-xs text-gray-400 font-medium italic flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                            <LockIcon /> Secure Record (View Only)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Proposal Modal */}
      {showForm && selectedProjectForEdit && (
        <ProposalForm 
          project={selectedProjectForEdit}
          existingData={editingProposal}
          onClose={() => { setShowForm(false); setEditingProposal(null); setSelectedProjectForEdit(null); }}
          onSubmit={handleFormSubmit}
        />
      )}
    </DashboardLayout>
  );
};

export default MyProposalsAndFunding;