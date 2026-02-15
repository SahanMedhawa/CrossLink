import React from 'react';
import { 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Target,
  Users,
  Phone,
  Award,
  Briefcase,
  ExternalLink,
  Heart,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const NGOCard = ({ ngo }) => {
  const displayName = ngo.organizationName || ngo.name || "Unnamed Organization";

  return (
    <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-blue-100 rounded-[2rem] transition-all duration-700 flex flex-col h-full hover:border-blue-400 hover:shadow-[0_20px_70px_-15px_rgba(59,130,246,0.5)] overflow-hidden hover:-translate-y-2">
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-[4rem] transition-all duration-500 group-hover:scale-150 group-hover:rotate-12"></div>

      {/* Header Section with dramatic layout */}
      <div className="relative p-8 pb-6">
        
        {/* Logo with floating effect */}
        <div className="relative mb-6 group/logo">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          
          {ngo.photoURL ? (
            <img
              src={ngo.photoURL}
              alt={displayName}
              className="relative w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
            />
          ) : (
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              {displayName.charAt(0)}
            </div>
          )}

          {ngo.isVerified && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-full border-4 border-white shadow-xl animate-pulse">
              <ShieldCheck size={20} strokeWidth={3} />
            </div>
          )}

          {/* Floating sparkle decoration */}
          <div className="absolute -top-4 -left-4 text-yellow-400 opacity-0 group-hover/logo:opacity-100 transition-all duration-500 group-hover/logo:animate-bounce">
            <Sparkles size={20} fill="currentColor" />
          </div>
        </div>

        {/* Organization Name with gradient */}
        <h3 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight mb-2 tracking-tight">
          {displayName}
        </h3>

        {/* Location with icon */}
        {ngo.location && (
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-4 group-hover:text-blue-600 transition-colors duration-300">
            <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
              <MapPin size={14} className="text-blue-600" />
            </div>
            {ngo.location}
          </div>
        )}

        {/* Bio with better spacing */}
        {ngo.bio && (
          <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-3 mb-5">
            {ngo.bio}
          </p>
        )}

        {/* Website badge - floating */}
        {ngo.website && (
          <a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-bold text-xs transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 px-4 py-2.5 rounded-xl border border-blue-200 hover:border-purple-300 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <Globe size={14} strokeWidth={2.5} />
            <span className="max-w-[140px] truncate">
              {ngo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
            <ExternalLink size={11} strokeWidth={2.5} />
          </a>
        )}
      </div>

      {/* Focus Areas - Dynamic pill design */}
      <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-y border-blue-100/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <Target size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="text-xs font-black bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent uppercase tracking-widest">
            Impact Areas
          </p>
          <div className="ml-auto">
            <TrendingUp size={16} className="text-blue-400 animate-pulse" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ngo.focusAreas?.length > 0 ? (
            ngo.focusAreas.map((area, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group/pill bg-gradient-to-r from-white to-blue-50 hover:from-blue-600 hover:to-purple-600 text-blue-700 hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-tight rounded-full border-2 border-blue-200 hover:border-transparent shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:-rotate-2 cursor-default"
              >
                {area}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs font-medium italic flex items-center gap-2">
              <Heart size={14} className="text-pink-400" />
              General Community Impact
            </span>
          )}
        </div>
      </div>

      {/* Contact Information - Card style */}
      <div className="relative px-8 py-6 flex-grow space-y-4">
        
        {/* Contact Person */}
        {ngo.contactPerson && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md group/contact">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover/contact:scale-110 transition-transform duration-300">
              <Users size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-grow">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1.5">
                Contact Person
              </p>
              <p className="text-sm font-bold text-slate-900">
                {ngo.contactPerson}
              </p>
            </div>
          </div>
        )}

        {/* Phone */}
        {ngo.phone && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-white to-purple-50/50 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md group/phone">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover/phone:scale-110 transition-transform duration-300">
              <Phone size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-grow">
              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest leading-none mb-1.5">
                Phone Number
              </p>
              <p className="text-sm font-bold text-slate-900">
                {ngo.phone}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Section - Bold CTA */}
      <div className="relative p-8 pt-6 mt-auto">
        <button
          onClick={() => window.location.href = `/ngo/${ngo._id}/projects`}
          className="relative w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_25px_50px_-5px_rgba(168,85,247,0.7)] uppercase tracking-wide text-sm overflow-hidden group/btn"
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
          
          <Briefcase size={20} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform duration-300" />
          <span className="relative">View Projects</span>
          <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
        </button>

        {ngo.isVerified && (
          <div className="flex items-center justify-center gap-2 mt-5 text-blue-600 font-bold text-xs animate-pulse">
            <Award size={16} strokeWidth={2.5} className="text-yellow-500" />
            <span className="uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verified Organization
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOCard;