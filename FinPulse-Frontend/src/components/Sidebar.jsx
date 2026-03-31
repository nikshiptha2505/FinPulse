import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/",            label: "Dashboard",    icon: "◈" },
  { to: "/transactions",label: "Transactions", icon: "⇄" },
  { to: "/budgets",     label: "Budgets",      icon: "◑" },
  { to: "/goals",       label: "Goals",        icon: "◎" },
];

export default function Sidebar() {
  const { user, onLogout } = useAuth();

  return (
    <aside style={{
      width: "var(--sidebar-w)", minHeight: "100vh",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: "0",
      position: "sticky", top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "1.75rem 1.5rem 1rem", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
          <span style={{ color: "var(--accent)" }}>Fin</span>
          <span style={{ color: "var(--text-primary)" }}>Pulse</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.08em" }}>
          PERSONAL FINANCE
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: "var(--radius-md)",
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-dim)" : "transparent",
              transition: "all 0.15s",
              textDecoration: "none",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            })}
          >
            <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-soft)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: "var(--radius-md)",
          background: "var(--bg-raised)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "var(--accent)",
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 16, cursor: "pointer", padding: 4, flexShrink: 0 }}>
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}
