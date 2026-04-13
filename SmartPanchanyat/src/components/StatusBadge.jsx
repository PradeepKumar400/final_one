import { statusConfig, priorityConfig, typeConfig } from "../data/complaints";

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.NEW;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px", borderRadius: "20px",
      background: cfg.bg, color: cfg.color,
      fontSize: "12px", fontWeight: 600
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.NORMAL;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "12px",
      background: cfg.bg, color: cfg.color,
      fontSize: "11px", fontWeight: 600
    }}>
      {cfg.label}
    </span>
  );
}

export function TypeIcon({ type }) {
  const cfg = typeConfig[type] || typeConfig.OTHER;
  return (
    <div style={{
      width: "44px", height: "44px", borderRadius: "12px",
      background: cfg.bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "22px", flexShrink: 0
    }}>
      {cfg.icon}
    </div>
  );
}