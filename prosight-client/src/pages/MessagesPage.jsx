// src/pages/MessagesPage.jsx
import { useApp } from "../context/AppContext";
import MessageThread from "../components/MessageThread";

export default function MessagesPage() {
  const {
    currentUser,
    myProjects,
    myAcceptedProjects,
    selectedProject,
    setSelectedProject,
  } = useApp();

  const role = currentUser?.role;
  const threads =
    role === "homeowner"
      ? myProjects.filter((p) => p.status === "in-progress")
      : myAcceptedProjects;

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Messages
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 16,
          height: 520,
        }}
      >
        {/* Sidebar */}
        <div
          className="scroll"
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {threads.length === 0 && (
            <div
              style={{
                color: "#7a7672",
                fontSize: 13,
                textAlign: "center",
                padding: 20,
              }}
            >
              No active conversations yet.
            </div>
          )}

          {threads.map((p) => {
            const isActive = selectedProject?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isActive ? "rgba(255,180,60,.12)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,180,60,.3)"
                    : "1px solid transparent",
                  transition: "all .15s",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: "#7a7672" }}>
                  {role === "homeowner"
                    ? `Pro: ${p.pro?.name}`
                    : `Owner: ${p.owner?.name}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat */}
        <MessageThread project={selectedProject} />
      </div>
    </div>
  );
}
