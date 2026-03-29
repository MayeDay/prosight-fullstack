// src/components/Toast.jsx
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 200,
        background: toast.type === "error" ? "#e74c3c" : "#48c78e",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: "0 4px 20px rgba(0,0,0,.4)",
      }}
    >
      {toast.msg}
    </div>
  );
}
