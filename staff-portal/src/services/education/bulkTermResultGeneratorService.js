import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.bulk_school_term_class_result_generator_api";

export function checkExistingResults(assessment_group, academic_year, academic_term, student_group) {
  return api(`${METHOD}.check_existing_results`, {
    assessment_group, academic_year, academic_term, student_group,
  });
}

export function generateClassResults(assessment_group, academic_year, academic_term, student_group, date_of_result_issue) {
  return api(`${METHOD}.generate_class_results`, {
    assessment_group, academic_year, academic_term, student_group, date_of_result_issue,
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
