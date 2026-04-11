import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { resolveImageUrl } from '../../utils/imageUrl';

const BrowseNGOs = () => {
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

                // Fetch every page so volunteers can browse all NGOs, not only the first 10.
                while (page <= totalPages) {
                    const response = await api.get('/ngos', {
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
        navigate(`/volunteer/ngo/${ngoId}/projects`);
    };

    return (
        <DashboardLayout userType="volunteer">
            <div className="space-y-8 max-w-7xl mx-auto pb-10">
                {/* Modern Header Hero */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 lg:p-14 shadow-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-400 opacity-20 blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-50 text-sm font-bold tracking-wide mb-6 shadow-xl animate-fade-in-up">
                                <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                Partner Organizations
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg mb-6">
                                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Impactful NGOs</span>
                            </h2>
                            <p className="text-indigo-100/95 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                                Browse our network of verified non-profit organizations and find ones that align with your passions.
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 max-w-7xl mx-auto">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
                        <p className="text-xl font-bold text-gray-800 animate-pulse">Loading NGOs...</p>
                    </div>
                ) : ngos.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 border-dashed shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No NGOs Found</h3>
                        <p className="text-lg text-gray-500 max-w-md mx-auto">
                            There are currently no organizations registered. Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ngos.map((ngo, idx) => (
                            <div
                                key={ngo._id}
                                className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-8 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col"
                                onClick={() => handleViewProjects(ngo._id)}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-center gap-5 mb-6">
                                    {ngo.photoURL ? (
                                        <img
                                            src={resolveImageUrl(ngo.photoURL)}
                                            alt={ngo.organizationName || 'NGO'}
                                            className="w-16 h-16 rounded-2xl object-cover shadow-inner border border-indigo-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner border border-indigo-100">
                                            {ngo.organizationName?.charAt(0) || 'N'}
                                        </div>
                                    )}
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{ngo.organizationName}</h3>
                                        <p className="text-sm font-medium flex items-center justify-start gap-1.5 text-gray-500 mt-1 line-clamp-1">
                                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                            {ngo.location || "Unknown Location"}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed text-left">
                                    {ngo.bio || "No description available yet."}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8 justify-start">
                                    {ngo.focusAreas?.slice(0, 3).map((area, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-100 text-xs rounded-xl font-bold shadow-sm">
                                            {area}
                                        </span>
                                    ))}
                                    {ngo.focusAreas?.length > 3 && (
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-xl font-bold shadow-sm border border-gray-200">+{ngo.focusAreas.length - 3}</span>
                                    )}
                                </div>

                                <button className="w-full mt-auto py-3.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)]">
                                    Explore Projects
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
        </DashboardLayout>
    );
};

export default BrowseNGOs;
