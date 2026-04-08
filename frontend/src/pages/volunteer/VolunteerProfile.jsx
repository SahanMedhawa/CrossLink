import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { updateVolunteerProfile } from "../../services/volunteerApi";
import toast from "react-hot-toast";
import {
  SKILL_OPTIONS,
  INTEREST_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "../../constants/skillsAndInterests";
import { resolveImageUrl } from "../../utils/imageUrl";

const VolunteerProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    photoURL: "",
    skills: [],
    interests: [],
    availability: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        photoURL: user.photoURL || "",
        skills: user.skills || [],
        interests: user.interests || [],
        availability: user.availability || "",
      });
      setImagePreview(user.photoURL ? resolveImageUrl(user.photoURL) : "");
      setImageFile(null);
    }
  }, [user]);
  useEffect(() => {
    return () => {
      // Cleanup object URL on unmount to prevent memory leaks
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Profile photo must be less than 10MB.");
      return;
    }

    setImageFile(file);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkill("");
    }
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setCustomInterest("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone || "");
      payload.append("location", formData.location || "");
      payload.append("bio", formData.bio || "");
      payload.append("availability", formData.availability || "");
      payload.append("skills", JSON.stringify(formData.skills || []));
      payload.append("interests", JSON.stringify(formData.interests || []));
      if (imageFile) {
        payload.append("photo", imageFile);
      }

      const result = await updateVolunteerProfile(payload);
      if (result.success) {
        setUser(result.data);
        setImageFile(null);
        setImagePreview(result.data?.photoURL ? resolveImageUrl(result.data.photoURL) : "");
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="volunteer">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Modern Header Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 lg:p-14 shadow-[0_20px_50px_rgba(79,70,229,0.15)] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-fuchsia-300 opacity-20 blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-50 text-sm font-bold tracking-wide mb-6 shadow-xl">
                <svg className="w-5 h-5 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personalization
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">Volunteer</span> Profile
              </h2>
              <p className="text-indigo-100/95 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                Keep your profile detailed and up-to-date so our smart matchmaking engine can discover the absolute perfect projects tailored exclusively for you.
              </p>
            </div>

            {/* Avatar Placeholder Overlay */}
            <div className="hidden md:flex flex-shrink-0 animate-fade-in-up">
              <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-md border-[6px] border-white/20 p-2 shadow-2xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-fuchsia-400 opacity-20 blur-xl"></div>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.name || "Volunteer"}
                    className="relative z-10 w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-6xl font-black text-white/80 select-none">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Info Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 lg:p-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-2rem opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Basic Details</h3>
            </div>

            <div className="mb-8 p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40">
              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Display Picture</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-indigo-200 bg-white shadow-sm flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt={formData.name || 'Volunteer'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-indigo-400">{formData.name ? formData.name.charAt(0).toUpperCase() : 'V'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">Upload a clear profile photo so organizations can recognize you.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider ml-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider ml-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                  placeholder="e.g., Colombo, Sri Lanka"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider ml-1">Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="" disabled className="text-gray-400">Select availability</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2 mt-2">
                <div className="flex justify-between items-end ml-1 mb-1">
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider">Short Bio & Experience</label>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg">{formData.bio.length}/500</span>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm resize-none leading-relaxed"
                  placeholder="Tell organizations about yourself, your background, and why you love volunteering..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 rounded-t-2rem opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </span>
                Your Skills
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-6 ml-13">
                Select your core strengths. The AI uses these to match you!
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-[1rem] text-sm font-bold transition-all duration-300 transform ${isSelected
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                          : "bg-gray-100/80 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add Custom Skills</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                    className="flex-1 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                    placeholder="E.g., Adobe Illustrator"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    Add
                  </button>
                </div>
                {/* Custom Selected */}
                <div className="flex flex-wrap gap-2">
                  {formData.skills
                    .filter((s) => !SKILL_OPTIONS.includes(s))
                    .map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-1.5 rounded-[1rem] text-sm font-bold bg-indigo-600 text-white flex items-center gap-2 shadow-md shadow-indigo-600/20"
                      >
                        {skill}
                        <button type="button" onClick={() => toggleSkill(skill)} className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 hover:text-red-200 transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-purple-500 rounded-t-2rem opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-purple-50 flex items-center justify-center rounded-xl text-purple-600 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </span>
                Your Passions
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-6 ml-13">
                Select areas you truly care about making an impact in.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-[1rem] text-sm font-bold transition-all duration-300 transform ${isSelected
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                          : "bg-gray-100/80 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add Custom Passions</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                    className="flex-1 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-gray-400"
                    placeholder="E.g., Ocean Conservation"
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    className="px-5 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold shadow-sm hover:bg-purple-100 focus:ring-2 focus:ring-purple-200 transition-all"
                  >
                    Add
                  </button>
                </div>
                {/* Custom Selected */}
                <div className="flex flex-wrap gap-2">
                  {formData.interests
                    .filter((i) => !INTEREST_OPTIONS.includes(i))
                    .map((interest) => (
                      <span
                        key={interest}
                        className="px-4 py-1.5 rounded-[1rem] text-sm font-bold bg-fuchsia-600 text-white flex items-center gap-2 shadow-md shadow-fuchsia-600/20"
                      >
                        {interest}
                        <button type="button" onClick={() => toggleInterest(interest)} className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 hover:text-red-200 transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Floor */}
          <div className="mt-12 bg-gray-900 rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Ready to save?</h4>
              <p className="text-gray-400 font-medium">Your changes will immediately affect your project matchmaking.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-5 bg-indigo-500 text-white rounded-[1.25rem] text-lg font-black tracking-wide hover:bg-indigo-400 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.6)] focus:ring-4 focus:ring-indigo-500/30 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Syncing Profile...
                </>
              ) : (
                <>
                  Update My Profile
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </DashboardLayout>
  );
};

export default VolunteerProfile;
