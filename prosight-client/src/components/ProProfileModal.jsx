// src/components/ProProfileModal.jsx
import { useState, useEffect } from "react";
import { usersApi } from "../api/client";

export default function ProProfileModal({ proId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    usersApi.getProProfile(proId)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [proId]);

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: "80vh", overflowY: "auto" }}>
        {loading && (
          <div style={{ color: "#7a7672", textAlign: "center", padding: 40 }}>Loading…</div>
        )}
        {error && (
          <div style={{ color: "#e05c5c", textAlign: "center", padding: 40 }}>{error}</div>
        )}
        {profile && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ffb43c, #e07b00)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0f1117",
                  flexShrink: 0,
                }}
              >
                {profile.pro.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>
                  {profile.pro.name}
                  {profile.pro.averageRating && (
                    <span style={{ color: "#ffb43c", fontSize: 14, marginLeft: 10 }}>
                      ⭐ {profile.pro.averageRating.toFixed(1)} ({profile.pro.reviewCount})
                    </span>
                  )}
                </div>
                <div style={{ color: "#7a7672", fontSize: 13, marginTop: 2 }}>
                  {profile.pro.profession}
                  {profile.pro.hourlyRate && ` · $${profile.pro.hourlyRate}/hr`}
                </div>
              </div>
            </div>

            {/* Completed Projects */}
            <section style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#ffb43c", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
                Completed Projects ({profile.completedProjects.length})
              </div>
              {profile.completedProjects.length === 0 ? (
                <div style={{ color: "#7a7672", fontSize: 13 }}>No completed projects yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.completedProjects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "rgba(255,255,255,.04)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                        <div style={{ color: "#7a7672", fontSize: 12 }}>
                          {p.category} · for {p.owner.name}
                        </div>
                      </div>
                      <div style={{ color: "#7a7672", fontSize: 11 }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#ffb43c", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
                Reviews ({profile.reviews.length})
              </div>
              {profile.reviews.length === 0 ? (
                <div style={{ color: "#7a7672", fontSize: 13 }}>No reviews yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile.reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        background: "rgba(255,255,255,.04)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.reviewer.name}</div>
                        <div style={{ color: "#ffb43c", fontSize: 13 }}>
                          {"★".repeat(r.rating)}
                          <span style={{ color: "#3a3630" }}>{"★".repeat(5 - r.rating)}</span>
                        </div>
                      </div>
                      {r.comment && (
                        <div style={{ color: "#a8a4a0", fontSize: 13, lineHeight: 1.5 }}>{r.comment}</div>
                      )}
                      <div style={{ color: "#7a7672", fontSize: 11, marginTop: 6 }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              className="btn-ghost"
              onClick={onClose}
              style={{ width: "100%", marginTop: 20 }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
