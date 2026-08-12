import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.term_result_recalculation_api";

export function getRecalculationPreview(academic_year, academic_term, assessment_group, student_group) {
  return api(`${METHOD}.get_recalculation_preview`, {
    academic_year, academic_term, assessment_group, student_group,
  });
}

export function recalculateTermResults(academic_year, academic_term, assessment_group, student_group) {
  return api(`${METHOD}.recalculate_term_results`, {
    academic_year, academic_term, assessment_group, student_group,
  });
}

export function getAssessmentGroups() {
  return api(`${METHOD}.get_assessment_groups`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}
