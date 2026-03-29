// src/pages/LandingPage.jsx
import { useApp } from "../context/AppContext";

const HERO_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80";

const FEATURES = [
  {
    img: "https://images.unsplash.com/photo-1581094480013-e5d69a48a74e?w=600&auto=format&fit=crop&q=80",
    title: "Post Your Project",
    body: "Describe your DIY job, set a budget for oversight, and get matched with a licensed pro in your trade.",
  },
  {
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80",
    title: "Pro Reviews Your Plan",
    body: "A licensed expert reviews your approach, catches safety issues, and guides you step by step.",
  },
  {
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&fit=crop&q=80",
    title: "Work with Confidence",
    body: "Built-in messaging keeps you connected. Your pro checks in at every milestone.",
  },
];

const CATEGORIES = [
  { label: "Carpentry",   img: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=400&auto=format&fit=crop&q=80" },
  { label: "Electrical",  img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&auto=format&fit=crop&q=80" },
  { label: "Plumbing",    img: "https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400&auto=format&fit=crop&q=80" },
  { label: "Painting",    img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=80" },
  { label: "Tiling",      img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80" },
  { label: "Landscaping", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80" },
];

const STATS = [
  { heading: "$0 labor markup", sub: "Pay only for oversight" },
  { heading: "Same-day matches", sub: "Avg 3 hrs to connect" },
  { heading: "Expert sign-off", sub: "Licensed professionals" },
];

export default function LandingPage() {
  const { setScreen } = useApp();

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#ffb43c" }}>
          ProSight <span style={{ color: "#f0ede8", fontWeight: 400, fontSize: 16 }}>DIY</span>
        </div>
        <button className="land-btn" onClick={() => setScreen("login")}
          style={{ background: "#ffb43c", color: "#0f1117", padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
          Get Started →
        </button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 65px)", maxWidth: 1200, margin: "0 auto", padding: "0 48px", alignItems: "center", gap: 60 }}>
        {/* Left */}
        <div>
          <div className="pill">🔨 DIY meets professional oversight</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 4.5vw, 68px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Build it yourself.
            <br />
            <span style={{ color: "#ffb43c" }}>Do it right.</span>
          </h1>
          <p style={{ fontSize: 17, color: "#a8a4a0", maxWidth: 480, lineHeight: 1.75, marginBottom: 36 }}>
            ProSight connects DIY homeowners with licensed pros who oversee projects
            remotely — saving you 60–80% vs. hiring for full labor.
          </p>
          <button className="land-btn" onClick={() => setScreen("login")}
            style={{ background: "#ffb43c", color: "#0f1117", padding: "16px 40px", borderRadius: 10, fontWeight: 700, fontSize: 16, marginBottom: 48 }}>
            Start Your Project
          </button>

          <div style={{ display: "flex", gap: 40 }}>
            {STATS.map(({ heading, sub }) => (
              <div key={heading}>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#ffb43c" }}>{heading}</div>
                <div style={{ fontSize: 12, color: "#7a7672", marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero image */}
        <div style={{ position: "relative", height: 520, borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>
          <img
            src={HERO_IMG}
            alt="DIY home framing project"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Floating stat card */}
          <div style={{
            position: "absolute", bottom: 24, left: 24,
            background: "rgba(15,17,23,.88)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,180,60,.25)",
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#ffb43c,#e07b00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Basement Framing</div>
              <div style={{ color: "#48c78e", fontSize: 12, marginTop: 2 }}>Pro matched in 2 hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="pill" style={{ display: "inline-flex" }}>How it works</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, marginTop: 8 }}>
            Three steps to a pro-guided build
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {FEATURES.map(({ img, title, body }, i) => (
            <div className="feature-card" key={title} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
                <div style={{ position: "absolute", top: 14, left: 14, width: 28, height: 28, borderRadius: "50%", background: "#ffb43c", color: "#0f1117", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ padding: "22px 24px 26px" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#f0ede8" }}>{title}</div>
                <div style={{ fontSize: 14, color: "#7a7672", lineHeight: 1.65 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category gallery ── */}
      <div style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 800 }}>
            Every trade, covered
          </h2>
          <p style={{ color: "#7a7672", fontSize: 14, marginTop: 8 }}>Post any project category and get matched fast</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
          {CATEGORIES.map(({ label, img }) => (
            <div
              key={label}
              style={{ position: "relative", height: 120, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}
              onClick={() => setScreen("login")}
            >
              <img src={img} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.75) 50%, transparent)" }} />
              <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontWeight: 600, fontSize: 13, color: "#fff" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "60px 48px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 800, marginBottom: 16 }}>
          Ready to start your project?
        </h2>
        <p style={{ color: "#7a7672", marginBottom: 28, fontSize: 15 }}>Join hundreds of homeowners saving money without sacrificing quality.</p>
        <button className="land-btn" onClick={() => setScreen("login")}
          style={{ background: "#ffb43c", color: "#0f1117", padding: "16px 48px", borderRadius: 10, fontWeight: 700, fontSize: 16 }}>
          Create Free Account
        </button>
      </div>
    </div>
  );
}
