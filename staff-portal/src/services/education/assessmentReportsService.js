import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.assessment_reports_api";

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academicYear) {
  return api(`${METHOD}.get_academic_terms`, { academic_year: academicYear });
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}

export function getBatchStudentGroups(academicYear) {
  return api(`${METHOD}.get_batch_student_groups`, { academic_year: academicYear });
}

export function getAssessmentGroups() {
  return api(`${METHOD}.get_assessment_groups`);
}

export function getLeafAssessmentGroups() {
  return api(`${METHOD}.get_leaf_assessment_groups`);
}
