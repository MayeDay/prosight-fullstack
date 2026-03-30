// src/components/MessageThread.jsx
import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useMessages } from "../hooks/useMessages";
import StatusBadge from "./StatusBadge";

export default function MessageThread({ project }) {
  const { currentUser } = useApp();
  const { messages, input, setInput, send, handleKeyDown, loading } =
    useMessages(project?.id);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!project) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 14,
          color: "#7a7672",
          fontSize: 14,
        }}
      >
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 600 }}>{project.title}</div>
        <StatusBadge status={project.status} />
      </div>

      {/* Messages */}
      <div
        className="scroll"
        style={{
          flex: 1,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 0,
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", color: "#7a7672", fontSize: 13, marginTop: 40 }}>
            Loading messages…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#7a7672", fontSize: 13, marginTop: 40 }}>
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender.id === currentUser?.id;
          const ts = new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}
            >
              <div>
                {!mine && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7a7672",
                      marginBottom: 3,
                      paddingLeft: 4,
                    }}
                  >
                    {m.sender.name}
                  </div>
                )}
                <div
                  className="msg-bubble"
                  style={{
                    background: mine ? "#ffb43c" : "rgba(255,255,255,.08)",
                    color: mine ? "#0f1117" : "#f0ede8",
                    borderRadius: mine
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  }}
                >
                  {m.text}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#7a7672",
                    marginTop: 3,
                    textAlign: mine ? "right" : "left",
                    paddingLeft: mine ? 0 : 4,
                  }}
                >
                  {ts}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          gap: 10,
        }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          style={{ flex: 1 }}
        />
        <button className="btn-gold" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
