import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getErrorMessage } from "@/utils/errors";
import toast from "react-hot-toast";

// ─── useAsync ──────────────────────────────────────────────────────────

export function useAsync(factory, deps = [], fallback = null, options = {}) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(factory)
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err);
        if (options.showError !== false) {
          toast.error(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, setData, loading, error, reload };
}

// ─── useDebounce ───────────────────────────────────────────────────────

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── usePagination ─────────────────────────────────────────────────────

export function usePagination(initial = 1) {
  const [page, setPage] = useState(initial);
  const reset = useCallback(() => setPage(1), []);
  return { page, setPage, reset };
}

// ─── useBreadcrumbs ────────────────────────────────────────────────────

/**
 * Build breadcrumbs from the current route path.
 *
 * Example: /dashboard/students/STU-001/edit
 *   → [ { label: "Dashboard", href: "/dashboard" },
 *        { label: "Students",  href: "/dashboard/students" },
 *        { label: "STU-001",   href: "/dashboard/students/STU-001" },
 *        { label: "Edit" } ]
 *
 * The optional `overrides` object lets pages replace auto-generated
 * segments. E.g. { "STU-001": "John Doe" }
 */

const LABEL_MAP = {
  dashboard: "Dashboard",
  students: "Students",
  teachers: "Teachers",
  guardians: "Guardians",
  classes: "Classes",
  "class-arms": "Class Arms",
  subjects: "Subjects",
  topics: "Topics",
  articles: "Articles",
  videos: "Videos",
  quizzes: "Quizzes",
  classrooms: "Classrooms",
  company: "Companies",
  branches: "Branches",
  departments: "Departments",
  designations: "Designations",
  employees: "Employees",
  "fee-category": "Fee Category",
  "fee-structure": "Fee Structure",
  "fee-schedule": "Fee Schedule",
  fees: "Fees",
  "sales-invoices": "Sales Invoices",
  "student-applicants": "Student Applicants",
  "student-admissions": "Student Admissions",
  "student-log": "Student Log",
  "education-settings": "Education Settings",
  "student-category": "Student Category",
  "student-batch-name": "Student Batch Name",
  "grading-scale": "Grading Scale",
  "academic-term": "Academic Term",
  "academic-year": "Academic Year",
  "school-settings": "School Settings",
  "class-enrollment": "Class Enrollment",
  "subject-enrollment": "Subject Enrollment",
  "subject-schedule": "Subject Schedule",
  "subject-scheduling-tool": "Subject Scheduling Tool",
  "student-attendance": "Student Attendance",
  "student-leave-application": "Student Leave Application",
  "student-monthly-attendance": "Student Monthly Attendance",
  "absent-student-report": "Absent Student Report",
  "student-batch-attendance": "Batch-Wise Attendance",
  "subject-activity": "Subject Activity",
  "quiz-activity": "Quiz Activity",
  "assessment-group": "Assessment Group",
  "assessment-plan": "Assessment Plan",
  "assessment-result": "Assessment Result",
  "assessment-criteria": "Assessment Criteria",
  "subject-assessment-report": "Subject Assessment Report",
  "final-assessment-grades": "Final Assessment Grades",
  "assessment-plan-status": "Assessment Plan Status",
  "student-report-generation": "Student Report Generation",
  "student-attendance-tool": "Student Attendance Tool",
  "assessment-result-tool": "Assessment Result Tool",
  "student-group-creation": "Student Group Creation",
  "class-enrollment-tool": "Class Enrollment Tool",
  "school-term-result-generator": "School Term Result Generator",
  "bulk-term-result-generator": "Bulk Term Result Generator",
  "student-guardian-contacts": "Student & Guardian Contacts",
  "student-fee-collection-report": "Student Fee Collection Report",
  "class-fee-collection-report": "Class Fee Collection Report",
  new: "New",
  edit: "Edit",
};

export function useBreadcrumbs(overrides = {}) {
  const location = useLocation();

  return useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const crumbs = [];

    let href = "";
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      href += `/${seg}`;

      const label =
        overrides[seg] ||
        LABEL_MAP[seg] ||
        decodeURIComponent(seg).replace(/-/g, " ");

      const isLast = i === parts.length - 1;
      crumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: isLast ? undefined : href,
      });
    }

    return crumbs;
  }, [location.pathname, overrides]);
}
