// src/pages/LoginPage.jsx
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/constants";

export default function LoginPage() {
  const { login, register, setScreen, showToast } = useApp();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register extras
  const [name, setName] = useState("");
  const [role, setRole] = useState("homeowner");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    if (role === "pro" && (!profession || !hourlyRate)) {
      showToast("Pros must fill in profession and hourly rate", "error");
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        profession: role === "pro" ? profession : null,
        bio: role === "pro" ? bio : null,
        hourlyRate: role === "pro" ? Number(hourlyRate) : null,
      });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Left image panel ── */}
      <div style={{ flex: 1, position: "relative", display: "none", minWidth: 0 }} className="login-img-panel">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80"
          alt="Workshop tools"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,17,23,.7), rgba(15,17,23,.3))" }} />
        <div style={{ position: "absolute", bottom: 48, left: 48, right: 48 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>
            Build it yourself.<br /><span style={{ color: "#ffb43c" }}>Do it right.</span>
          </div>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, lineHeight: 1.6 }}>
            Connect with licensed pros who guide your DIY project remotely.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#0f1117",
          color: "#f0ede8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          overflowY: "auto",
        }}
      >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#ffb43c",
          marginBottom: 4,
        }}
      >
        ProSight DIY
      </div>
      <p style={{ color: "#7a7672", marginBottom: 32, fontSize: 14 }}>
        {mode === "login" ? "Welcome back" : "Create your account"}
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 20,
          padding: 32,
        }}
      >
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,.05)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                background: mode === m ? "#ffb43c" : "transparent",
                color: mode === m ? "#0f1117" : "#7a7672",
                transition: "all .2s",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Register-only fields */}
          {mode === "register" && (
            <>
              <div>
                <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
                  FULL NAME *
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
                  I AM A *
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["homeowner", "pro"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        border: `1px solid ${role === r ? "#ffb43c" : "rgba(255,255,255,.1)"}`,
                        borderRadius: 8,
                        background: role === r ? "rgba(255,180,60,.1)" : "transparent",
                        color: role === r ? "#ffb43c" : "#7a7672",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all .2s",
                      }}
                    >
                      {r === "homeowner" ? "🏠 Homeowner" : "🔧 Professional"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pro-specific fields */}
              {role === "pro" && (
                <>
                  <div>
                    <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
                      PROFESSION *
                    </label>
                    <input
                      className="input"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Licensed Electrician"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
                      BIO
                    </label>
                    <textarea
                      className="input"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief description of your experience…"
                      style={{ minHeight: 70 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
                      HOURLY OVERSIGHT RATE ($) *
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Shared fields */}
          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              EMAIL *
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#a8a4a0", display: "block", marginBottom: 6 }}>
              PASSWORD *
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={loading}
            style={{ marginTop: 6, padding: "13px 0", fontSize: 15 }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>

          {/* Demo hint */}
          {mode === "login" && (
            <p style={{ fontSize: 12, color: "#7a7672", textAlign: "center", marginTop: 4 }}>
              Demo accounts: marcus@example.com / dave@example.com
              <br />Password: <strong style={{ color: "#a8a4a0" }}>password123</strong>
            </p>
          )}
        </form>
      </div>

      <button
        onClick={() => setScreen("landing")}
        style={{
          marginTop: 24,
          background: "none",
          border: "none",
          color: "#7a7672",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← Back to home
      </button>
      </div>{/* end right panel */}
    </div>
  );
}
