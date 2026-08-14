import {
  LayoutDashboard,
  GraduationCap,
  Contact,
  UsersRound,
  BookOpen,
  Tag,
  Building2,
  FileText,
  Play,
  ClipboardList,
  Wallet,
  Settings,
  UserPlus,
  CalendarCheck,
  CalendarClock,
  Award,
  BarChart3,
  Wrench,
  Users2,
  BookOpenCheck,
  Layers,
  Briefcase,
  GitBranch,
  Network,
  BadgeCheck,
  CalendarPlus,
  MessageSquareText,
  LogIn,
  ReceiptText,
} from "lucide-react";

/**
 * Navigation shape:
 *
 * Top-level: array of { key, label, icon, path }            ← direct link
 *        or { key, label, icon, children: [...groups] }     ← collapsible
 *
 * Group children: array of { key, label, icon, path }       ← direct link
 *              or { key, label, icon, children: [...] }     ← nested collapsible
 *
 * Leaf items always have `path`. Collapsibles never have `path`.
 *
 * `activeMatch` (optional) is an array of route prefixes that should
 * cause this item to appear active. If omitted, `path` is used.
 */

// ─── ADMIN navigation ─────────────────────────────────────────────────

export const ADMIN_NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    children: [
      {
        key: "student-instructor",
        label: "Student & Instructor",
        icon: Users2,
        children: [
          { key: "students", label: "Student", icon: GraduationCap, path: "/dashboard/students" },
          { key: "teachers", label: "Teacher", icon: Contact, path: "/dashboard/teachers" },
          { key: "guardians", label: "Guardian", icon: UsersRound, path: "/dashboard/guardians" },
          { key: "class-arms", label: "Class Arm", icon: Users2, path: "/dashboard/class-arms" },
          { key: "student-log", label: "Student Log", icon: FileText, path: "/dashboard/student-log" },
        ],
      },
      {
        key: "masters",
        label: "Masters",
        icon: Layers,
        children: [
          { key: "classes", label: "Class", icon: GraduationCap, path: "/dashboard/classes" },
          { key: "subjects", label: "Subject", icon: BookOpen, path: "/dashboard/subjects" },
          { key: "topics", label: "Topic", icon: Tag, path: "/dashboard/topics" },
          { key: "classrooms", label: "Classroom", icon: Building2, path: "/dashboard/classrooms" },
        ],
      },
      {
        key: "content-masters",
        label: "Content Masters",
        icon: BookOpenCheck,
        children: [
          { key: "articles", label: "Article", icon: FileText, path: "/dashboard/articles" },
          { key: "videos", label: "Video", icon: Play, path: "/dashboard/videos" },
          { key: "quizzes", label: "Quiz", icon: ClipboardList, path: "/dashboard/quizzes" },
        ],
      },
      {
        key: "settings-group",
        label: "Settings",
        icon: Settings,
        children: [
          { key: "education-settings", label: "Education Settings", icon: Settings, path: "/dashboard/education-settings" },
          { key: "student-category", label: "Student Category", icon: Tag, path: "/dashboard/student-category" },
          { key: "student-batch-name", label: "Student Batch Name", icon: Tag, path: "/dashboard/student-batch-name" },
          { key: "grading-scale", label: "Grading Scale", icon: BarChart3, path: "/dashboard/grading-scale" },
          { key: "academic-term", label: "Academic Term", icon: CalendarClock, path: "/dashboard/academic-term" },
          { key: "academic-year", label: "Academic Year", icon: CalendarClock, path: "/dashboard/academic-year" },
          { key: "school-settings", label: "School Settings", icon: Settings, path: "/dashboard/school-settings" },
        ],
      },
      {
        key: "admission",
        label: "Admission",
        icon: UserPlus,
        children: [
          { key: "student-applicants", label: "Student Applicant", icon: UserPlus, path: "/dashboard/student-applicants" },
          { key: "student-admissions", label: "Student Admission", icon: UserPlus, path: "/dashboard/student-admissions" },
          { key: "class-enrollment", label: "Class Enrollment", icon: GraduationCap, path: "/dashboard/class-enrollment" },
          { key: "subject-enrollment", label: "Subject Enrollment", icon: BookOpen, path: "/dashboard/subject-enrollment" },
        ],
      },
      {
        key: "fees",
        label: "Fees",
        icon: Wallet,
        children: [
          { key: "fee-structure", label: "Fee Structure", icon: FileText, path: "/dashboard/fee-structure" },
          { key: "fee-category", label: "Fee Category", icon: Tag, path: "/dashboard/fee-category" },
          { key: "fee-schedule", label: "Fee Schedule", icon: FileText, path: "/dashboard/fee-schedule" },
          { key: "fees-list", label: "Fees", icon: Wallet, path: "/dashboard/fees" },
          { key: "sales-invoices", label: "Sales Invoice", icon: FileText, path: "/dashboard/sales-invoices" },
          { key: "student-fee-collection-report", label: "Student Fee Collection Report", icon: BarChart3, path: "/dashboard/student-fee-collection-report" },
          { key: "class-fee-collection-report", label: "Class wise Fee Collection Report", icon: BarChart3, path: "/dashboard/class-fee-collection-report" },
        ],
      },
      {
        key: "schedule",
        label: "Schedule",
        icon: CalendarClock,
        children: [
          { key: "subject-schedule", label: "Subject Schedule", icon: CalendarClock, path: "/dashboard/subject-schedule" },
          { key: "subject-scheduling-tool", label: "Subject Scheduling Tool", icon: Wrench, path: "/dashboard/subject-scheduling-tool" },
        ],
      },
      {
        key: "attendance",
        label: "Attendance",
        icon: CalendarCheck,
        children: [
          { key: "student-attendance", label: "Student Attendance", icon: CalendarCheck, path: "/dashboard/student-attendance" },
          { key: "student-leave-application", label: "Student Leave Application", icon: FileText, path: "/dashboard/student-leave-application" },
          { key: "student-monthly-attendance", label: "Student Monthly Attendance Sheet", icon: CalendarCheck, path: "/dashboard/student-monthly-attendance" },
          { key: "absent-student-report", label: "Absent Student Report", icon: BarChart3, path: "/dashboard/absent-student-report" },
          { key: "student-batch-attendance", label: "Student Batch-Wise Attendance", icon: CalendarCheck, path: "/dashboard/student-batch-attendance" },
          { key: "subject-activity", label: "Subject Activity", icon: BookOpen, path: "/dashboard/subject-activity" },
          { key: "quiz-activity", label: "Quiz Activity", icon: ClipboardList, path: "/dashboard/quiz-activity" },
        ],
      },
      {
        key: "assessment",
        label: "Assessment",
        icon: Award,
        children: [
          { key: "assessment-group", label: "Assessment Group", icon: Award, path: "/dashboard/assessment-group" },
          { key: "assessment-plan", label: "Assessment Plan", icon: ClipboardList, path: "/dashboard/assessment-plan" },
          { key: "assessment-result", label: "Assessment Result", icon: Award, path: "/dashboard/assessment-result" },
          { key: "assessment-criteria", label: "Assessment Criteria", icon: Award, path: "/dashboard/assessment-criteria" },
        ],
      },
      {
        key: "assessment-reports",
        label: "Assessment Reports",
        icon: BarChart3,
        children: [
          { key: "subject-assessment-report", label: "Subject wise Assessment Report", icon: BarChart3, path: "/dashboard/subject-assessment-report" },
          { key: "final-assessment-grades", label: "Final Assessment Grades", icon: BarChart3, path: "/dashboard/final-assessment-grades" },
          { key: "assessment-plan-status", label: "Assessment Plan Status", icon: BarChart3, path: "/dashboard/assessment-plan-status" },
          { key: "student-report-generation", label: "Student Report Generation Tool", icon: Wrench, path: "/dashboard/student-report-generation" },
        ],
      },
      {
        key: "tools",
        label: "Tools",
        icon: Wrench,
        children: [
          { key: "student-attendance-tool", label: "Student Attendance Tool", icon: Wrench, path: "/dashboard/student-attendance-tool" },
          { key: "assessment-result-tool", label: "Assessment Result Tool", icon: Wrench, path: "/dashboard/assessment-result-tool" },
          { key: "student-group-creation", label: "Student Group Creation Tool", icon: Wrench, path: "/dashboard/student-group-creation" },
          { key: "class-enrollment-tool", label: "Class Enrollment Tool", icon: Wrench, path: "/dashboard/class-enrollment-tool" },
          { key: "subject-scheduling-tool-2", label: "Subject Scheduling Tool", icon: Wrench, path: "/dashboard/subject-scheduling-tool-page" },
          { key: "school-term-result-gen", label: "School Term Result Generator", icon: Wrench, path: "/dashboard/school-term-result-generator" },
          { key: "bulk-term-result-gen", label: "Bulk School Term Result Generator", icon: Wrench, path: "/dashboard/bulk-term-result-generator" },
          { key: "term-result-recalculation", label: "Term Result Recalculation", icon: Wrench, path: "/dashboard/term-result-recalculation" },
        ],
      },
      {
        key: "other-reports",
        label: "Other Reports",
        icon: BarChart3,
        children: [
          { key: "student-guardian-contacts", label: "Student and Guardian Contact Details", icon: BarChart3, path: "/dashboard/student-guardian-contacts" },
        ],
      },
    ],
  },
  {
    key: "hr",
    label: "HR",
    icon: Briefcase,
    children: [
      {
        key: "hr-setup",
        label: "Setup",
        icon: Settings,
        children: [
          { key: "company", label: "Company", icon: Building2, path: "/dashboard/company" },
          { key: "branches", label: "Branch", icon: GitBranch, path: "/dashboard/branches" },
          { key: "departments", label: "Department", icon: Network, path: "/dashboard/departments" },
          { key: "designations", label: "Designation", icon: BadgeCheck, path: "/dashboard/designations" },
        ],
      },
      {
        key: "hr-employee",
        label: "Employee",
        icon: UsersRound,
        children: [
          { key: "employees", label: "Employee", icon: Contact, path: "/dashboard/employees" },
          { key: "employee-groups", label: "Employee Group", icon: UsersRound, path: "/dashboard/employee-groups" },
          { key: "employee-grades", label: "Employee Grade", icon: Award, path: "/dashboard/employee-grades" },
        ],
      },
      {
        key: "hr-leaves",
        label: "Leaves",
        icon: CalendarCheck,
        children: [
          { key: "leave-applications", label: "Leave Application", icon: CalendarCheck, path: "/dashboard/leave-applications" },
          { key: "compensatory-leave-requests", label: "Compensatory Leave Request", icon: CalendarPlus, path: "/dashboard/compensatory-leave-requests" },
        ],
      },
      {
        key: "hr-settings-group",
        label: "Settings",
        icon: Settings,
        children: [
          { key: "hr-settings", label: "HR Settings", icon: Settings, path: "/dashboard/hr-settings" },
          { key: "daily-work-summary-groups", label: "Daily Work Summary Group", icon: ClipboardList, path: "/dashboard/daily-work-summary-groups" },
          { key: "team-updates", label: "Team Updates", icon: MessageSquareText, path: "/dashboard/team-updates" },
        ],
      },
      {
        key: "hr-attendance",
        label: "Attendance",
        icon: CalendarCheck,
        children: [
          { key: "attendance", label: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance" },
          { key: "attendance-requests", label: "Attendance Request", icon: CalendarClock, path: "/dashboard/attendance-requests" },
          { key: "employee-checkins", label: "Employee Checkin", icon: LogIn, path: "/dashboard/employee-checkins" },
        ],
      },
      {
        key: "hr-expense-claim",
        label: "Expense Claim",
        icon: Wallet,
        children: [
          { key: "expense-claims", label: "Expense Claim", icon: Wallet, path: "/dashboard/expense-claims" },
          { key: "employee-advances", label: "Employee Advance", icon: FileText, path: "/dashboard/employee-advances" },
          { key: "travel-requests", label: "Travel Request", icon: CalendarClock, path: "/dashboard/travel-requests" },
        ],
      },
      {
        key: "hr-key-reports",
        label: "Key Reports",
        icon: BarChart3,
        children: [
          { key: "monthly-attendance-sheet", label: "Monthly Attendance Sheet", icon: BarChart3, path: "/dashboard/monthly-attendance-sheet" },
          { key: "recruitment-analytics", label: "Recruitment Analytics", icon: BarChart3, path: "/dashboard/recruitment-analytics" },
          { key: "employee-analytics", label: "Employee Analytics", icon: BarChart3, path: "/dashboard/employee-analytics" },
          { key: "employee-leave-balance", label: "Employee Leave Balance", icon: BarChart3, path: "/dashboard/employee-leave-balance" },
          { key: "employee-leave-balance-summary", label: "Employee Leave Balance Summary", icon: BarChart3, path: "/dashboard/employee-leave-balance-summary" },
          { key: "employee-advance-summary", label: "Employee Advance Summary", icon: BarChart3, path: "/dashboard/employee-advance-summary" },
          { key: "employee-exits", label: "Employee Exits", icon: BarChart3, path: "/dashboard/employee-exits" },
        ],
      },
      {
        key: "hr-other-reports",
        label: "Other Reports",
        icon: BarChart3,
        children: [
          { key: "employee-information", label: "Employee Information", icon: BarChart3, path: "/dashboard/employee-information" },
          { key: "employee-birthday", label: "Employee Birthday", icon: BarChart3, path: "/dashboard/employee-birthday" },
          { key: "employees-working-on-holiday", label: "Employees Working on a Holiday", icon: BarChart3, path: "/dashboard/employees-working-on-holiday" },
          { key: "daily-work-summary-replies", label: "Daily Work Summary Replies", icon: BarChart3, path: "/dashboard/daily-work-summary-replies" },
        ],
      },
    ],
  },
  {
    key: "accounting",
    label: "Accounting",
    icon: Wallet,
    children: [
      {
        key: "accounting-payables",
        label: "Payables",
        icon: FileText,
        children: [
          {
            key: "accounting-invoicing",
            label: "Invoicing",
            icon: ReceiptText,
            children: [
              { key: "purchase-invoices", label: "Purchase Invoice", icon: ReceiptText, path: "/dashboard/purchase-invoices" },
              { key: "suppliers", label: "Supplier", icon: Building2, path: "/dashboard/suppliers" },
            ],
          },
          {
            key: "accounting-payments",
            label: "Payments",
            icon: Wallet,
            children: [
              { key: "payment-entries", label: "Payment Entry", icon: Wallet, path: "/dashboard/payment-entries" },
              { key: "journal-entries", label: "Journal Entry", icon: FileText, path: "/dashboard/journal-entries" },
              { key: "payment-reconciliation", label: "Payment Reconciliation", icon: ReceiptText, path: "/dashboard/payment-reconciliation" },
            ],
          },
          {
            key: "accounting-payables-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "accounts-payable", label: "Accounts Payable", icon: BarChart3, path: "/dashboard/accounts-payable" },
              { key: "accounts-payable-summary", label: "Accounts Payable Summary", icon: BarChart3, path: "/dashboard/accounts-payable-summary" },
              { key: "purchase-register", label: "Purchase Register", icon: BarChart3, path: "/dashboard/purchase-register" },
              { key: "item-wise-purchase-register", label: "Item-wise Purchase Register", icon: BarChart3, path: "/dashboard/item-wise-purchase-register" },
              { key: "purchase-order-analysis", label: "Purchase Order Analysis", icon: BarChart3, path: "/dashboard/purchase-order-analysis" },
              { key: "received-items-to-be-billed", label: "Received Items To Be Billed", icon: BarChart3, path: "/dashboard/received-items-to-be-billed" },
              { key: "supplier-ledger-summary", label: "Supplier Ledger Summary", icon: BarChart3, path: "/dashboard/supplier-ledger-summary" },
            ],
          },
        ],
      },
    ],
  },
];

// ─── TEACHER navigation ───────────────────────────────────────────────

export const TEACHER_NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    children: [
      {
        key: "student-instructor",
        label: "Student & Instructor",
        icon: Users2,
        children: [
          { key: "students", label: "Student", icon: GraduationCap, path: "/dashboard/students" },
          { key: "teachers", label: "Teacher", icon: Contact, path: "/dashboard/teachers" },
          { key: "class-arms", label: "Class Arm", icon: Users2, path: "/dashboard/class-arms" },
        ],
      },
      {
        key: "masters",
        label: "Masters",
        icon: Layers,
        children: [
          { key: "classes", label: "Class", icon: GraduationCap, path: "/dashboard/classes" },
          { key: "subjects", label: "Subject", icon: BookOpen, path: "/dashboard/subjects" },
          { key: "topics", label: "Topic", icon: Tag, path: "/dashboard/topics" },
        ],
      },
      {
        key: "content-masters",
        label: "Content Masters",
        icon: BookOpenCheck,
        children: [
          { key: "articles", label: "Article", icon: FileText, path: "/dashboard/articles" },
          { key: "videos", label: "Video", icon: Play, path: "/dashboard/videos" },
          { key: "quizzes", label: "Quiz", icon: ClipboardList, path: "/dashboard/quizzes" },
        ],
      },
      {
        key: "admission",
        label: "Admission",
        icon: UserPlus,
        children: [
          { key: "subject-enrollment", label: "Subject Enrollment", icon: BookOpen, path: "/dashboard/subject-enrollment" },
        ],
      },
      {
        key: "attendance",
        label: "Attendance",
        icon: CalendarCheck,
        children: [
          { key: "student-leave-application", label: "Student Leave Application", icon: FileText, path: "/dashboard/student-leave-application" },
          { key: "subject-activity", label: "Subject Activity", icon: BookOpen, path: "/dashboard/subject-activity" },
          { key: "quiz-activity", label: "Quiz Activity", icon: ClipboardList, path: "/dashboard/quiz-activity" },
        ],
      },
      {
        key: "assessment-reports",
        label: "Assessment Reports",
        icon: BarChart3,
        children: [
          { key: "subject-assessment-report", label: "Subject wise Assessment Report", icon: BarChart3, path: "/dashboard/subject-assessment-report" },
          { key: "final-assessment-grades", label: "Final Assessment Grades", icon: BarChart3, path: "/dashboard/final-assessment-grades" },
        ],
      },
      {
        key: "tools",
        label: "Tools",
        icon: Wrench,
        children: [
          { key: "student-attendance-tool", label: "Student Attendance Tool", icon: Wrench, path: "/dashboard/student-attendance-tool" },
          { key: "assessment-result-tool", label: "Assessment Result Tool", icon: Wrench, path: "/dashboard/assessment-result-tool" },
        ],
      },
      {
        key: "other-reports",
        label: "Other Reports",
        icon: BarChart3,
        children: [
          { key: "student-guardian-contacts", label: "Student and Guardian Contact Details", icon: BarChart3, path: "/dashboard/student-guardian-contacts" },
        ],
      },
    ],
  },
];

/**
 * Recursively collect all `path` values from a nav tree so we can quickly
 * determine which paths are valid for a role.
 */
export function collectPaths(nav) {
  const paths = new Set();
  function walk(items) {
    for (const item of items) {
      if (item.path) paths.add(item.path);
      if (item.children) walk(item.children);
    }
  }
  walk(nav);
  return paths;
}
