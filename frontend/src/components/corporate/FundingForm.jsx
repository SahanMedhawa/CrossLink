import React, { useState } from 'react';

const FundingForm = ({ project, existingData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Map 'note' from backend to 'message' in UI if needed, but let's stick to backend names for simplicity
    fundingTitle: existingData?.fundingTitle || `Funding for ${project.title}`,
    amount: existingData?.amount || '',
    fundingType: existingData?.fundingType || 'Cash',
    paymentMethod: existingData?.paymentMethod || 'Bank Transfer',
    note: existingData?.note || '', // Backend expects 'note', not 'message'
    transactionId: existingData?.transactionId || '', // Optional extra field
    projectId: existingData?.projectId?._id || project._id 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {existingData ? 'Edit Funding Record' : 'Add Funding'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">For: {project.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Funding Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funding Title *</label>
            <input
              type="text"
              required
              value={formData.fundingTitle}
              onChange={(e) => setFormData({ ...formData, fundingTitle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="e.g., Q1 2026 Support Grant"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">LKR</span>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-semibold"
                placeholder="50000"
              />
            </div>
          </div>

          {/* Type & Method Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.fundingType}
                onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="In-Kind">In-Kind</option>
                <option value="Resource">Resource</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Transaction ID (Optional based on your model, but good to have) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction / Ref ID (Optional)</label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g., TXN123456"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message / Note (Optional)</label>
            <textarea
              rows="3"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Any additional details..."
            />
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition transform active:scale-95"
          >
            {existingData ? 'Update Record' : 'Confirm Funding'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundingForm;