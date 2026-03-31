import React, { useState, useEffect } from "react"; //  Added useEffect
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const CorporateProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // New state for initial load

  // Local state for form data
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    location: "",
    bio: "",
    contactPerson: "",
    website: "",
    csrBudget: "",
    csrInterests: [],
  });

  const [interestInput, setInterestInput] = useState("");

  // NEW: Fetch fresh data directly from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("crosslink_token");
        if (!token) {
          setFetching(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/corporates/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.data.success && res.data.data) {
          const data = res.data.data;
          
          // Update local state with FRESH data from DB
          setFormData({
            companyName: data.companyName || "",
            industry: data.industry || "",
            location: data.location || "",
            bio: data.bio || "",
            contactPerson: data.contactPerson || "",
            website: data.website || "",
            csrBudget: data.csrBudget || "",
            csrInterests: data.csrInterests || [],
          });

          // Optional: Update global context too so other pages see changes
          if (updateUser) {
            updateUser(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh profile:", error);
        // Fallback: Use data from AuthContext if API fails
        if (user) {
          setFormData({
            companyName: user.companyName || "",
            industry: user.industry || "",
            location: user.location || "",
            bio: user.bio || "",
            contactPerson: user.contactPerson || "",
            website: user.website || "",
            csrBudget: user.csrBudget || "",
            csrInterests: user.csrInterests || [],
          });
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []); // Run once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!formData.csrInterests.includes(interestInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          csrInterests: [...prev.csrInterests, interestInput.trim()],
        }));
      }
      setInterestInput("");
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData((prev) => ({
      ...prev,
      csrInterests: prev.csrInterests.filter((i) => i !== interestToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("crosslink_token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const res = await axios.put(
        "http://localhost:5000/api/corporates/profile", 
        formData, 
        config
      );

      if (res.data && res.data.success) {
        alert("Profile updated successfully!");
        
        // Force reload to ensure fresh data is pulled from DB
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
      } else {
        throw new Error(res.data.message || "Unknown error from server");
      }

    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form to current formData (which holds fresh DB data)
    // We don't reset to 'user' because 'user' might be stale
    setIsEditing(false);
    // Optionally re-fetch to be absolutely sure, but current formData is fine since it came from DB on mount
  };

  if (fetching) {
    return (
      <DashboardLayout userType="corporate">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="corporate">
      <div className="p-8 bg-gray-50 min-h-screen">
        
        {/* Header with Edit Button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Company Profile</h2>
            <p className="text-blue-100 mt-2 font-medium">Manage your organization's details and CSR focus.</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition shadow-md flex items-center gap-2"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md flex items-center gap-2"
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 mb-4">
                {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : 'C'}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full text-center text-xl font-bold border-b-2 border-blue-300 focus:border-blue-600 outline-none py-1 mb-2"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">{formData.companyName || "Company Name"}</h3>
              )}

              {isEditing ? (
                 <div className="text-sm text-gray-500 mb-4 space-y-1">
                   <input
                    type="text"
                    name="industry"
                    placeholder="Industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full text-center border-b border-gray-300 focus:border-blue-600 outline-none"
                   />
                   <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full text-center border-b border-gray-300 focus:border-blue-600 outline-none"
                   />
                 </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">{formData.industry || "Industry"} • {formData.location || "Location"}</p>
              )}
              
              <div className="border-t border-gray-100 pt-4 space-y-2 text-left">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Contact Person</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full text-sm border-b border-gray-300 focus:border-blue-600 outline-none py-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{formData.contactPerson || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                  <p className="text-sm font-medium text-gray-700">{user?.email || formData.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Website</p>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full text-sm border-b border-gray-300 focus:border-blue-600 outline-none py-1"
                    />
                  ) : (
                    formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                        {formData.website}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not provided</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About / Bio */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">About Company</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Describe your company and its mission..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {formData.bio || "No company description provided yet."}
                </p>
              )}
            </div>

            {/* CSR Interests */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">CSR Focus Areas</h3>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={handleAddInterest}
                    placeholder="Type interest and press Enter (e.g., Education)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.csrInterests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:text-red-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                formData.csrInterests && formData.csrInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.csrInterests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No specific CSR interests listed.</p>
                )
              )}
            </div>

            {/* Budget & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">CSR Budget</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="csrBudget"
                    value={formData.csrBudget}
                    onChange={handleInputChange}
                    placeholder="e.g., LKR 1M - 5M"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{formData.csrBudget || "Not disclosed"}</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Member Since</h3>
                <p className="text-lg font-medium text-gray-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CorporateProfile;