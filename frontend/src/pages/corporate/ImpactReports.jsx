import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const ImpactReports = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        
        <div className="max-w-2xl w-full text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Impact Reports
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Detailed records of your proposals and funding contributions have been moved to a dedicated management dashboard for better organization.
          </p>

          {/* Action Button */}
          <button
            onClick={() => navigate('/corporate/my-activities')}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
          >
            View My Proposals & Funding
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Secondary Info */}
          <p className="mt-6 text-sm text-gray-400">
            Or select <span className="font-medium text-gray-600">"My Proposals & Funding"</span> from the sidebar.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ImpactReports;