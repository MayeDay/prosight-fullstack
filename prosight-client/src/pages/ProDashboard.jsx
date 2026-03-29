// src/pages/ProDashboard.jsx
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import ProProfileModal from "../components/ProProfileModal";
import { CATEGORY_IMAGES } from "../data/constants";

// ── Open Projects tab ──────────────────────────────────────────────────────
function OpenProjectsTab() {
  const { openProjects, currentUser, applyToProject, loading } = useApp();

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Open Projects
      </h2>
      <p style={{ color: "#7a7672", fontSize: 14, marginBottom: 24 }}>
        Homeowners looking for oversight on their DIY work
      </p>

      {loading && (
        <div style={{ color: "#7a7672", textAlign: "center", padding: 40 }}>
          Loading projects…
        </div>
      )}

      {!loading && openProjects.length === 0 && (
        <div
          className="card"
          style={{ textAlign: "center", padding: 48, color: "#7a7672" }}
        >
          No open projects right now. Check back soon!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {openProjects.map((p) => {
          const applied = p.currentUserApplied;
          return (
            <div key={p.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {CATEGORY_IMAGES[p.category] && (
                    <img src={CATEGORY_IMAGES[p.category]} alt={p.category} className="category-thumb" />
                  )}
                  <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>
                    {p.title}
                  </div>
                  <p
                    style={{
                      color: "#7a7672",
                      fontSize: 14,
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {p.description}
                  </p>
                  <div
                    style={{ display: "flex", gap: 16, fontSize: 13, color: "#a8a4a0" }}
                  >
                    <span>📂 {p.category}</span>
                    <span>💰 ${p.budget} budget</span>
                    <span>🏠 {p.owner.name}</span>
                    <span>
                      👥 {p.applicationCount} applicant
                      {p.applicationCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  </div>{/* inner */}
                </div>{/* outer with thumb */}

                <button
                  className={applied ? "btn-ghost" : "btn-gold"}
                  onClick={() => !applied && applyToProject(p.id)}
                  style={applied ? { cursor: "default" } : {}}
                >
                  {applied ? "✓ Applied" : "Apply to Oversee"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── My Jobs tab ────────────────────────────────────────────────────────────
function MyJobsTab() {
  const { myAcceptedProjects, approveCompletion, setSelectedProject, setActiveTab, loading } = useApp();

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        My Jobs
      </h2>
      <p style={{ color: "#7a7672", fontSize: 14, marginBottom: 24 }}>
        Projects you're currently overseeing
      </p>

      {loading && (
        <div style={{ color: "#7a7672", textAlign: "center", padding: 40 }}>
          Loading jobs…
        </div>
      )}

      {!loading && myAcceptedProjects.length === 0 && (
        <div
          className="card"
          style={{ textAlign: "center", padding: 48, color: "#7a7672" }}
        >
          No active jobs. Apply to open projects to get started.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {myAcceptedProjects.map((p) => (
          <div key={p.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
                {CATEGORY_IMAGES[p.category] && (
                  <img src={CATEGORY_IMAGES[p.category]} alt={p.category} className="category-thumb" />
                )}
                <div>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>
                  {p.title}
                </div>
                <div
                  style={{ display: "flex", gap: 16, fontSize: 13, color: "#a8a4a0", flexWrap: "wrap" }}
                >
                  <span>📂 {p.category}</span>
                  <span>🏠 {p.owner.name}</span>
                  <span>💰 ${p.budget}</span>
                  <StatusBadge status={p.status} />
                  {p.status === "in-progress" && p.proApprovedComplete && !p.ownerApprovedComplete && (
                    <span style={{ color: "#ffb43c" }}>⏳ Waiting for homeowner</span>
                  )}
                </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-gold"
                  onClick={() => {
                    setSelectedProject(p);
                    setActiveTab("messages");
                  }}
                >
                  Open Chat
                </button>
                {p.status === "in-progress" && (
                  <button
                    className={p.proApprovedComplete ? "btn-ghost" : "btn-gold"}
                    disabled={p.proApprovedComplete}
                    onClick={() => approveCompletion(p.id)}
                    style={p.proApprovedComplete ? { cursor: "default", opacity: 0.6 } : {}}
                  >
                    {p.proApprovedComplete ? "✓ You approved" : "Mark Complete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page router ────────────────────────────────────────────────────────────
export default function ProDashboard() {
  const { activeTab } = useApp();
  if (activeTab === "browse")  return <OpenProjectsTab />;
  if (activeTab === "my-jobs") return <MyJobsTab />;
  return null;
}
