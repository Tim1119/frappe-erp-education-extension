// Mirrors education.education.api.get_grade(): highest Grading Scale
// interval threshold <= the given percentage, "" if none match. Shared
// by Assessment Result's own form (live per-row/overall grade preview)
// and Assessment Result Tool (live per-cell grade preview across a whole
// Class Arm) -- same real algorithm, not re-derived per caller.
export function computeGrade(intervals, percentage) {
  const sorted = [...intervals].sort((a, b) => (b.threshold ?? 0) - (a.threshold ?? 0));
  for (const iv of sorted) {
    if (percentage >= (iv.threshold ?? 0)) return iv.grade_code;
  }
  return "";
}
