const STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed"
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export function StatusBadge({ value }) {
  return <span className={`badge status-${value}`}>{STATUS_LABELS[value] || value}</span>;
}

export function PriorityBadge({ value }) {
  return <span className={`badge priority-${value}`}>{PRIORITY_LABELS[value] || value}</span>;
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="feedback" role="status">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="banner error" role="alert">
      {message}
    </div>
  );
}

export function EmptyState({ title, text }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
