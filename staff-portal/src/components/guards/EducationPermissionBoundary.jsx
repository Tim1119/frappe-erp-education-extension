import { createContext, useContext, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const EducationPermissionContext = createContext(null);

export const PERMISSION_ROUTE_DOCTYPES = {
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
  "student-attendance": "Student Attendance",
  "student-leave-application": "Student Leave Application",
  "subject-activity": "Subject Activity",
  "quiz-activity": "Quiz Activity",
  "assessment-plan": "Assessment Plan",
  "assessment-group": "Assessment Group",
  "assessment-result": "Assessment Result",
  "assessment-criteria": "Assessment Criteria",
  "school-term-result-generator": "School Term Result",
  "student-attendance-tool": "Student Attendance",
  "assessment-result-tool": "Assessment Result",
  "subject-assessment-report": "Assessment Result",
  "final-assessment-grades": "Assessment Result",
  "student-guardian-contacts": "Student",
  company: "Company",
  branches: "Branch",
  departments: "Department",
  designations: "Designation",
  employees: "Employee",
  "employee-groups": "Employee Group",
  "employee-grades": "Employee Grade",
  "hr-settings": "HR Settings",
  "daily-work-summary-groups": "Daily Work Summary Group",
  "daily-work-summaries": "Daily Work Summary",
  "team-updates": "Employee",
  "employee-onboarding-template": "Employee Onboarding Template",
  "employee-onboarding": "Employee Onboarding",
  "employee-skill-map": "Employee Skill Map",
  "grievance-type": "Grievance Type",
  "employee-grievance": "Employee Grievance",
  "training-program": "Training Program",
  "training-event": "Training Event",
  "training-feedback": "Training Feedback",
  "training-result": "Training Result",
  "staffing-plan": "Staffing Plan",
  "job-requisition": "Job Requisition",
  "job-opening": "Job Opening",
  "job-applicants": "Job Applicant",
  "job-offers": "Job Offer",
  "employee-referrals": "Employee Referral",
  "interview-types": "Interview Type",
  "interview-rounds": "Interview Round",
  interviews: "Interview",
  "interview-feedback": "Interview Feedback",
  "appointment-letter-templates": "Appointment Letter Template",
  "appointment-letters": "Appointment Letter",
  "leave-applications": "Leave Application",
  "compensatory-leave-requests": "Compensatory Leave Request",
  "leave-allocations": "Leave Allocation",
  "leave-policy-assignments": "Leave Policy Assignment",
  "leave-encashments": "Leave Encashment",
  "leave-types": "Leave Type",
  "leave-periods": "Leave Period",
  "leave-policies": "Leave Policy",
  "leave-block-lists": "Leave Block List",
  "holiday-lists": "Holiday List",
  "appraisal-templates": "Appraisal Template",
  kras: "KRA",
  "employee-feedback-criteria": "Employee Feedback Criteria",
  appraisals: "Appraisal",
  "appraisal-cycles": "Appraisal Cycle",
  "employee-performance-feedbacks": "Employee Performance Feedback",
  goals: "Goal",
  "employee-promotions": "Employee Promotion",
  "energy-point-rules": "Energy Point Rule",
  "energy-point-settings": "Energy Point Settings",
  "energy-point-logs": "Energy Point Log",
  attendance: "Attendance",
  "attendance-requests": "Attendance Request",
  "employee-checkins": "Employee Checkin",
  "shift-types": "Shift Type",
  "shift-locations": "Shift Location",
  "shift-assignments": "Shift Assignment",
  "shift-schedules": "Shift Schedule",
  "shift-schedule-assignments": "Shift Schedule Assignment",
  "shift-requests": "Shift Request",
  timesheets: "Timesheet",
  "activity-types": "Activity Type",
  "salary-components": "Salary Component",
  "salary-structures": "Salary Structure",
  "income-tax-slabs": "Income Tax Slab",
  "payroll-periods": "Payroll Period",
  "salary-structure-assignments": "Salary Structure Assignment",
  "salary-slips": "Salary Slip",
  "payroll-entries": "Payroll Entry",
  "salary-withholdings": "Salary Withholding",
  "employee-incentives": "Employee Incentive",
  "retention-bonuses": "Retention Bonus",
  "expense-claims": "Expense Claim",
  "expense-claim-types": "Expense Claim Type",
  "employee-advances": "Employee Advance",
  "travel-requests": "Travel Request",
  "purposes-of-travel": "Purpose of Travel",
  "additional-salaries": "Additional Salary",
  vehicles: "Vehicle",
  drivers: "Driver",
  "vehicle-service-items": "Vehicle Service Item",
  "vehicle-logs": "Vehicle Log",
  "employee-analytics": "Employee",
  "employee-information": "Employee",
  "employee-birthday": "Employee",
  "employee-exits": "Employee",
  "daily-work-summary-replies": "Daily Work Summary",
  "employee-leave-balance": "Leave Application",
  "employee-leave-balance-summary": "Leave Application",
  "employee-advance-summary": "Employee Advance",
  "unpaid-expense-claim": "Expense Claim",
  "vehicle-expenses": "Vehicle",
  "monthly-attendance-sheet": "Attendance",
  "shift-attendance": "Attendance",
  "employee-hours-utilization": "Timesheet",
  "employees-working-on-holiday": "Attendance",
  "recruitment-analytics": "Job Applicant",
};

const ROUTE_REQUIRED_PERMISSIONS = {
  "student-attendance-tool": "create",
  "assessment-result-tool": "create",
  "school-term-result-generator": "create",
};

export function useEducationPermissionSurface() {
  return useContext(EducationPermissionContext);
}

export function requiredPermissionForActionText(value, mode = "list") {
  const text = String(value || "").trim().toLowerCase();
  if (/\b(add|new|create)\b/.test(text)) return "create";
  if (/\b(edit|save|update)\b/.test(text)) return "write";
  if (/\b(delete|remove)\b/.test(text)) return "delete";
  if (/^submit\b/.test(text)) return "submit";
  if (mode === "detail" && /^cancel\b/.test(text)) return "cancel";
  return null;
}

function PermissionSurface({ permissions, mode, children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const apply = () => {
      root.querySelectorAll("button, [role='menuitem']").forEach((element) => {
        const label = element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent;
        const permission = requiredPermissionForActionText(label, mode);
        const denied = permission && !permissions[permission];
        element.hidden = Boolean(denied);
        if (denied) {
          if (!element.hasAttribute("data-permission-display")) {
            element.setAttribute("data-permission-display", element.style.display || "");
          }
          element.style.setProperty("display", "none", "important");
          element.setAttribute("data-permission-hidden", permission);
        } else if (element.hasAttribute("data-permission-hidden")) {
          const previousDisplay = element.getAttribute("data-permission-display") || "";
          element.style.removeProperty("display");
          if (previousDisplay) element.style.display = previousDisplay;
          element.removeAttribute("data-permission-hidden");
          element.removeAttribute("data-permission-display");
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [permissions, mode]);

  return <div ref={rootRef} className="contents">{children}</div>;
}

export default function EducationPermissionBoundary({ children }) {
  const location = useLocation();
  const { can } = useAuth();
  const segments = location.pathname.split("/").filter(Boolean);
  const routeKey = segments[1];
  const doctype = PERMISSION_ROUTE_DOCTYPES[routeKey];

  if (!doctype) return children;

  const permissions = {
    read: can(doctype, "read"),
    create: can(doctype, "create"),
    write: can(doctype, "write"),
    delete: can(doctype, "delete"),
    submit: can(doctype, "submit"),
    cancel: can(doctype, "cancel"),
  };

  if (!permissions.read) return <Navigate to="/dashboard" replace />;

  const routePermission = ROUTE_REQUIRED_PERMISSIONS[routeKey];
  if (routePermission && !permissions[routePermission]) {
    return <Navigate to="/dashboard" replace />;
  }

  if (segments.at(-1) === "new" && !permissions.create) {
    return <Navigate to={`/dashboard/${routeKey}`} replace />;
  }

  if (segments.at(-1) === "edit" && !permissions.write) {
    return <Navigate to={location.pathname.replace(/\/edit\/?$/, "")} replace />;
  }

  const lastSegment = segments.at(-1);
  const mode = lastSegment === routeKey ? "list" :
    lastSegment === "new" || lastSegment === "edit" ? "form" : "detail";

  return (
    <EducationPermissionContext.Provider value={{ doctype, permissions, mode }}>
      <PermissionSurface permissions={permissions} mode={mode}>
        {children}
      </PermissionSurface>
    </EducationPermissionContext.Provider>
  );
}
