import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CorporateProjectCard from '../../components/corporate/CorporateProjectCard';
import ProposalForm from '../../components/corporate/ProposalForm';
import FundingForm from '../../components/corporate/FundingForm'; // Import New Form

const NgoProjectView = () => {
  const { ngoId } = useParams();
  const navigate = useNavigate();
  
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoName, setNgoName] = useState('');

  // Proposal States
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);

  // ✅ Funding States
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [selectedProjectForFunding, setSelectedProjectForFunding] = useState(null);
  const [editingFunding, setEditingFunding] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/projects/all');
        const projects = res.data.projects || res.data.data || [];
        setAllProjects(projects);

        const filtered = projects.filter(p => p.ngoId && p.ngoId._id === ngoId);
        setFilteredProjects(filtered);

        if (filtered.length > 0 && filtered[0].ngoId) {
          setNgoName(filtered[0].ngoId.organizationName);
        } else {
          setNgoName('Selected NGO');
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ngoId]);

  // --- Proposal Handlers ---
  const handlePropose = (project, existingProp = null) => {
    setSelectedProjectForProposal(project);
    setEditingProposal(existingProp || null);
    setShowProposalForm(true);
  };

  const handleProposalSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

      if (editingProposal) {
        await axios.put(`/api/proposals/${editingProposal._id}`, formData, config);
        alert('Proposal updated!');
      } else {
        await axios.post('/api/proposals', formData, config);
        alert('Proposal sent!');
      }

      setShowProposalForm(false);
      setSelectedProjectForProposal(null);
      setEditingProposal(null);
      navigate('/corporate/my-activities');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed.');
    }
  };

  // ✅ --- Funding Handlers ---
  const handleFund = (project, existingFund = null) => {
    setSelectedProjectForFunding(project);
    setEditingFunding(existingFund || null);
    setShowFundingForm(true);
  };

  const handleFundingSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('crosslink_token');
      const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

      if (editingFunding) {
        // Update (if you implement edit logic later)
        await axios.put(`/api/funding/${editingFunding._id}`, formData, config);
        alert('Funding record updated!');
      } else {
        // Create New
        await axios.post('/api/funding', formData, config);
        alert('Funding recorded successfully!');
      }

      setShowFundingForm(false);
      setSelectedProjectForFunding(null);
      setEditingFunding(null);
      navigate('/corporate/my-activities');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record funding.');
    }
  };

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6">
        <div className="mb-6">
          <button onClick={() => navigate('/corporate/ngo-partners')} className="text-blue-600 hover:underline mb-2 text-sm font-medium flex items-center gap-1">
            ← Back to NGOs
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Projects by {ngoName}</h2>
          <p className="text-gray-500 mt-1">Browse available projects and send proposals or funding.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No active projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <CorporateProjectCard 
                key={project._id} 
                project={project} 
                onPropose={() => handlePropose(project)}
                onFund={() => handleFund(project)} // ✅ Connect Funding Button
              />
            ))}
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalForm && selectedProjectForProposal && (
        <ProposalForm 
          project={selectedProjectForProposal}
          existingData={editingProposal}
          onClose={() => { setShowProposalForm(false); setSelectedProjectForProposal(null); setEditingProposal(null); }}
          onSubmit={handleProposalSubmit}
        />
      )}

      {/* ✅ Funding Modal */}
      {showFundingForm && selectedProjectForFunding && (
        <FundingForm 
          project={selectedProjectForFunding}
          existingData={editingFunding}
          onClose={() => { setShowFundingForm(false); setSelectedProjectForFunding(null); setEditingFunding(null); }}
          onSubmit={handleFundingSubmit}
        />
      )}
    </DashboardLayout>
  );
};

export default NgoProjectView;