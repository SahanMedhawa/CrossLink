import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Globe,
  Phone,
  ShieldCheck,
  ArrowRight,
  Target,
  Briefcase,
  Hash,
  ExternalLink
} from "lucide-react";

/* ---------- INFO ROW ---------- */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
      <Icon size={15} strokeWidth={2.5} />
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase font-bold text-blue-600">
        {label}
      </p>
      <p className="text-xs font-semibold text-slate-800 truncate">
        {value}
      </p>
    </div>
  </div>
);

/* ---------- NGO CARD ---------- */
const NGOCard = ({ ngo }) => {
  const navigate = useNavigate();

  const displayName = ngo.organizationName || "Organization";

  // Routes using URL params
  const profileRoute = `/ngo/${ngo._id}`;
  const projectsRoute = `/ngo/${ngo._id}/projects`; // <- pass NGO ID in URL

  return (
    <div className="group bg-gradient-to-b from-white to-blue-50 border-2 border-blue-200 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-2 hover:bg-gradient-to-b hover:from-blue-50 hover:to-blue-100">

      {/* ================= HEADER ================= */}
      <div className="relative bg-gradient-to-br from-[#0052CC] via-[#1E40AF] to-[#3B82F6] p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="flex items-center gap-5 relative z-10">

          {ngo.photoURL ? (
            <img
              src={ngo.photoURL}
              alt={displayName}
              className="
                w-24 h-24
                rounded-full
                object-cover
                border-[4px] border-white
                shadow-xl
                transition-transform duration-300
                group-hover:scale-110
              "
            />
          ) : (
            <div className="
                w-24 h-24
                rounded-full
                bg-gradient-to-br from-blue-300 to-blue-500
                flex items-center justify-center
                text-3xl font-black
                border-[4px] border-white
                shadow-xl
              ">
              {displayName.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className="text-xl font-extrabold break-words whitespace-normal text-white drop-shadow-sm"
              title={displayName}
            >
              {displayName}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-100 mt-1 bg-white/20 w-fit px-2 py-1 rounded-full">
              <ShieldCheck size={13} />
              Verified NGO
            </div>
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-6 space-y-4 flex-grow bg-white">
        {ngo.location && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-blue-100 px-3 py-2 rounded-lg border-l-4 border-blue-500">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <span>{ngo.location}</span>
          </div>
        )}

        {ngo.bio && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 px-4 py-3 rounded-lg">
            <p className="text-xs text-slate-700 italic line-clamp-3">
              "{ngo.bio}"
            </p>
          </div>
        )}

        {ngo.registrationNumber && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-md w-fit border border-blue-300 font-semibold text-blue-700">
            <Hash size={12} />
            {ngo.registrationNumber}
          </div>
        )}

        {ngo.website && (
          <a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors w-fit"
          >
            <Globe size={14} />
            Official Website
          </a>
        )}

        <button
          onClick={() => navigate(profileRoute)}
          className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors w-fit"
        >
          <ExternalLink size={14} />
          View NGO Profile
        </button>
      </div>

      {/* ================= IMPACT AREAS ================= */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-blue-600" />
          <span className="text-[10px] font-black text-blue-700 uppercase">
            Impact Areas
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ngo.focusAreas?.length ? (
            ngo.focusAreas.slice(0, 3).map((area, i) => (
              <span key={i} className="px-3 py-1 text-[10px] font-bold bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 rounded-full border-2 border-blue-300 shadow-sm">
                {area}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 italic">General NGO</span>
          )}
        </div>
      </div>

      {/* ================= CONTACT ================= */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-t-2 border-blue-300 px-6 py-4">
        {ngo.phone && (
          <InfoRow icon={Phone} label="Contact" value={ngo.phone} />
        )}
      </div>

      {/* ================= PROJECT CTA ================= */}
      <div className="p-6 pt-4">
        <button
          onClick={() => navigate(projectsRoute)} // <- navigates to `/ngo/:id/projects`
          className="
            w-full
            bg-gradient-to-r from-[#0052CC] to-[#1E40AF]
            hover:from-[#0047B2] hover:to-[#1a3592]
            text-white
            text-xs
            font-black
            py-3 px-4
            rounded-xl
            flex items-center justify-center gap-2
            transition-all duration-300
            active:scale-95
            shadow-lg
            hover:shadow-xl
            border-2 border-blue-300
          "
        >
          <Briefcase size={16} />
          VIEW NGO PROJECTS
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default NGOCard;