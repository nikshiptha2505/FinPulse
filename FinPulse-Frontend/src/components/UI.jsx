import { useState } from "react";

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", disabled, loading, onClick, type = "button", style }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, border: "none", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)", fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.15s", opacity: disabled || loading ? 0.6 : 1,
    whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "10px 20px", fontSize: 13 },
    lg: { padding: "13px 28px", fontSize: 14 },
  };
  const variants = {
    primary:   { background: "var(--accent)", color: "#000" },
    secondary: { background: "var(--bg-raised)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    danger:    { background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(255,77,106,0.25)" },
    ghost:     { background: "transparent", color: "var(--text-secondary)" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</label>}
      <input
        {...props}
        style={{
          background: "var(--bg)",
          border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
          ...style,
        }}
      />
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</label>}
      <select
        {...props}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "default" }) {
  const colors = {
    default: { background: "var(--bg-raised)", color: "var(--text-secondary)" },
    green:   { background: "var(--green-dim)",  color: "var(--green)"  },
    red:     { background: "var(--red-dim)",    color: "var(--red)"    },
    amber:   { background: "var(--amber-dim)",  color: "var(--amber)"  },
    accent:  { background: "var(--accent-dim)", color: "var(--accent)" },
  };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 600, ...colors[color],
    }}>
      {children}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, delta, valueColor, icon }) {
  const isPos = delta > 0;
  return (
    <Card style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: 10 }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)", color: valueColor || "var(--text-primary)", marginBottom: delta != null ? 8 : 0 }}>
        {value}
      </p>
      {delta != null && (
        <p style={{ fontSize: 12, color: isPos ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
          <span>{isPos ? "↑" : "↓"}</span>
          <span>{Math.abs(delta)}% vs last month</span>
        </p>
      )}
    </Card>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, colorOverride }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = colorOverride || (pct > 90 ? "var(--red)" : pct > 70 ? "var(--amber)" : "var(--accent)");
  return (
    <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99, width: `${pct}%`,
        background: color, transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fade-in"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        className="fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, lineHeight: 1, cursor: "pointer" }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</p>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── AmountPill ────────────────────────────────────────────────────────────────
export function AmountPill({ amount }) {
  const isPos = amount >= 0;
  return (
    <span style={{
      fontWeight: 700, fontSize: 13,
      color: isPos ? "var(--green)" : "var(--red)",
    }}>
      {isPos ? "+" : ""}₹{Math.abs(amount).toLocaleString("en-IN")}
    </span>
  );
}
