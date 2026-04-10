import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_BASE = import.meta.env.VITE_SDG_API_PATH || "/api/sdg";

const SDG_COLORS = [
  "#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21",
  "#26BDE2","#FCC30B","#A21942","#FD6925","#DD1367",
  "#FD9D24","#BF8B2E","#3F7E44","#0A97D9","#56C02B",
  "#00689D","#19486A"
];

const SDG_ICONS = ["🏹","🍽️","🏥","📚","⚖️","💧","⚡","💼","🏗️","🌆","♻️","🌱","🌊","🦁","☮️","🤝","🌍"];

export default function SDGDashboard() {
  const [goals, setGoals] = useState([]);
  const [sriLankaGoals, setSriLankaGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [targets, setTargets] = useState([]);
  const [activeTab, setActiveTab] = useState("goals");
  const [loading, setLoading] = useState(true);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/goals`).then(r => r.json()),
      fetch(`${API_BASE}/srilanka`).then(r => r.json()),
    ]).then(([goalsData, slData]) => {
      // API returns { success: true, goals: [...] }
      setGoals(Array.isArray(goalsData.goals) ? goalsData.goals : []);
      setSriLankaGoals(Array.isArray(slData.goals) ? slData.goals : []);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  const fetchTargets = async (goalCode) => {
    setTargetsLoading(true);
    setSelectedGoal(goalCode);
    setActiveTab("targets");
    try {
      const data = await fetch(`${API_BASE}/goals/${goalCode}/targets`).then(r => r.json());
      // API returns { success: true, targets: [...] }
      setTargets(Array.isArray(data.targets) ? data.targets : []);
    } catch {
      setTargets([]);
    }
    setTargetsLoading(false);
  };

  const getGoalMeta = (goal, idx) => {
    const num = Number(goal.code) || idx + 1;
    return {
      num,
      color: SDG_COLORS[num - 1] || SDG_COLORS[0],
      icon: SDG_ICONS[num - 1] || "G",
    };
  };

  const truncate = (text, max = 105) => {
    if (!text || typeof text !== "string") return "No description available.";
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  if (loading) return (
    <DashboardLayout userType="ngo">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
        <div className="mx-auto h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading SDG data...</p>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout userType="ngo">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 font-semibold mb-3">Failed to load SDG data</p>
        <p className="text-red-600 text-sm mb-5">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout userType="ngo">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">SDG Goals</h2>
              <p className="text-blue-100 text-sm">Sustainable Development Goals with Sri Lanka targets</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2">
              <span className="text-white text-sm font-medium">Total Goals:</span>
              <span className="text-white text-sm font-bold">{goals.length}</span>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-6">
            <p className="text-blue-700 text-sm font-semibold mb-1">Global Goals</p>
            <p className="text-3xl font-bold text-blue-900">{goals.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm p-6">
            <p className="text-green-700 text-sm font-semibold mb-1">Total Targets</p>
            <p className="text-3xl font-bold text-green-900">
              {sriLankaGoals.reduce((sum, goal) => sum + (goal.targets?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm p-6">
            <p className="text-purple-700 text-sm font-semibold mb-1">Avg. Targets/Goal</p>
            <p className="text-3xl font-bold text-purple-900">
              {sriLankaGoals.length > 0
                ? (sriLankaGoals.reduce((sum, goal) => sum + (goal.targets?.length || 0), 0) / sriLankaGoals.length).toFixed(1)
                : 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
          <nav className="flex flex-wrap gap-2">
            {[
              { key: "goals", label: "All Goals" },
              { key: "srilanka", label: "Sri Lanka" },
              ...(selectedGoal ? [{ key: "targets", label: `Goal ${selectedGoal} Targets` }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg">
              <h3 className="text-3xl font-bold mb-2">Explore All 17 Goals</h3>
              <p className="text-blue-100 text-base">The United Nations Sustainable Development Goals are a universal call to action to end poverty, protect the planet, and ensure peace and prosperity by 2030.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {goals.map((goal, idx) => {
                const { num, color, icon } = getGoalMeta(goal, idx);
                return (
                  <button
                    key={goal.code || idx}
                    type="button"
                    onClick={() => fetchTargets(goal.code)}
                    className="text-left group relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: color }} />
                    
                    {/* Header with gradient */}
                    <div className="relative px-6 py-6 text-white" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-2xl">
                          {icon}
                        </span>
                        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">SDG {num}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-800 transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
                        {truncate(goal.description, 80)}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white py-2 px-4 rounded-lg transition-all" style={{ backgroundColor: color }}>
                        View Details
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "srilanka" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-1">Sri Lanka SDG Overview</h3>
              <p className="text-blue-100 text-sm">All 17 goals with target coverage</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sriLankaGoals.map((goal, idx) => {
                const { num, color } = getGoalMeta(goal, idx);
                const targetCount = goal.targets?.length || 0;
                return (
                  <button
                    key={goal.code || idx}
                    type="button"
                    onClick={() => fetchTargets(goal.code)}
                    className="text-left bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: color }}
                      >
                        SDG {num}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{targetCount}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2">{goal.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "targets" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("goals")}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to goals
              </button>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: SDG_COLORS[(Number(selectedGoal) || 1) - 1] }}
                >
                  SDG {selectedGoal}
                </span>
                Targets
              </h3>
            </div>

            {targetsLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="mx-auto h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading targets...</p>
              </div>
            ) : targets.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-gray-500">No targets found for this goal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {targets.map((target, idx) => {
                  const code = target.code || target.target || `${selectedGoal}.${idx + 1}`;
                  const desc = target.title || target.description || "No description available.";
                  return (
                    <div
                      key={code}
                      className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3"
                    >
                      <div
                        className="inline-flex items-center self-start rounded-lg px-3 py-1 text-sm font-bold text-white"
                        style={{ backgroundColor: SDG_COLORS[(Number(selectedGoal) || 1) - 1] }}
                      >
                        {code}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
