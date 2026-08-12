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
