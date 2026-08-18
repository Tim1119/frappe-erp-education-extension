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
  HandCoins,
  Bell,
  UserCog,
  AlertCircle,
  UserSearch,
  MessageSquare,
  Clock,
  Timer,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
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
        key: "hr-overview",
        label: "HR Overview",
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
        key: "hr-key-reports",
        label: "Key Reports",
        icon: BarChart3,
        children: [
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
          { key: "daily-work-summary-replies", label: "Daily Work Summary Replies", icon: BarChart3, path: "/dashboard/daily-work-summary-replies" },
        ],
      },
        ],
      },
      {
        key: "employee-lifecycle",
        label: "Employee Lifecycle",
        icon: UserCog,
        children: [
          {
            key: "lifecycle-onboarding",
            label: "Onboarding",
            icon: UserPlus,
            children: [
              { key: "employee-onboarding-template", label: "Employee Onboarding Template", icon: FileText, path: "/dashboard/employee-onboarding-template" },
              { key: "employee-onboarding", label: "Employee Onboarding", icon: FileText, path: "/dashboard/employee-onboarding" },
              { key: "employee-skill-map", label: "Employee Skill Map", icon: FileText, path: "/dashboard/employee-skill-map" },
            ],
          },
          {
            key: "lifecycle-grievance",
            label: "Grievance",
            icon: AlertCircle,
            children: [
              { key: "grievance-type", label: "Grievance Type", icon: FileText, path: "/dashboard/grievance-type" },
              { key: "employee-grievance", label: "Employee Grievance", icon: FileText, path: "/dashboard/employee-grievance" },
            ],
          },
          {
            key: "lifecycle-training",
            label: "Training",
            icon: GraduationCap,
            children: [
              { key: "training-program", label: "Training Program", icon: FileText, path: "/dashboard/training-program" },
              { key: "training-event", label: "Training Event", icon: FileText, path: "/dashboard/training-event" },
              { key: "training-feedback", label: "Training Feedback", icon: FileText, path: "/dashboard/training-feedback" },
              { key: "training-result", label: "Training Result", icon: FileText, path: "/dashboard/training-result" },
            ],
          },
          {
            key: "lifecycle-daily-work-summary",
            label: "Daily Work Summary",
            icon: ClipboardList,
            children: [
              { key: "lifecycle-daily-work-summaries", label: "Daily Work Summary", icon: ClipboardList, path: "/dashboard/daily-work-summaries" },
              { key: "lifecycle-daily-work-summary-groups", label: "Daily Work Summary Group", icon: ClipboardList, path: "/dashboard/daily-work-summary-groups" },
              { key: "lifecycle-daily-work-summary-replies", label: "Daily Work Summary Replies", icon: BarChart3, path: "/dashboard/daily-work-summary-replies" },
            ],
          },
          {
            key: "lifecycle-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "lifecycle-employee-exits", label: "Employee Exits", icon: BarChart3, path: "/dashboard/employee-exits" },
              { key: "lifecycle-employee-birthday", label: "Employee Birthday", icon: BarChart3, path: "/dashboard/employee-birthday" },
              { key: "lifecycle-employee-information", label: "Employee Information", icon: BarChart3, path: "/dashboard/employee-information" },
              { key: "lifecycle-employee-analytics", label: "Employee Analytics", icon: BarChart3, path: "/dashboard/employee-analytics" },
            ],
          },
        ],
      },
      {
        key: "recruitment",
        label: "Recruitment",
        icon: UserSearch,
        children: [
          {
            key: "recruitment-jobs",
            label: "Jobs",
            icon: Briefcase,
            children: [
              { key: "staffing-plan", label: "Staffing Plan", icon: FileText, path: "/dashboard/staffing-plan" },
              { key: "job-requisition", label: "Job Requisition", icon: FileText, path: "/dashboard/job-requisition" },
              { key: "job-opening", label: "Job Opening", icon: FileText, path: "/dashboard/job-opening" },
              { key: "job-applicant", label: "Job Applicant", icon: FileText, path: "/dashboard/job-applicants" },
              { key: "job-offer", label: "Job Offer", icon: FileText, path: "/dashboard/job-offers" },
              { key: "employee-referral", label: "Employee Referral", icon: FileText, path: "/dashboard/employee-referrals" },
            ],
          },
          {
            key: "recruitment-interviews",
            label: "Interviews",
            icon: MessageSquare,
            children: [
              { key: "interview-type", label: "Interview Type", icon: FileText, path: "/dashboard/interview-types" },
              { key: "interview-round", label: "Interview Round", icon: FileText, path: "/dashboard/interview-rounds" },
              { key: "interview", label: "Interview", icon: FileText, path: "/dashboard/interviews" },
              { key: "interview-feedback", label: "Interview Feedback", icon: FileText, path: "/dashboard/interview-feedback" },
            ],
          },
          {
            key: "recruitment-appointment",
            label: "Appointment",
            icon: Award,
            children: [
              { key: "appointment-letter-template", label: "Appointment Letter Template", icon: FileText, path: "/dashboard/appointment-letter-templates" },
              { key: "appointment-letter", label: "Appointment Letter", icon: FileText, path: "/dashboard/appointment-letters" },
            ],
          },
          {
            key: "recruitment-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "recruitment-analytics-report", label: "Recruitment Analytics", icon: BarChart3, path: "/dashboard/recruitment-analytics" },
            ],
          },
        ],
      },
      {
        key: "shift-and-attendance",
        label: "Shift & Attendance",
        icon: Clock,
        children: [
          {
            key: "sa-shifts",
            label: "Shifts",
            icon: Clock,
            children: [
              { key: "shift-type", label: "Shift Type", icon: FileText, path: "/dashboard/shift-types" },
              { key: "shift-location", label: "Shift Location", icon: FileText, path: "/dashboard/shift-locations" },
              { key: "shift-assignment", label: "Shift Assignment", icon: FileText, path: "/dashboard/shift-assignments" },
              { key: "shift-schedule", label: "Shift Schedule", icon: FileText, path: "/dashboard/shift-schedules" },
              { key: "shift-schedule-assignment", label: "Shift Schedule Assignment", icon: FileText, path: "/dashboard/shift-schedule-assignments" },
              { key: "shift-request", label: "Shift Request", icon: FileText, path: "/dashboard/shift-requests" },
              { key: "shift-assignment-tool", label: "Shift Assignment Tool", icon: Wrench, path: "/dashboard/shift-assignment-tool" },
            ],
          },
          {
            key: "sa-attendance",
            label: "Attendance",
            icon: CalendarCheck,
            children: [
              { key: "sa-attendance-list", label: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance" },
              { key: "sa-attendance-requests", label: "Attendance Request", icon: CalendarClock, path: "/dashboard/attendance-requests" },
              { key: "sa-employee-checkins", label: "Employee Checkin", icon: LogIn, path: "/dashboard/employee-checkins" },
            ],
          },
          {
            key: "sa-time",
            label: "Time",
            icon: Timer,
            children: [
              { key: "timesheet", label: "Timesheet", icon: FileText, path: "/dashboard/timesheets" },
              { key: "activity-type", label: "Activity Type", icon: FileText, path: "/dashboard/activity-types" },
            ],
          },
          {
            key: "sa-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "sa-monthly-attendance-sheet", label: "Monthly Attendance Sheet", icon: BarChart3, path: "/dashboard/monthly-attendance-sheet" },
              { key: "shift-attendance-report", label: "Shift Attendance", icon: BarChart3, path: "/dashboard/shift-attendance" },
              { key: "employee-hours-utilization", label: "Employee Hours Utilization", icon: BarChart3, path: "/dashboard/employee-hours-utilization" },
              { key: "sa-employees-on-holiday", label: "Employees Working on a Holiday", icon: BarChart3, path: "/dashboard/employees-working-on-holiday" },
            ],
          },
        ],
      },
      {
        key: "hr-expense-claims",
        label: "Expense Claims",
        icon: Wallet,
        children: [
          {
            key: "expense-claims-claims",
            label: "Claims",
            icon: Wallet,
            children: [
              { key: "expense-claims", label: "Expense Claim", icon: Wallet, path: "/dashboard/expense-claims" },
              { key: "expense-claim-types", label: "Expense Claim Type", icon: Tag, path: "/dashboard/expense-claim-types" },
            ],
          },
          {
            key: "expense-claims-advances",
            label: "Advances",
            icon: Wallet,
            children: [
              { key: "employee-advances", label: "Employee Advance", icon: FileText, path: "/dashboard/employee-advances" },
              { key: "expense-payment-entries", label: "Payment Entry", icon: Wallet, path: "/dashboard/payment-entries" },
              { key: "expense-journal-entries", label: "Journal Entry", icon: FileText, path: "/dashboard/journal-entries" },
              { key: "additional-salaries", label: "Additional Salary", icon: FileText, path: "/dashboard/additional-salaries" },
            ],
          },
          {
            key: "expense-claims-travel",
            label: "Travel",
            icon: CalendarClock,
            children: [
              { key: "travel-requests", label: "Travel Request", icon: CalendarClock, path: "/dashboard/travel-requests" },
              { key: "purposes-of-travel", label: "Purpose of Travel", icon: Tag, path: "/dashboard/purposes-of-travel" },
            ],
          },
          {
            key: "expense-claims-fleet",
            label: "Fleet Management",
            icon: Briefcase,
            children: [
              { key: "vehicles", label: "Vehicle", icon: Briefcase, path: "/dashboard/vehicles" },
              { key: "drivers", label: "Driver", icon: Contact, path: "/dashboard/drivers" },
              { key: "vehicle-service-items", label: "Vehicle Service Item", icon: Wrench, path: "/dashboard/vehicle-service-items" },
              { key: "vehicle-logs", label: "Vehicle Log", icon: ClipboardList, path: "/dashboard/vehicle-logs" },
            ],
          },
          {
            key: "expense-claims-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "expense-employee-advance-summary", label: "Employee Advance Summary", icon: BarChart3, path: "/dashboard/employee-advance-summary" },
              { key: "unpaid-expense-claim", label: "Unpaid Expense Claim", icon: BarChart3, path: "/dashboard/unpaid-expense-claim" },
              { key: "vehicle-expenses", label: "Vehicle Expenses", icon: BarChart3, path: "/dashboard/vehicle-expenses" },
            ],
          },
          {
            key: "expense-claims-accounting-reports",
            label: "Accounting Reports",
            icon: BarChart3,
            children: [
              { key: "expense-accounts-receivable", label: "Accounts Receivable", icon: BarChart3, path: "/dashboard/accounts-receivable" },
              { key: "expense-accounts-payable", label: "Accounts Payable", icon: BarChart3, path: "/dashboard/accounts-payable" },
              { key: "expense-general-ledger", label: "General Ledger", icon: BarChart3, path: "/dashboard/general-ledger" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "buying",
    label: "Buying",
    icon: ShoppingCart,
    children: [
      {
        key: "buying-transactions",
        label: "Buying",
        icon: ShoppingBag,
        children: [
          { key: "material-request", label: "Material Request", icon: FileText, path: "/dashboard/material-requests" },
          { key: "purchase-order", label: "Purchase Order", icon: FileText, path: "/dashboard/purchase-orders" },
          { key: "request-for-quotation", label: "Request for Quotation", icon: FileText, path: "/dashboard/request-for-quotation" },
          { key: "supplier-quotation", label: "Supplier Quotation", icon: FileText, path: "/dashboard/supplier-quotations" },
        ],
      },
      {
        key: "buying-items",
        label: "Items & Pricing",
        icon: Package,
        children: [
          { key: "item", label: "Item", icon: Package, path: "/dashboard/items" },
          { key: "item-price", label: "Item Price", icon: FileText, path: "/dashboard/item-prices" },
          { key: "price-list", label: "Price List", icon: FileText, path: "/dashboard/price-lists" },
          { key: "product-bundle", label: "Product Bundle", icon: FileText, path: "/dashboard/product-bundles" },
          { key: "item-group", label: "Item Group", icon: FileText, path: "/dashboard/item-groups" },
          { key: "pricing-rule", label: "Pricing Rule", icon: FileText, path: "/dashboard/pricing-rules" },
          { key: "promotional-scheme", label: "Promotional Scheme", icon: FileText, path: "/dashboard/promotional-schemes" },
        ],
      },
      {
        key: "buying-settings",
        label: "Settings",
        icon: Settings,
        children: [
          { key: "buying-settings-page", label: "Buying Settings", icon: Settings, path: "/dashboard/buying-settings" },
          { key: "purchase-taxes-template", label: "Purchase Taxes and Charges Template", icon: FileText, path: "/dashboard/purchase-taxes-templates" },
          { key: "terms-and-conditions", label: "Terms and Conditions", icon: FileText, path: "/dashboard/terms-and-conditions" },
        ],
      },
      {
        key: "buying-supplier",
        label: "Supplier",
        icon: Users,
        children: [
          { key: "buying-suppliers", label: "Supplier", icon: Users, path: "/dashboard/suppliers" },
          { key: "supplier-group", label: "Supplier Group", icon: FileText, path: "/dashboard/supplier-groups" },
        ],
      },
      {
        key: "buying-key-reports",
        label: "Key Reports",
        icon: BarChart3,
        children: [
          { key: "purchase-analytics", label: "Purchase Analytics", icon: BarChart3, path: "/dashboard/purchase-analytics" },
          { key: "buying-purchase-order-analysis", label: "Purchase Order Analysis", icon: BarChart3, path: "/dashboard/purchase-order-analysis" },
          { key: "supplier-wise-analytics", label: "Supplier-Wise Sales Analytics", icon: BarChart3, path: "/dashboard/supplier-wise-sales-analytics" },
          { key: "items-to-order", label: "Items to Order and Receive", icon: BarChart3, path: "/dashboard/items-to-order-and-receive" },
          { key: "purchase-order-trends", label: "Purchase Order Trends", icon: BarChart3, path: "/dashboard/purchase-order-trends" },
          { key: "procurement-tracker", label: "Procurement Tracker", icon: BarChart3, path: "/dashboard/procurement-tracker" },
        ],
      },
      {
        key: "buying-other-reports",
        label: "Other Reports",
        icon: BarChart3,
        children: [
          { key: "items-to-be-requested", label: "Items To Be Requested", icon: BarChart3, path: "/dashboard/items-to-be-requested" },
          { key: "item-wise-purchase-history", label: "Item-wise Purchase History", icon: BarChart3, path: "/dashboard/item-wise-purchase-history" },
          { key: "purchase-receipt-trends", label: "Purchase Receipt Trends", icon: BarChart3, path: "/dashboard/purchase-receipt-trends" },
          { key: "buying-purchase-invoice-trends", label: "Purchase Invoice Trends", icon: BarChart3, path: "/dashboard/purchase-invoice-trends" },
          { key: "supplier-quotation-comparison", label: "Supplier Quotation Comparison", icon: BarChart3, path: "/dashboard/supplier-quotation-comparison" },
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
      {
        key: "accounting-receivables",
        label: "Receivables",
        icon: HandCoins,
        children: [
          {
            key: "receivables-invoicing",
            label: "Invoicing",
            icon: ReceiptText,
            children: [
              { key: "sales-invoices", label: "Sales Invoice", icon: ReceiptText, path: "/dashboard/sales-invoices" },
              { key: "customers", label: "Customer", icon: UsersRound, path: "/dashboard/customers" },
            ],
          },
          {
            key: "receivables-payments",
            label: "Payments",
            icon: Wallet,
            children: [
              { key: "receivables-payment-entry", label: "Payment Entry", icon: Wallet, path: "/dashboard/payment-entries" },
              { key: "receivables-journal-entry", label: "Journal Entry", icon: FileText, path: "/dashboard/journal-entries" },
              { key: "receivables-payment-reconciliation", label: "Payment Reconciliation", icon: ReceiptText, path: "/dashboard/payment-reconciliation" },
            ],
          },
          {
            key: "receivables-dunning",
            label: "Dunning",
            icon: Bell,
            children: [
              { key: "dunning", label: "Dunning", icon: Bell, path: "/dashboard/dunning" },
              { key: "dunning-types", label: "Dunning Type", icon: Tag, path: "/dashboard/dunning-types" },
            ],
          },
          {
            key: "receivables-reports",
            label: "Reports",
            icon: BarChart3,
            children: [
              { key: "accounts-receivable", label: "Accounts Receivable", icon: BarChart3, path: "/dashboard/accounts-receivable" },
              { key: "accounts-receivable-summary", label: "Accounts Receivable Summary", icon: BarChart3, path: "/dashboard/accounts-receivable-summary" },
              { key: "sales-register", label: "Sales Register", icon: BarChart3, path: "/dashboard/sales-register" },
              { key: "item-wise-sales-register", label: "Item-wise Sales Register", icon: BarChart3, path: "/dashboard/item-wise-sales-register" },
              { key: "delivered-items-to-be-billed", label: "Delivered Items To Be Billed", icon: BarChart3, path: "/dashboard/delivered-items-to-be-billed" },
            ],
          },
        ],
      },
      {
        key: "financial-reports",
        label: "Financial Reports",
        icon: BarChart3,
        children: [
          {
            key: "ledgers",
            label: "Ledgers",
            icon: BarChart3,
            children: [
              { key: "general-ledger", label: "General Ledger", icon: BarChart3, path: "/dashboard/general-ledger" },
              { key: "customer-ledger-summary", label: "Customer Ledger Summary", icon: BarChart3, path: "/dashboard/customer-ledger-summary" },
              { key: "supplier-ledger-summary", label: "Supplier Ledger Summary", icon: BarChart3, path: "/dashboard/supplier-ledger-summary" },
            ],
          },
          {
            key: "financial-statements",
            label: "Financial Statements",
            icon: BarChart3,
            children: [
              { key: "trial-balance", label: "Trial Balance", icon: BarChart3, path: "/dashboard/trial-balance" },
              { key: "profit-and-loss", label: "Profit and Loss Statement", icon: BarChart3, path: "/dashboard/profit-and-loss" },
              { key: "balance-sheet", label: "Balance Sheet", icon: BarChart3, path: "/dashboard/balance-sheet" },
              { key: "cash-flow", label: "Cash Flow", icon: BarChart3, path: "/dashboard/cash-flow" },
              { key: "consolidated-financial-statement", label: "Consolidated Financial Statement", icon: BarChart3, path: "/dashboard/consolidated-financial-statement" },
            ],
          },
          {
            key: "profitability",
            label: "Profitability",
            icon: BarChart3,
            children: [
              { key: "gross-profit", label: "Gross Profit", icon: BarChart3, path: "/dashboard/gross-profit" },
              { key: "profitability-analysis", label: "Profitability Analysis", icon: BarChart3, path: "/dashboard/profitability-analysis" },
              { key: "sales-invoice-trends", label: "Sales Invoice Trends", icon: BarChart3, path: "/dashboard/sales-invoice-trends" },
              { key: "purchase-invoice-trends", label: "Purchase Invoice Trends", icon: BarChart3, path: "/dashboard/purchase-invoice-trends" },
            ],
          },
          {
            key: "other-reports",
            label: "Other Reports",
            icon: BarChart3,
            children: [
              { key: "trial-balance-for-party", label: "Trial Balance for Party", icon: BarChart3, path: "/dashboard/trial-balance-for-party" },
              { key: "payment-period-based-on-invoice-date", label: "Payment Period Based On Invoice Date", icon: BarChart3, path: "/dashboard/payment-period-based-on-invoice-date" },
              { key: "sales-partners-commission", label: "Sales Partners Commission", icon: BarChart3, path: "/dashboard/sales-partners-commission" },
              { key: "customer-credit-balance", label: "Customer Credit Balance", icon: BarChart3, path: "/dashboard/customer-credit-balance" },
              { key: "sales-payment-summary", label: "Sales Payment Summary", icon: BarChart3, path: "/dashboard/sales-payment-summary" },
              { key: "address-and-contacts", label: "Address And Contacts", icon: BarChart3, path: "/dashboard/address-and-contacts" },
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
