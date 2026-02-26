import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { requestParticipation } from "../../services/volunteerApi";
import ParticipationFormModal from "../../components/volunteer/ParticipationFormModal";
import toast from "react-hot-toast";

const NgoProjectView = () => {
    const { ngoId } = useParams();
    const navigate = useNavigate();

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ngoName, setNgoName] = useState('');

    // Application States
    const [showForm, setShowForm] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/projects/all');
                const projects = res.data.projects || res.data.data || [];

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

    const handleApply = (projectId) => {
        setSelectedProjectId(projectId);
        setShowForm(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            setFormLoading(true);
            const result = await requestParticipation(selectedProjectId, formData);
            if (result.success) {
                toast.success("Participation request submitted!");
                setShowForm(false);
                setSelectedProjectId(null);
                // Navigate back to applications to see status or just refresh
                navigate('/volunteer/applications');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <DashboardLayout userType="volunteer">
            <div className="space-y-8 max-w-7xl mx-auto pb-10">
                <div className="mb-6 flex items-center justify-between animate-fade-in-up">
                    <div>
                        <button onClick={() => navigate('/volunteer/ngos')} className="text-indigo-600 hover:text-indigo-800 transition-colors mb-3 text-sm font-bold flex items-center gap-1.5 bg-indigo-50 px-4 py-2 rounded-xl">
                            <svg className="w-4 h-4 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Organizations
                        </button>
                        <h2 className="text-3xl font-black text-gray-900 drop-shadow-sm flex items-center gap-3">
                            Projects by {ngoName}
                        </h2>
                        <p className="text-gray-500 mt-2 font-medium">Browse available initiatives and send a participation request.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 max-w-7xl mx-auto">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
                        <p className="text-xl font-bold text-gray-800 animate-pulse">Loading initiatives...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 border-dashed shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Projects</h3>
                        <p className="text-lg text-gray-500 max-w-md mx-auto">
                            This organization hasn't listed any active projects yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {filteredProjects.map((project, idx) => (
                            <div
                                key={project._id}
                                className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Image Section */}
                                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                    {project.image ? (
                                        <img
                                            src={`http://localhost:5000${project.image}`}
                                            alt={project.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-200">
                                            <svg className="w-20 h-20 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-black/60 text-white backdrop-blur-md px-4 py-1.5 text-xs font-bold rounded-xl border border-white/10 uppercase tracking-wider shadow-lg">
                                            {project.focusArea}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-2xl font-extrabold line-clamp-1 drop-shadow-md mb-1">{project.title}</h3>
                                        <p className="text-sm font-medium flex items-center gap-2 text-gray-200 drop-shadow-sm line-clamp-1">
                                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                            {ngoName}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-7 flex flex-col flex-1">
                                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center gap-6 text-sm font-semibold text-gray-500 pb-6 mb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            {project.volunteersCount}/{project.volunteersNeeded} <span className="text-gray-400 font-medium">Volunteers</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {project.location}
                                        </div>
                                    </div>

                                    {project.skills?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                Desired Skills
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.skills.map((s) => (
                                                    <span key={s} className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-[11px] font-bold shadow-sm">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleApply(project._id)}
                                        className="w-full mt-auto group/btn relative overflow-hidden px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Join Project Now
                                            <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </span>
                                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ParticipationFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedProjectId(null);
                }}
                onSubmit={handleFormSubmit}
                loading={formLoading}
                isEdit={false}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
        </DashboardLayout>
    );
};

export default NgoProjectView;
