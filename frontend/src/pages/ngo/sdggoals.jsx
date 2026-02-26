import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_BASE = "http://localhost:5000/api/sdg";

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

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading SDG Data...</p>
    </div>
  );

  if (error) return (
    <div style={styles.loadingScreen}>
      <span style={{ fontSize: 48 }}>⚠️</span>
      <p style={{ ...styles.loadingText, color: "#f87171" }}>{error}</p>
      <button onClick={() => window.location.reload()} style={styles.retryBtn}>Retry</button>
    </div>
  );

  return (
    <DashboardLayout userType="ngo">
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>🌐</div>
            <div>
              <h1 style={styles.headerTitle}>SDG Dashboard</h1>
              <p style={styles.headerSub}>Sustainable Development Goals · Sri Lanka</p>
            </div>
          </div>
          <div style={styles.scoreCard}>
            <span style={styles.scoreLabel}>Total Goals</span>
            <span style={styles.scoreValue}>{goals.length}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={styles.tabs}>
        {["goals", "srilanka", ...(selectedGoal ? ["targets"] : [])].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "goals" ? "🎯 All Goals" : tab === "srilanka" ? "🇱🇰 Sri Lanka" : `📋 Goal ${selectedGoal} Targets`}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main style={styles.main}>

        {/* GOALS TAB */}
        {activeTab === "goals" && (
          <div style={styles.goalsGrid}>
            {goals.map((goal, idx) => {
              const num = Number(goal.code) || idx + 1;
              const color = SDG_COLORS[num - 1] || SDG_COLORS[0];
              const icon = SDG_ICONS[num - 1] || "🌍";
              return (
                <div
                  key={goal.code || idx}
                  className="goal-card"
                  style={{ ...styles.goalCard, "--card-color": color }}
                  onClick={() => fetchTargets(goal.code)}
                >
                  <div style={{ ...styles.goalHeader, background: color }}>
                    <span style={styles.goalNum}>SDG {num}</span>
                    <span style={styles.goalIcon}>{icon}</span>
                  </div>
                  <div style={styles.goalBody}>
                    <h3 style={styles.goalTitle}>{goal.title}</h3>
                    <p style={styles.goalDesc}>{goal.description?.slice(0, 90)}...</p>
                    <div style={styles.goalFooter}>
                      <span style={{ ...styles.viewBtn, background: color }}>View Targets →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SRI LANKA TAB */}
        {activeTab === "srilanka" && (
          <div>
            <div style={styles.slHero}>
              <h2 style={styles.slTitle}>🇱🇰 Sri Lanka SDG Overview</h2>
              <p style={styles.slSub}>All 17 Sustainable Development Goals with targets</p>
            </div>
            <div style={styles.progressGrid}>
              {sriLankaGoals.map((goal, idx) => {
                const num = Number(goal.code) || idx + 1;
                const color = SDG_COLORS[num - 1] || SDG_COLORS[0];
                const targetCount = goal.targets?.length || 0;
                return (
                  <div
                    key={goal.code || idx}
                    style={styles.progressCard}
                    className="goal-card"
                    onClick={() => fetchTargets(goal.code)}
                  >
                    <div style={styles.progressTop}>
                      <span style={{ ...styles.progressBadge, background: color }}>SDG {num}</span>
                      <span style={styles.progressScore}>{targetCount} targets</span>
                    </div>
                    <p style={styles.progressGoalName}>{goal.title}</p>
                    <div style={styles.progressBar}>
                      <div
                        className="progress-fill"
                        style={{ ...styles.progressFill, width: `${Math.min(targetCount * 10, 100)}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TARGETS TAB */}
        {activeTab === "targets" && (
          <div>
            <div style={styles.targetsHeader}>
              <button style={styles.backBtn} onClick={() => setActiveTab("goals")}>← Back to Goals</button>
              <h2 style={styles.targetsTitle}>
                <span style={{ ...styles.targetsBadge, background: SDG_COLORS[(Number(selectedGoal) || 1) - 1] }}>
                  SDG {selectedGoal}
                </span>
                Targets
              </h2>
            </div>
            {targetsLoading ? (
              <div style={styles.loadingInline}><div style={styles.spinner}></div></div>
            ) : targets.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: 60 }}>No targets found for this goal.</p>
            ) : (
              <div style={styles.targetsList}>
                {targets.map((target, idx) => {
                  const code = target.code || target.target || `${selectedGoal}.${idx + 1}`;
                  const desc = target.title || target.description || "No description available.";
                  return (
                    <div key={code} className="target-card" style={styles.targetCard}>
                      <div style={{ ...styles.targetCode, background: SDG_COLORS[(Number(selectedGoal) || 1) - 1] }}>
                        {code}
                      </div>
                      <div style={styles.targetContent}>
                        <p style={styles.targetDesc}>{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    </DashboardLayout>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Georgia', serif" },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d1b2a", color: "#fff", gap: 16 },
  loadingText: { fontSize: 18, color: "#94a3b8", fontFamily: "Georgia, serif" },
  spinner: { width: 44, height: 44, border: "3px solid #1e3a5f", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  retryBtn: { padding: "10px 24px", background: "#38bdf8", color: "#0d1b2a", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  header: { background: "#0d1b2a", borderBottom: "1px solid #1e3a5f", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1280, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logo: { fontSize: 36 },
  headerTitle: { margin: 0, fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" },
  headerSub: { margin: 0, fontSize: 13, color: "#64748b", marginTop: 2 },
  scoreCard: { background: "#1e3a5f", border: "1px solid #2d5280", borderRadius: 12, padding: "10px 20px", textAlign: "center" },
  scoreLabel: { display: "block", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  scoreValue: { display: "block", fontSize: 28, fontWeight: 700, color: "#38bdf8" },
  tabs: { background: "#fff", borderBottom: "2px solid #e2e8f0", display: "flex", padding: "0 24px", overflowX: "auto" },
  tab: { padding: "14px 24px", background: "none", border: "none", borderBottom: "3px solid transparent", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" },
  tabActive: { color: "#0d1b2a", borderBottomColor: "#0d1b2a" },
  main: { maxWidth: 1280, margin: "0 auto", padding: "32px 24px" },
  goalsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 },
  goalCard: { background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  goalHeader: { padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  goalNum: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700 },
  goalIcon: { fontSize: 28 },
  goalBody: { padding: "16px 20px" },
  goalTitle: { margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 },
  goalDesc: { margin: "0 0 16px", fontSize: 13, color: "#64748b", lineHeight: 1.6 },
  goalFooter: { display: "flex", justifyContent: "flex-end" },
  viewBtn: { fontSize: 12, fontWeight: 700, color: "#fff", padding: "6px 14px", borderRadius: 20 },
  slHero: { background: "linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)", borderRadius: 20, padding: "40px 36px", marginBottom: 28, color: "#fff" },
  slTitle: { margin: "0 0 8px", fontSize: 32, fontWeight: 700 },
  slSub: { margin: 0, color: "#94a3b8", fontSize: 16 },
  progressGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 },
  progressCard: { background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer" },
  progressTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  progressBadge: { fontSize: 12, fontWeight: 700, color: "#fff", padding: "3px 10px", borderRadius: 20 },
  progressScore: { fontSize: 14, fontWeight: 600, color: "#475569" },
  progressGoalName: { margin: "0 0 10px", fontSize: 13, color: "#64748b" },
  progressBar: { height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  targetsHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  backBtn: { background: "none", border: "2px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600, color: "#475569", fontSize: 14 },
  targetsTitle: { display: "flex", alignItems: "center", gap: 12, margin: 0, fontSize: 24, fontWeight: 700, color: "#1e293b" },
  targetsBadge: { color: "#fff", fontSize: 14, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  targetsList: { display: "flex", flexDirection: "column", gap: 14 },
  targetCard: { background: "#fff", borderRadius: 14, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  targetCode: { color: "#fff", fontWeight: 700, fontSize: 15, padding: "6px 14px", borderRadius: 10, whiteSpace: "nowrap", flexShrink: 0 },
  targetContent: { flex: 1 },
  targetDesc: { margin: 0, fontSize: 15, color: "#334155", lineHeight: 1.7 },
  loadingInline: { display: "flex", justifyContent: "center", padding: 60 },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .goal-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
  .target-card:hover { transform: translateX(4px); }
  * { box-sizing: border-box; }
`;