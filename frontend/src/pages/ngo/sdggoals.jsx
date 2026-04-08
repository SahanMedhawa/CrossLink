import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_BASE = "/api/sdg";

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {goals.map((goal, idx) => {
              const { num, color, icon } = getGoalMeta(goal, idx);
              return (
                <button
                  key={goal.code || idx}
                  type="button"
                  onClick={() => fetchTargets(goal.code)}
                  className="text-left bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="px-5 py-4 text-white" style={{ backgroundColor: color }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">SDG {num}</span>
                      <span className="text-xl" aria-hidden="true">{icon}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{goal.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{truncate(goal.description)}</p>
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: color }}
                    >
                      View targets
                    </span>
                  </div>
                </button>
              );
            })}
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
                      <span className="text-xs font-semibold text-gray-600">{targetCount} targets</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2">{goal.title}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(targetCount * 10, 100)}%`, backgroundColor: color }}
                      />
                    </div>
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
