import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV, TEACHER_NAV } from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Check if any descendant path matches the current location.
 * Used to auto-expand parent collapsibles.
 */
function hasActiveChild(item, pathname) {
  if (item.path && pathname.startsWith(item.path)) return true;
  if (item.children) return item.children.some((c) => hasActiveChild(c, pathname));
  return false;
}

// ─── Leaf link ─────────────────────────────────────────────────────────

/**
 * Indentation: depth 0 = top-level (Dashboard, Education)
 *              depth 1 = group headers inside Education (Student & Instructor, Masters…)
 *              depth 2 = leaf links inside those groups (Student, Teacher…)
 * Each depth adds 12px left padding for clear visual nesting.
 */
const depthPadding = (depth) => ({ paddingLeft: `${8 + depth * 12}px` });

function SidebarLink({ item, depth = 0 }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-2 rounded-md pr-2 py-1.5 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
      style={depthPadding(depth)}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

// ─── Collapsible group ─────────────────────────────────────────────────

function SidebarGroup({ item, depth = 0 }) {
  const location = useLocation();
  const shouldOpen = hasActiveChild(item, location.pathname);
  const [open, setOpen] = useState(shouldOpen);

  // Auto-expand when navigation causes a child to become active
  useEffect(() => {
    if (shouldOpen && !open) setOpen(true);
  }, [shouldOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const Icon = item.icon;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center gap-2 rounded-md pr-2 py-1.5 text-[13px] font-medium transition-colors",
          shouldOpen
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
        style={depthPadding(depth)}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {/* Left border line to visually connect children */}
        <div
          className="mt-0.5 space-y-0.5 border-l border-sidebar-border"
          style={{ marginLeft: `${14 + depth * 12}px` }}
        >
          {item.children.map((child) => (
            <SidebarItem key={child.key} item={child} depth={depth + 1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Dispatcher ────────────────────────────────────────────────────────

function SidebarItem({ item, depth = 0 }) {
  if (item.children) {
    return <SidebarGroup item={item} depth={depth} />;
  }
  return <SidebarLink item={item} depth={depth} />;
}

// ─── Sidebar ───────────────────────────────────────────────────────────

export default function Sidebar() {
  const { isAdmin, school } = useAuth();
  const nav = isAdmin ? ADMIN_NAV : TEACHER_NAV;

  return (
    <aside className="flex h-full w-[260px] flex-col border-r bg-sidebar">
      {/* School branding */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        {school?.logo ? (
          <img
            src={school.logo}
            alt=""
            className="h-7 w-7 rounded object-contain"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            {(school?.abbreviation || school?.name || "S").charAt(0)}
          </div>
        )}
        <span className="truncate text-sm font-semibold text-sidebar-foreground">
          {school?.name || "School Portal"}
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {nav.map((item) => (
            <SidebarItem key={item.key} item={item} depth={0} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
