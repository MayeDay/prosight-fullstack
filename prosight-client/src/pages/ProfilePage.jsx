// src/pages/ProfilePage.jsx
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ProfilePage() {
  const { currentUser, updateProfile, showToast } = useApp();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:       currentUser?.name       ?? "",
    email:      currentUser?.email      ?? "",
    location:   currentUser?.location   ?? "",
    bio:        currentUser?.bio        ?? "",
    profession: currentUser?.profession ?? "",
    hourlyRate: currentUser?.hourlyRate ?? "",
  });

  const isPro = currentUser?.role === "pro";

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    if (!form.email.trim()) { showToast("Email is required", "error"); return; }
    setSaving(true);
    try {
      await updateProfile({
        name:       form.name.trim(),
        email:      form.email.trim(),
        location:   form.location.trim() || null,
        bio:        form.bio.trim()      || null,
        profession: isPro ? (form.profession.trim() || null) : null,
        hourlyRate: isPro && form.hourlyRate !== "" ? Number(form.hourlyRate) : null,
      });
      setEditing(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name:       currentUser?.name       ?? "",
      email:      currentUser?.email      ?? "",
      location:   currentUser?.location   ?? "",
      bio:        currentUser?.bio        ?? "",
      profession: currentUser?.profession ?? "",
      hourlyRate: currentUser?.hourlyRate ?? "",
    });
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700 }}>
            My Profile
          </h2>
          <p style={{ color: "#7a7672", fontSize: 14, marginTop: 4 }}>
            {isPro ? "Your professional profile visible to homeowners" : "Your account information"}
          </p>
        </div>
        {!editing && (
          <button className="btn-gold" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffb43c, #e07b00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#0f1117",
              flexShrink: 0,
            }}
          >
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{currentUser?.name}</div>
            <div style={{ color: "#7a7672", fontSize: 13 }}>
              {currentUser?.role === "homeowner" ? "Homeowner" : "Professional"}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="Name"
            value={editing ? form.name : currentUser?.name}
            editing={editing}
            onChange={(v) => update("name", v)}
          />
          <Field
            label="Email"
            value={editing ? form.email : currentUser?.email}
            editing={editing}
            onChange={(v) => update("email", v)}
            type="email"
          />
          <Field
            label="Location"
            value={editing ? form.location : (currentUser?.location || "—")}
            editing={editing}
            onChange={(v) => update("location", v)}
            placeholder="e.g. Austin, TX"
          />
          <Field
            label="Bio"
            value={editing ? form.bio : (currentUser?.bio || "—")}
            editing={editing}
            onChange={(v) => update("bio", v)}
            multiline
            placeholder="Tell others about yourself…"
          />

          {isPro && (
            <>
              <Field
                label="Profession"
                value={editing ? form.profession : (currentUser?.profession || "—")}
                editing={editing}
                onChange={(v) => update("profession", v)}
                placeholder="e.g. General Contractor"
              />
              <Field
                label="Hourly Rate ($)"
                value={editing ? form.hourlyRate : (currentUser?.hourlyRate != null ? `$${currentUser.hourlyRate}/hr` : "—")}
                editing={editing}
                onChange={(v) => update("hourlyRate", v)}
                type="number"
                placeholder="e.g. 75"
              />
            </>
          )}
        </div>

        {editing && (
          <div style={{ display: "flex", gap: 10, borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16 }}>
            <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button className="btn-ghost" onClick={handleCancel} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "text", multiline, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#7a7672", letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </div>
      {editing ? (
        multiline ? (
          <textarea
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight: 80 }}
          />
        ) : (
          <input
            className="input"
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <div style={{ fontSize: 15, color: value === "—" ? "#7a7672" : "#f0ede8" }}>
          {value}
        </div>
      )}
    </div>
  );
}
