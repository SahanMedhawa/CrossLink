import React, { useState, useEffect } from "react";

const ParticipationFormModal = ({ isOpen, onClose, onSubmit, loading, initialData, isEdit }) => {
  const [formData, setFormData] = useState({
    message: "",
    experienceSummary: "",
    availabilityConfirmed: false,
    preferredRole: "",
    expectedHours: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        message: initialData.message || "",
        experienceSummary: initialData.experienceSummary || "",
        availabilityConfirmed: initialData.availabilityConfirmed || false,
        preferredRole: initialData.preferredRole || "",
        expectedHours: initialData.expectedHours || "",
      });
    } else {
      setFormData({
        message: "",
        experienceSummary: "",
        availabilityConfirmed: false,
        preferredRole: "",
        expectedHours: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = "Motivation message must be at least 10 characters.";
    }
    if (!formData.experienceSummary || formData.experienceSummary.trim().length < 10) {
      newErrors.experienceSummary = "Experience summary must be at least 10 characters.";
    }
    if (!isEdit && !formData.availabilityConfirmed) {
      newErrors.availabilityConfirmed = "You must confirm your availability.";
    }
    if (formData.expectedHours && (formData.expectedHours < 1 || formData.expectedHours > 500)) {
      newErrors.expectedHours = "Expected hours must be between 1 and 500.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = { ...formData };
    if (submitData.expectedHours) {
      submitData.expectedHours = Number(submitData.expectedHours);
    } else {
      delete submitData.expectedHours;
    }
    if (!submitData.preferredRole?.trim()) {
      delete submitData.preferredRole;
    }

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? "Edit Participation Request" : "Request Participation"}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isEdit
              ? "Update your application details below."
              : "Tell the NGO why you'd like to join this project."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Motivation Message (Required) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Motivation Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Why do you want to join this project? What motivates you?"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                errors.message ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formData.message.length}/1000 characters</p>
          </div>

          {/* Relevant Experience (Required) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Relevant Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              name="experienceSummary"
              value={formData.experienceSummary}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your relevant experience, skills, or past volunteer work."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                errors.experienceSummary ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.experienceSummary && (
              <p className="text-red-500 text-xs mt-1">{errors.experienceSummary}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formData.experienceSummary.length}/1000 characters</p>
          </div>

          {/* Availability Confirmation (Required for create) */}
          {!isEdit && (
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availabilityConfirmed"
                  checked={formData.availabilityConfirmed}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700">
                    I confirm my availability <span className="text-red-500">*</span>
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    I confirm that I am available during the project timeline and can commit the time needed.
                  </p>
                </div>
              </label>
              {errors.availabilityConfirmed && (
                <p className="text-red-500 text-xs mt-1">{errors.availabilityConfirmed}</p>
              )}
            </div>
          )}

          {/* Preferred Role (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Preferred Role <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="preferredRole"
              value={formData.preferredRole}
              onChange={handleChange}
              placeholder="e.g., Team Lead, Content Writer, Field Coordinator"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Expected Contribution Hours (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Expected Contribution Hours <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              name="expectedHours"
              value={formData.expectedHours}
              onChange={handleChange}
              placeholder="e.g., 20"
              min={1}
              max={500}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.expectedHours ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.expectedHours && (
              <p className="text-red-500 text-xs mt-1">{errors.expectedHours}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Submitting..."
                : isEdit
                ? "Update Request"
                : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipationFormModal;
