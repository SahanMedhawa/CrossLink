import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const CorporatePartners = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partners, setPartners] = useState([]);
  const fetchedForUserRef = useRef('');

  useEffect(() => {
    const fetchPartners = async () => {
      if (!user?._id) return;
      if (fetchedForUserRef.current === user._id) return;

      fetchedForUserRef.current = user._id;

      try {
        setLoading(true);
        setError('');

        const [proposalRes, fundingRes] = await Promise.all([
          api.get(`/proposals/ngo/${user._id}`),
          api.get(`/funding/ngo/${user._id}`),
        ]);

        const proposals = proposalRes.data?.data || [];
        const fundings = fundingRes.data?.data || [];

        const partnerMap = new Map();

        proposals.forEach((proposal) => {
          const corporate = proposal?.corporateId;
          const partnerId = corporate?._id;
          if (!partnerId) return;

          const existing = partnerMap.get(partnerId) || {
            _id: partnerId,
            companyName: corporate.companyName || corporate.name || 'Corporate Partner',
            industry: corporate.industry || 'Not specified',
            email: corporate.email || '',
            proposalCount: 0,
            fundingCount: 0,
            acceptedProposals: 0,
            proposedAmount: 0,
            fundedAmount: 0,
            latestInteractionAt: null,
          };

          existing.proposalCount += 1;
          existing.proposedAmount += Number(proposal.amount || 0);
          if (proposal.status === 'Accepted' || proposal.status === 'Completed') {
            existing.acceptedProposals += 1;
          }

          const proposalDate = proposal.updatedAt || proposal.createdAt || null;
          if (proposalDate && (!existing.latestInteractionAt || new Date(proposalDate) > new Date(existing.latestInteractionAt))) {
            existing.latestInteractionAt = proposalDate;
          }

          partnerMap.set(partnerId, existing);
        });

        fundings.forEach((funding) => {
          const corporate = funding?.corporateId;
          const partnerId = corporate?._id;
          if (!partnerId) return;

          const existing = partnerMap.get(partnerId) || {
            _id: partnerId,
            companyName: corporate.companyName || corporate.name || 'Corporate Partner',
            industry: corporate.industry || 'Not specified',
            email: corporate.email || '',
            proposalCount: 0,
            fundingCount: 0,
            acceptedProposals: 0,
            proposedAmount: 0,
            fundedAmount: 0,
            latestInteractionAt: null,
          };

          existing.fundingCount += 1;
          existing.fundedAmount += Number(funding.amount || 0);

          const fundingDate = funding.updatedAt || funding.createdAt || null;
          if (fundingDate && (!existing.latestInteractionAt || new Date(fundingDate) > new Date(existing.latestInteractionAt))) {
            existing.latestInteractionAt = fundingDate;
          }

          partnerMap.set(partnerId, existing);
        });

        const partnerList = Array.from(partnerMap.values()).sort((a, b) => {
          const aDate = a.latestInteractionAt ? new Date(a.latestInteractionAt).getTime() : 0;
          const bDate = b.latestInteractionAt ? new Date(b.latestInteractionAt).getTime() : 0;
          return bDate - aDate;
        });

        setPartners(partnerList);
      } catch (err) {
        setError('Failed to load corporate partners.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [user?._id]);

  const stats = useMemo(() => {
    return {
      totalPartners: partners.length,
      totalProposals: partners.reduce((sum, p) => sum + p.proposalCount, 0),
      totalFundings: partners.reduce((sum, p) => sum + p.fundingCount, 0),
      totalFundedAmount: partners.reduce((sum, p) => sum + p.fundedAmount, 0),
    };
  }, [partners]);

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Corporate Partners</h2>
          <p className="text-blue-100">Organizations that have submitted proposals or funding to your projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Partners</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPartners}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Proposals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProposals}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Fundings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFundings}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Funding</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">LKR {stats.totalFundedAmount.toLocaleString()}</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">Loading corporate partners...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Corporate Partners Yet</h3>
            <p className="text-gray-500">When companies send proposals or funding, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {partners.map((partner) => (
              <div key={partner._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    {(partner.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{partner.companyName}</h3>
                    <p className="text-sm text-gray-500">{partner.industry}</p>
                    {partner.email && <p className="text-sm text-blue-700 mt-1 break-all">{partner.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Proposals</p>
                    <p className="font-semibold text-gray-900">{partner.proposalCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Accepted</p>
                    <p className="font-semibold text-gray-900">{partner.acceptedProposals}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Fundings</p>
                    <p className="font-semibold text-gray-900">{partner.fundingCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Funded Amount</p>
                    <p className="font-semibold text-gray-900">LKR {partner.fundedAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/ngo/proposals-fundings?tab=proposals&corporateId=${partner._id}`)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    View Proposals
                  </button>
                  <button
                    onClick={() => navigate(`/ngo/proposals-fundings?tab=fundings&corporateId=${partner._id}`)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    View Fundings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CorporatePartners;
