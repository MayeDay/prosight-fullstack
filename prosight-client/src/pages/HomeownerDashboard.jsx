// src/pages/HomeownerDashboard.jsx
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { usePostProject } from "../hooks/usePostProject";
import { projectsApi } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { CATEGORY_IMAGES } from "../data/constants";
import PostProjectModal from "../components/PostProjectModal";
import ProProfileModal from "../components/ProProfileModal";

// ── Leave review panel ────────────────────────────────────────────────────
function LeaveReviewPanel({ project, onClose }) {
  const { submitReview, showToast } = useApp();
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { showToast("Please select a star rating", "error"); return; }
    setSaving(true);
    try {
      await submitReview(project.id, rating, comment);
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#ffb43c" }}>
        Leave a Review for {project.pro?.name}
      </div>

      {/* Star picker */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 26,
              color: star <= (hover || rating) ? "#ffb43c" : "#3a3630",
              padding: 0,
              lineHeight: 1,
              transition: "color 0.1s",
            }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: 13, color: "#7a7672", alignSelf: "center", marginLeft: 4 }}>
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </span>
        )}
      </div>

      <textarea
        className="input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this pro… (optional)"
        style={{ minHeight: 72, marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-gold" onClick={handleSubmit} disabled={saving} style={{ flex: 1 }}>
          {saving ? "Submitting…" : "Submit Review"}
        </button>
        <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Applicant review panel ─────────────────────────────────────────────────
function ApplicantReview({ project, onAccept, onClose }) {
  const { showToast } = useApp();
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getApplications(project.id);
      setApplications(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load on first render
  if (applications === null && !loading) load();

  return (
    <div
      style={{
        marginTop: 16,
        borderTop: "1px solid rgba(255,255,255,.07)",
        paddingTop: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#ffb43c" }}>
        Applicants
      </div>

      {loading && (
        <div style={{ color: "#7a7672", fontSize: 13 }}>Loading applicants…</div>
      )}

      {applications?.length === 0 && (
        <div style={{ color: "#7a7672", fontSize: 13 }}>No applicants yet.</div>
      )}

      {applications?.map((app) => (
        <div
          key={app.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,.04)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              {app.pro.name}{" "}
              {app.pro.averageRating && (
                <span style={{ color: "#ffb43c" }}>
                  ⭐ {app.pro.averageRating.toFixed(1)}
                </span>
              )}
            </div>
            <div style={{ color: "#7a7672", fontSize: 12 }}>
              {app.pro.profession} · ${app.pro.hourlyRate}/hr ·{" "}
              {app.pro.reviewCount} review{app.pro.reviewCount !== 1 ? "s" : ""}
            </div>
          </div>
          <button className="btn-gold" onClick={() => onAccept(project.id, app.pro.id)}>
            Accept
          </button>
        </div>
      ))}

      <button
        className="btn-ghost"
        onClick={onClose}
        style={{ marginTop: 4, fontSize: 12 }}
      >
        Close
      </button>
    </div>
  );
}

// ── My Projects tab ────────────────────────────────────────────────────────
function MyProjectsTab() {
  const { myProjects, acceptApplicant, approveCompletion, setActiveTab, setSelectedProject, loading } =
    useApp();
  const postProjectHook = usePostProject();
  const [reviewingId, setReviewingId]               = useState(null);
  const [leavingReviewId, setLeavingReviewId]       = useState(null);

  const handleAccept = async (projectId, proId) => {
    await acceptApplicant(projectId, proId);
    setReviewingId(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            My Projects
          </h2>
          <p style={{ color: "#7a7672", fontSize: 14, marginTop: 4 }}>
            Track your DIY projects and hired pros
          </p>
        </div>
        <button className="btn-gold" onClick={() => postProjectHook.setOpen(true)}>
          + Post New Project
        </button>
      </div>

      {loading && (
        <div style={{ color: "#7a7672", textAlign: "center", padding: 40 }}>
          Loading projects…
        </div>
      )}

      {!loading && myProjects.length === 0 && (
        <div
          className="card"
          style={{ textAlign: "center", padding: 48, color: "#7a7672" }}
        >
          No projects yet. Post your first one!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {myProjects.map((p) => (
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
                  <img
                    src={CATEGORY_IMAGES[p.category]}
                    alt={p.category}
                    className="category-thumb"
                  />
                )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 17 }}>{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p style={{ color: "#7a7672", fontSize: 13, marginBottom: 10 }}>
                  {p.description}
                </p>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#a8a4a0", flexWrap: "wrap" }}>
                  <span>📂 {p.category}</span>
                  <span>💰 ${p.budget} budget</span>
                  {p.pro && <span>🔧 Pro: {p.pro.name}</span>}
                  {p.status === "open" && (
                    <span>
                      👥 {p.applicationCount} applicant
                      {p.applicationCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {p.status === "in-progress" && p.ownerApprovedComplete && !p.proApprovedComplete && (
                    <span style={{ color: "#ffb43c" }}>⏳ Waiting for pro to approve</span>
                  )}
                </div>
              </div>{/* inner flex */}
              </div>{/* outer flex with thumb */}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.status === "open" && p.applicationCount > 0 && (
                  <button
                    className="btn-gold"
                    onClick={() =>
                      setReviewingId(reviewingId === p.id ? null : p.id)
                    }
                  >
                    Review Applicants
                  </button>
                )}
                {p.status === "in-progress" && (
                  <button
                    className="btn-gold"
                    onClick={() => {
                      setSelectedProject(p);
                      setActiveTab("messages");
                    }}
                  >
                    Open Chat
                  </button>
                )}
                {p.status === "in-progress" && (
                  <button
                    className={p.ownerApprovedComplete ? "btn-ghost" : "btn-gold"}
                    disabled={p.ownerApprovedComplete}
                    onClick={() => approveCompletion(p.id)}
                    style={p.ownerApprovedComplete ? { cursor: "default", opacity: 0.6 } : {}}
                  >
                    {p.ownerApprovedComplete
                      ? "✓ You approved"
                      : "Mark Complete"}
                  </button>
                )}
                {p.status === "completed" && p.pro && !p.reviewedByOwner && (
                  <button
                    className="btn-gold"
                    onClick={() => setLeavingReviewId(leavingReviewId === p.id ? null : p.id)}
                  >
                    ⭐ Leave a Review
                  </button>
                )}
                {p.status === "completed" && p.reviewedByOwner && (
                  <span style={{ fontSize: 13, color: "#7a7672", alignSelf: "center" }}>
                    ✓ Reviewed
                  </span>
                )}
              </div>
            </div>

            {reviewingId === p.id && (
              <ApplicantReview
                project={p}
                onAccept={handleAccept}
                onClose={() => setReviewingId(null)}
              />
            )}
            {leavingReviewId === p.id && (
              <LeaveReviewPanel
                project={p}
                onClose={() => setLeavingReviewId(null)}
              />
            )}
          </div>
        ))}
      </div>

      <PostProjectModal {...postProjectHook} />
    </div>
  );
}

// ── Find Pros tab ──────────────────────────────────────────────────────────
function FindProsTab() {
  const { pros, showToast } = useApp();
  const [viewingProId, setViewingProId] = useState(null);

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
        Find a Pro
      </h2>
      <p style={{ color: "#7a7672", fontSize: 14, marginBottom: 24 }}>
        Professionals available for project oversight
      </p>

      {viewingProId && (
        <ProProfileModal proId={viewingProId} onClose={() => setViewingProId(null)} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {pros.map((pro) => (
          <div
            key={pro.id}
            className="card"
            style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ffb43c, #e07b00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                flexShrink: 0,
                color: "#0f1117",
              }}
            >
              {pro.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>
                    {pro.name}{" "}
                    {pro.averageRating && (
                      <span style={{ color: "#ffb43c", fontSize: 14 }}>
                        ⭐ {pro.averageRating.toFixed(1)} ({pro.reviewCount})
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#7a7672", fontSize: 13, marginBottom: 6 }}>
                    {pro.profession} · ${pro.hourlyRate}/hr oversight
                  </div>
                </div>
                <button
                  className="btn-gold"
                  onClick={() => setViewingProId(pro.id)}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page router ────────────────────────────────────────────────────────────
export default function HomeownerDashboard() {
  const { activeTab } = useApp();
  if (activeTab === "my-projects") return <MyProjectsTab />;
  if (activeTab === "browse") return <FindProsTab />;
  return null;
}
