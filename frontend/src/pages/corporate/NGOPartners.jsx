import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { resolveImageUrl } from '../../utils/imageUrl';

// --- Icon Components ---
const LocationIcon = () => (
  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const NGOPartners = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchNGOs = async () => {
      try {
        const limit = 50;
        let page = 1;
        let totalPages = 1;
        const allNgos = [];

        while (page <= totalPages) {
          const response = await axios.get('/api/ngos', {
            params: { page, limit },
          });

          const pageData = response.data?.data || response.data?.ngos || [];
          allNgos.push(...pageData);

          totalPages = Number(response.data?.totalPages) || 1;
          page += 1;
        }

        if (isMounted) {
          setNgos(allNgos);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching NGOs:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNGOs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewProjects = (ngoId) => {
    navigate(`/corporate/ngo/${ngoId}/projects`);
  };

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* ✅ UPDATED HEADER: Blue Gradient (Matching Proposals/Funding) */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold">NGO Partners</h2>
            <p className="text-blue-100 mt-2 font-medium text-lg">Discover verified organizations to partner with and drive impact together.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4 text-5xl">🤝</div>
            <p className="text-gray-500 text-lg font-medium">No NGO partners found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <div 
                key={ngo._id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
              >
                {/* Card Top Section */}
                <div className="p-6 flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Logo Circle with Blue Theme */}
                    {ngo.photoURL ? (
                      <img
                        src={resolveImageUrl(ngo.photoURL)}
                        alt={ngo.organizationName || 'NGO'}
                        className="w-16 h-16 rounded-full object-cover border border-blue-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100">
                        {ngo.organizationName?.charAt(0) || 'N'}
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {ngo.organizationName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <LocationIcon />
                        <span className="truncate">{ngo.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed min-h-[3rem]">
                    {ngo.bio || "No description available for this organization."}
                  </p>

                  {/* Tags with Blue Theme */}
                  <div className="flex flex-wrap gap-2">
                    {ngo.focusAreas && ngo.focusAreas.length > 0 ? (
                      ngo.focusAreas.slice(0, 3).map((area, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold border border-blue-100">
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">General</span>
                    )}
                    {ngo.focusAreas?.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{ngo.focusAreas.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Action with Blue Theme */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewProjects(ngo._id)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    View Projects <ArrowRightIcon />
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

export default NGOPartners;