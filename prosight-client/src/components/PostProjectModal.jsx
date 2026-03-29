// src/components/PostProjectModal.jsx
import { CATEGORIES } from "../data/constants";

export default function PostProjectModal({ form, updateField, open, cancel, submit, submitting }) {
  if (!open) return null;

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && cancel()}
    >
      <div className="modal">
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Post a Project
        </h3>
        <p style={{ color: "#7a7672", fontSize: 13, marginBottom: 22 }}>
          Describe your DIY project and what oversight you need
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              PROJECT TITLE *
            </label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Framing a basement wall"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              CATEGORY *
            </label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              OVERSIGHT BUDGET ($) *
            </label>
            <input
              className="input"
              type="number"
              value={form.budget}
              onChange={(e) => updateField("budget", e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              DESCRIPTION
            </label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your project and what kind of help you need…"
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              className="btn-gold"
              onClick={submit}
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? "Posting…" : "Post Project"}
            </button>
            <button className="btn-ghost" onClick={cancel} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
