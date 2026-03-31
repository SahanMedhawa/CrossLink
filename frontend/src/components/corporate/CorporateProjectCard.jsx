import React from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';

const CorporateProjectCard = ({ project, onPropose, onFund }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col h-full">
      {/* Image */}
      <div className="h-48 w-full bg-gray-200 relative">
        {project.image ? (
          <img 
            src={resolveImageUrl(project.image)} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <span className="absolute top-3 right-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
          {project.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
          {project.focusArea}
        </span>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {project.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
          <div>📍 {project.location}</div>
          <div>📅 {new Date(project.startDate).toLocaleDateString()}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onPropose(project); }}
            className="py-2 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Send Proposal
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onFund(project); }}
            className="py-2 px-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Add Funding
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateProjectCard;