import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Helper component to handle map clicks
function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
}

const ProposalForm = ({ project, existingData, onClose, onSubmit }) => {
  // Default coordinates (Colombo) if no existing data
  const defaultLat = existingData?.deliveryLocation?.coordinates?.lat || 6.9271;
  const defaultLng = existingData?.deliveryLocation?.coordinates?.lng || 79.8612;

  const [formData, setFormData] = useState({
    title: existingData?.proposalTitle || '',
    description: existingData?.description || '',
    amount: existingData?.amount || '',
    locationName: existingData?.deliveryLocation?.address || project?.location || '',
    latitude: defaultLat,
    longitude: defaultLng,
  });

  const [markerPosition, setMarkerPosition] = useState([defaultLat, defaultLng]);

  const handleMapClick = (latlng) => {
    setMarkerPosition([latlng.lat, latlng.lng]);
    setFormData({ 
      ...formData, 
      latitude: latlng.lat, 
      longitude: latlng.lng 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ TRANSFORM DATA TO MATCH BACKEND SCHEMA
    const finalData = {
      proposalTitle: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      // Adding default values for required fields not in UI yet
      expectedImpact: "To drive positive social change and support the proposed initiative effectively.", 
      message: "We are committed to partnering with you to make this project a success.",
      
      deliveryLocation: {
        address: formData.locationName,
        coordinates: {
          lat: formData.latitude,
          lng: formData.longitude
        }
      },
      
      projectId: project._id
    };
    
    console.log("🚀 Submitting to Backend:", finalData);
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {existingData ? 'Edit Proposal' : 'Send New Proposal'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-grow">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Youth Skill Development Program"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Funding Amount (LKR)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="50000"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description & Impact</label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Describe how this project will help the community..."
            />
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Kandy City Center"
            />
          </div>

          {/* Interactive Map */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden h-64 relative z-0">
              <MapContainer 
                center={markerPosition} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={markerPosition} />
                <LocationPicker setLocation={(latlng) => handleMapClick(latlng)} />
              </MapContainer>
              <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1.5 text-xs font-medium rounded shadow-md z-[400] pointer-events-none">
                📍 Click anywhere on the map to set location
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex gap-4">
              <span>Lat: <strong>{formData.latitude.toFixed(4)}</strong></span>
              <span>Lng: <strong>{formData.longitude.toFixed(4)}</strong></span>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
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
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition transform active:scale-95"
          >
            {existingData ? 'Update Proposal' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;