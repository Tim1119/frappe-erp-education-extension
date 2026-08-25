// import { useState, useEffect } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/context/AuthContext";
// import { ADMIN_NAV, TEACHER_NAV } from "@/config/navigation";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

// /**
//  * Check if any descendant path matches the current location.
//  * Used to auto-expand parent collapsibles.
//  */
// function hasActiveChild(item, pathname) {
//   if (item.path && pathname.startsWith(item.path)) return true;
//   if (item.children) return item.children.some((c) => hasActiveChild(c, pathname));
//   return false;
// }

// // ─── Leaf link ─────────────────────────────────────────────────────────

// /**
//  * Indentation: depth 0 = top-level (Dashboard, Education)
//  *              depth 1 = group headers inside Education (Student & Instructor, Masters…)
//  *              depth 2 = leaf links inside those groups (Student, Teacher…)
//  * Each depth adds 12px left padding for clear visual nesting.
//  */
// // const depthPadding = (depth) => ({ paddingLeft: `${4 + depth * 12}px` });

// const linkPadding = (depth) => ({
//   paddingLeft: `${2 + depth * 8}px`,
// });

// const groupPadding = (depth) => ({
//   paddingLeft: `${4 + depth * 12}px`,
// });

// function SidebarLink({ item, depth = 0 }) {
//   const Icon = item.icon;
//   return (
//     <NavLink
//       to={item.path}
//       end={item.path === "/dashboard"}
//       className={({ isActive }) =>
//         cn(
//           "group flex items-center gap-2 rounded-md pr-2 py-1.5 text-[13px] font-medium transition-colors",
//           isActive
//             ? "bg-sidebar-accent text-sidebar-primary"
//             : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//         )
//       }
//       style={linkPadding(depth)}
//     >
//       {Icon && <Icon className="h-4 w-4 shrink-0" />}
//       <span className="truncate">{item.label}</span>
//     </NavLink>
//   );
// }

// // ─── Collapsible group ─────────────────────────────────────────────────

// function SidebarGroup({ item, depth = 0 }) {
//   const location = useLocation();
//   const shouldOpen = hasActiveChild(item, location.pathname);
//   const [open, setOpen] = useState(shouldOpen);

//   // Auto-expand when navigation causes a child to become active
//   useEffect(() => {
//     if (shouldOpen && !open) setOpen(true);
//   }, [shouldOpen]); // eslint-disable-line react-hooks/exhaustive-deps

//   const Icon = item.icon;

//   return (
//     <Collapsible open={open} onOpenChange={setOpen}>
//       <CollapsibleTrigger
//         className={cn(
//           "group flex w-full items-center gap-2 rounded-md pr-2 py-1.5 text-[13px] font-medium transition-colors",
//           shouldOpen
//             ? "text-sidebar-primary"
//             : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//         )}
//         style={groupPadding(depth)}
//       >
//         {Icon && <Icon className="h-4 w-4 shrink-0" />}
//         <span className="flex-1 truncate text-left">{item.label}</span>
//         <ChevronRight
//           className={cn(
//             "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
//             open && "rotate-90",
//           )}
//         />
//       </CollapsibleTrigger>
//       <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
//         {/* Left border line to visually connect children */}
//         <div
//           className="mt-0.5 space-y-0.5 border-l border-sidebar-border"
//           style={{ marginLeft: `${0 + depth * 12}px` }}
//         >
//           {item.children.map((child) => (
//             <SidebarItem key={child.key} item={child} depth={depth + 1} />
//           ))}
//         </div>
//       </CollapsibleContent>
//     </Collapsible>
//   );
// }

// // ─── Dispatcher ────────────────────────────────────────────────────────

// function SidebarItem({ item, depth = 0 }) {
//   if (item.children) {
//     return <SidebarGroup item={item} depth={depth} />;
//   }
//   return <SidebarLink item={item} depth={depth} />;
// }

// // ─── Sidebar ───────────────────────────────────────────────────────────

// export default function Sidebar() {
//   const { isAdmin, school } = useAuth();
//   const nav = isAdmin ? ADMIN_NAV : TEACHER_NAV;

//   return (
//     <aside className="flex h-full w-[260px] flex-col border-r bg-sidebar">
//       {/* School branding */}
//       <div className="flex h-14 items-center gap-2.5 border-b px-4">
//         {school?.logo ? (
//           <img
//             src={school.logo}
//             alt=""
//             className="h-7 w-7 rounded object-contain"
//           />
//         ) : (
//           <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
//             {(school?.abbreviation || school?.name || "S").charAt(0)}
//           </div>
//         )}
//         <span className="truncate text-sm font-semibold text-sidebar-foreground">
//           {school?.name || "School Portal"}
//         </span>
//       </div>

//       {/* Navigation */}
//       <ScrollArea className="flex-1 px-3 py-3">
//         <nav className="space-y-1">
//           {nav.map((item) => (
//             <SidebarItem key={item.key} item={item} depth={0} />
//           ))}
//         </nav>
//       </ScrollArea>
//     </aside>
//   );
// }



import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV, TEACHER_NAV, BURSAR_NAV } from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PERMISSION_ROUTE_DOCTYPES } from "@/components/guards/EducationPermissionBoundary";
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

const linkPadding = (depth) => ({
  paddingLeft: `${2 + depth * 8}px`,
});

const groupPadding = (depth) => ({
  paddingLeft: `${4 + depth * 12}px`,
});

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
      style={linkPadding(depth)}
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
        style={groupPadding(depth)}
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
          style={{ marginLeft: `${0 + depth * 12}px` }}
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

// ─── Pick navigation based on portal role ──────────────────────────────

function getNavForRole(role) {
  if (role === "admin") return ADMIN_NAV;
  if (role === "bursar") return BURSAR_NAV;
  const dashboard = TEACHER_NAV.find((item) => item.key === "dashboard");
  const education = TEACHER_NAV.find((item) => item.key === "education");
  const hr = ADMIN_NAV.find((item) => item.key === "hr");
  const shiftAndAttendance = hr?.children?.find(
    (item) => item.key === "shift-and-attendance",
  );
  const teacherHr = hr
    ? {
        ...hr,
        children: hr.children?.filter(
          (item) => item.key !== "shift-and-attendance",
        ),
      }
    : null;

  // Frappe Desk presents Shift & Attendance as its own workspace. Keep the
  // teacher portal hierarchy identical instead of nesting it below HR.
  return [dashboard, teacherHr, shiftAndAttendance, education].filter(Boolean);
}

// Frappe DocTypes represented by teacher Education navigation entries.
// Entries without a DocType are reports/tools whose access is enforced by
// their own backend endpoint.
const TEACHER_NAV_DOCTYPES = {
  students: "Student",
  teachers: "Instructor",
  "class-arms": "Student Group",
  classes: "Program",
  subjects: "Course",
  topics: "Topic",
  articles: "Article",
  videos: "Video",
  quizzes: "Quiz",
  "education-settings": "Education Settings",
  "grading-scale": "Grading Scale",
  "academic-year": "Academic Year",
  "class-enrollment": "Program Enrollment",
  "subject-enrollment": "Course Enrollment",
  "attendance-subject-enrollment": "Course Enrollment",
  "student-attendance": "Student Attendance",
  "student-leave-application": "Student Leave Application",
  "subject-activity": "Subject Activity",
  "quiz-activity": "Quiz Activity",
  "assessment-plan": "Assessment Plan",
  "assessment-group": "Assessment Group",
  "assessment-result": "Assessment Result",
  "assessment-criteria": "Assessment Criteria",
  "school-term-result": "School Term Result",
  "subject-assessment-report": "Assessment Result",
  "final-assessment-grades": "Assessment Result",
  "student-guardian-contacts": "Student",
};

const TEACHER_NAV_REQUIRED_PERMISSIONS = {
  "student-attendance-tool": ["Student Attendance", "create"],
  "assessment-result-tool": ["Assessment Result", "create"],
  "school-term-result-gen": ["School Term Result", "create"],
};

// Desk's HR workspaces expose a curated subset of every readable HR DocType.
// Keep the teacher portal on that same subset; Frappe permissions are then
// applied on top for record visibility and CRUD actions.
const TEACHER_HR_WORKSPACE_KEYS = new Set([
  "company",
  "employees",
  "leave-applications",
  "compensatory-leave-requests",
  "leave-types",
  "leave-encashments",
  "sa-attendance-list",
  "sa-attendance-requests",
  "sa-employee-checkins",
  "shift-type",
  "shift-location",
  "shift-assignment",
  "shift-schedule",
  "shift-schedule-assignment",
  "shift-request",
  "timesheet",
  "activity-type",
  "shift-attendance-report",
  "expense-claims",
  "expense-claim-types",
  "employee-advances",
  "employee-referral",
  "grievance-type",
  "employee-grievance",
  "training-feedback",
  "lifecycle-daily-work-summaries",
  "appraisal-templates",
  "appraisals",
  "appraisal-cycles",
  "employee-performance-feedbacks",
  "goals",
  "employee-promotions",
  "energy-point-logs",
  "employee-analytics",
  "lifecycle-employee-analytics",
  "employee-birthday",
  "lifecycle-employee-birthday",
  "daily-work-summary-replies",
  "lifecycle-daily-work-summary-replies",
  "leaves-employee-leave-balance",
  "leaves-employee-leave-balance-summary",
  "employee-advance-summary",
  "expense-employee-advance-summary",
]);

function filterTeacherNav(
  items,
  can,
  allowedLeafKeys = null,
  preserveWorkspaceLinks = false,
) {
  return items.flatMap((item) => {
    const requirement = TEACHER_NAV_REQUIRED_PERMISSIONS[item.key];
    if (requirement && !can(...requirement)) return [];
    const routeKey = item.path?.split("/").filter(Boolean).at(-1);
    if (allowedLeafKeys && item.path && !allowedLeafKeys.has(item.key)) return [];
    const doctype = TEACHER_NAV_DOCTYPES[item.key] || PERMISSION_ROUTE_DOCTYPES[routeKey];
    if (doctype && !preserveWorkspaceLinks && !can(doctype, "read")) return [];

    // A teacher leaf must have a known permission source. This prevents
    // newly added admin-only HR links from leaking into teacher navigation.
    if (item.path && routeKey !== "dashboard" && !doctype && !requirement) return [];

    if (!item.children) return [item];

    const children = filterTeacherNav(
      item.children,
      can,
      allowedLeafKeys,
      preserveWorkspaceLinks,
    );
    return children.length ? [{ ...item, children }] : [];
  });
}

// ─── Sidebar ───────────────────────────────────────────────────────────

export default function Sidebar() {
  const { role, school, can } = useAuth();
  const roleNav = getNavForRole(role);
  const nav = role === "teacher"
    ? roleNav.flatMap((item) => filterTeacherNav(
        [item],
        can,
        item.key === "hr" || item.key === "shift-and-attendance"
          ? TEACHER_HR_WORKSPACE_KEYS
          : null,
        item.key === "shift-and-attendance",
      ))
    : roleNav;

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
