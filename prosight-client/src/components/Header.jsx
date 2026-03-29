// src/components/Header.jsx
import { useApp } from "../context/AppContext";

const HOMEOWNER_TABS = [
  ["my-projects", "My Projects"],
  ["browse",      "Find Pros"],
  ["messages",    "Messages"],
];
const PRO_TABS = [
  ["browse",    "Open Projects"],
  ["my-jobs",   "My Jobs"],
  ["messages",  "Messages"],
];

export default function Header() {
  const { currentUser, activeTab, setActiveTab, setSelectedProject, logout } = useApp();
  const tabs = currentUser?.role === "homeowner" ? HOMEOWNER_TABS : PRO_TABS;

  const switchTab = (key) => {
    setActiveTab(key);
    setSelectedProject(null);
  };

  return (
    <header
      style={{
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        position: "sticky",
        top: 0,
        background: "#0f1117",
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: "#ffb43c",
        }}
      >
        ProSight{" "}
        <span style={{ color: "#f0ede8", fontWeight: 400, fontSize: 14 }}>DIY</span>
      </div>

      <nav style={{ display: "flex" }}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? "active" : ""}`}
            onClick={() => switchTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => switchTab("profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: 8,
            color: activeTab === "profile" ? "#ffb43c" : "#7a7672",
            fontSize: 13,
            transition: "color 0.15s",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {currentUser?.name}
        </button>
        <button
          className="btn-ghost"
          onClick={logout}
          style={{ padding: "6px 14px", fontSize: 12 }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
