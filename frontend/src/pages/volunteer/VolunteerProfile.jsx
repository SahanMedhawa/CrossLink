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

const VolunteerProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    interests: [],
    availability: "",
  });
  const [customSkill, setCustomSkill] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills || [],
        interests: user.interests || [],
        availability: user.availability || "",
      });
    }
  }, [user]);

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
      const result = await updateVolunteerProfile(formData);
      if (result.success) {
        setUser(result.data);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Volunteer Profile</h2>
          <p className="text-blue-100">
            Keep your profile up-to-date so our matchmaking engine can find the best projects for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Colombo, Sri Lanka"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select availability</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell organizations about yourself..."
                />
                <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Skills</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select or add skills that you can contribute to projects. These are used by our matchmaking engine.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.skills.includes(skill)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {/* Custom skills */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Add a custom skill..."
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
              >
                Add
              </button>
            </div>
            {/* Selected custom skills  */}
            <div className="flex flex-wrap gap-2">
              {formData.skills
                .filter((s) => !SKILL_OPTIONS.includes(s))
                .map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-600 text-white flex items-center gap-1"
                  >
                    {skill}
                    <button type="button" onClick={() => toggleSkill(skill)} className="ml-1 hover:text-red-200">
                      &times;
                    </button>
                  </span>
                ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Interests</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select areas you&apos;re passionate about.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Add a custom interest..."
              />
              <button
                type="button"
                onClick={addCustomInterest}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.interests
                .filter((i) => !INTEREST_OPTIONS.includes(i))
                .map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-600 text-white flex items-center gap-1"
                  >
                    {interest}
                    <button type="button" onClick={() => toggleInterest(interest)} className="ml-1 hover:text-red-200">
                      &times;
                    </button>
                  </span>
                ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerProfile;
