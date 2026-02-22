import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const NGOPartners = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        // Using your teammate's endpoint
        const response = await axios.get('http://localhost:5000/api/ngos');
        // Adjust based on actual response structure (data.data or data.ngos)
        setNgos(response.data.data || response.data.ngos || []);
      } catch (error) {
        console.error("Error fetching NGOs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNGOs();
  }, []);

  const handleViewProjects = (ngoId) => {
    // Option A: Route to your specific corporate view
    navigate(`/corporate/ngo/${ngoId}/projects`);
  };

  return (
    <DashboardLayout userType="corporate">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">NGO Partners</h2>
        <p className="text-gray-600 mb-8">Discover verified organizations to partner with.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ngos.length === 0 ? (
          <p className="text-gray-500 text-center">No NGOs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <div 
                key={ngo._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                onClick={() => handleViewProjects(ngo._id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                    {ngo.organizationName?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{ngo.organizationName}</h3>
                    <p className="text-sm text-gray-500">{ngo.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {ngo.bio || "No description available."}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ngo.focusAreas?.slice(0, 3).map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {area}
                    </span>
                  ))}
                  {ngo.focusAreas?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{ngo.focusAreas.length - 3}</span>
                  )}
                </div>
                <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  View Projects
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NGOPartners;