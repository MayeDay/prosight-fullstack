// src/components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const map = {
    open:        ["badge-open",     "Open"],
    "in-progress": ["badge-progress", "In Progress"],
    completed:   ["badge-done",     "Completed"],
  };
  const [cls, label] = map[status] ?? ["badge-done", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
