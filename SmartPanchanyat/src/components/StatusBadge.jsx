import { statusConfig, priorityConfig, typeConfig } from "../data/complaints";
import { Construction, Trash2, Building2, Zap, Droplets, FileText, AlertCircle, CheckCircle, Clock, Timer, User, ShieldAlert } from "lucide-react";

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.NEW;
  
  const getStatusIcon = (st) => {
    const size = 12;
    switch(st) {
      case 'NEW': return <Clock size={size} />;
      case 'PENDING_REVIEW': return <Timer size={size} />;
      case 'VERIFIED': return <CheckCircle size={size} />;
      case 'ASSIGNED': return <User size={size} />;
      case 'IN_PROGRESS': return <Timer size={size} />;
      case 'RESOLVED': return <CheckCircle size={size} />;
      case 'CLOSED': return <CheckCircle size={size} />;
      case 'REJECTED': return <ShieldAlert size={size} />;
      case 'ESCALATED': return <ShieldAlert size={size} />;
      default: return null;
    }
  };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 12px", borderRadius: "20px",
      background: cfg.bg, color: cfg.color,
      fontSize: "11px", fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      {getStatusIcon(status)}
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.NORMAL;
  return (
    <span style={{
      padding: "4px 10px", borderRadius: "12px",
      background: cfg.bg, color: cfg.color,
      fontSize: "11px", fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      {cfg.label}
    </span>
  );
}

export function TypeIcon({ type }) {
  const cfg = typeConfig[type] || typeConfig.OTHER;
  
  const getLucideIcon = (t) => {
    const size = 22;
    switch(t) {
      case 'WATER': return <Droplets size={size} />;
      case 'ELECTRICITY': return <Zap size={size} />;
      case 'ROAD': return <Construction size={size} />;
      case 'SANITATION': return <Trash2 size={size} />;
      case 'INFRASTRUCTURE': return <Construction size={size} />;
      case 'PUBLIC_SERVICES': return <Building2 size={size} />;
      case 'PUBLIC_PROPERTY': return <Building2 size={size} />;
      default: return <FileText size={size} />;
    }
  };

  return (
    <div style={{
      width: "48px", height: "48px", borderRadius: "14px",
      background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      {getLucideIcon(type)}
    </div>
  );
}