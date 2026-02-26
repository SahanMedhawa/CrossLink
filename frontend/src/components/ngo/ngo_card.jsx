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
  <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-blue-50 transition">
    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-100 text-blue-700">
      <Icon size={15} strokeWidth={2.5} />
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </p>
      <p className="text-xs font-semibold text-slate-700 truncate">
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
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1">

      {/* ================= HEADER ================= */}
      <div className="relative bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] p-8 text-white">
        <div className="flex items-center gap-5">

          {ngo.photoURL ? (
            <img
              src={ngo.photoURL}
              alt={displayName}
              className="
                w-24 h-24
                rounded-full
                object-cover
                border-[4px] border-white/40
                shadow-xl
                transition-transform duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <div className="
                w-24 h-24
                rounded-full
                bg-white/20
                flex items-center justify-center
                text-3xl font-black
                border-[4px] border-white/40
                shadow-xl
              ">
              {displayName.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold truncate">{displayName}</h3>
            <div className="flex items-center gap-1 text-xs font-bold opacity-90 mt-1">
              <ShieldCheck size={13} />
              Verified NGO
            </div>
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-6 space-y-4 flex-grow">
        {ngo.location && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <MapPin size={14} className="text-blue-600" />
            {ngo.location}
          </div>
        )}

        {ngo.bio && (
          <p className="text-xs text-slate-500 italic line-clamp-3">
            "{ngo.bio}"
          </p>
        )}

        {ngo.registrationNumber && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-100 px-3 py-1.5 rounded-md w-fit border">
            <Hash size={12} />
            {ngo.registrationNumber}
          </div>
        )}

        {ngo.website && (
          <a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <Globe size={14} />
            Official Website
          </a>
        )}

        <button
          onClick={() => navigate(profileRoute)}
          className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900"
        >
          <ExternalLink size={14} />
          View NGO Profile
        </button>
      </div>

      {/* ================= IMPACT AREAS ================= */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-blue-700" />
          <span className="text-[10px] font-black text-slate-400 uppercase">
            Impact Areas
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ngo.focusAreas?.length ? (
            ngo.focusAreas.slice(0, 3).map((area, i) => (
              <span key={i} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded border">
                {area}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">General NGO</span>
          )}
        </div>
      </div>

      {/* ================= CONTACT ================= */}
      <div className="bg-slate-50 border-t px-6 py-4">
        {ngo.phone && (
          <InfoRow icon={Phone} label="Contact" value={ngo.phone} />
        )}
      </div>

      {/* ================= PROJECT CTA ================= */}
      <div className="p-6 pt-2">
        <button
          onClick={() => navigate(projectsRoute)} // <- navigates to `/ngo/:id/projects`
          className="
            w-full
            bg-[#1E40AF]
            hover:bg-[#1e3a8a]
            text-white
            text-xs
            font-black
            py-3.5
            rounded-xl
            flex items-center justify-center gap-2
            transition
            active:scale-95
            shadow-lg
          "
        >
          <Briefcase size={15} />
          VIEW NGO PROJECTS
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default NGOCard;