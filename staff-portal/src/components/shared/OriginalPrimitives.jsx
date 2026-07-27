/**
 * Compatibility bridge for original page components.
 *
 * The original pages imported { PageHeader, Avatar, StatusBadge, EmptyState }
 * from "../../components/ui/Primitives.jsx". This module re-exports
 * equivalents so those imports work without changing every original file.
 */

// Re-export Avatar as a simple function component matching the old API: Avatar({ name, src, size, round })
import { initials } from "@/utils/format";

export function Avatar({ name, src, size = 34, round }) {
  const s = { width: size, height: size, borderRadius: round ? "50%" : 6, flexShrink: 0 };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ ...s, objectFit: "cover" }}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }
  return (
    <div
      style={{
        ...s,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(size * 0.35, 10),
        fontWeight: 600,
        color: "hsl(var(--primary-foreground))",
        background: "hsl(var(--primary))",
      }}
    >
      {initials(name)}
    </div>
  );
}

// PageHeader — matches old API: PageHeader({ eyebrow, title, sub, actions, button })
export function PageHeader({ eyebrow, title, sub, actions, button }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {(actions || button) && (
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
          {button}
        </div>
      )}
    </div>
  );
}

// StatusBadge — matches old API: StatusBadge({ s })
export function StatusBadge({ s }) {
  const MAP = {
    ACTIVE: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    INACTIVE: { bg: "bg-gray-500/10", text: "text-gray-500" },
    PRESENT: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    ABSENT: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
    PENDING: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
    APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    REJECTED: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
    DRAFT: { bg: "bg-gray-500/10", text: "text-gray-500" },
    SUBMITTED: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    CANCELLED: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  };
  const key = String(s).toUpperCase();
  const style = MAP[key] || MAP.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {String(s).toLowerCase()}
    </span>
  );
}

// EmptyState — matches old API: EmptyState({ icon, title, sub })
export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-muted-foreground/40" />}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

// StatCard — matches old API
export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// Logo — matches old API
export function Logo({ size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: "hsl(var(--primary))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        color: "hsl(var(--primary-foreground))",
      }}
    >
      S
    </div>
  );
}
