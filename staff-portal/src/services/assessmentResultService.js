import api from "./api";

const METHOD = "education_extension.staff_portal_api.assessment_result_api";

export function getAssessmentResults(params) {
  return api(`${METHOD}.get_assessment_results`, params);
}

export function getAssessmentResult(name) {
  return api(`${METHOD}.get_assessment_result`, { name });
}

export function createAssessmentResult(data) {
  return api(`${METHOD}.create_assessment_result`, { data });
}

export function updateAssessmentResult(name, data) {
  return api(`${METHOD}.update_assessment_result`, { name, data });
}

export function deleteAssessmentResult(name) {
  return api(`${METHOD}.delete_assessment_result`, { name });
}

export function submitAssessmentResult(name) {
  return api(`${METHOD}.submit_assessment_result`, { name });
}

export function cancelAssessmentResult(name) {
  return api(`${METHOD}.cancel_assessment_result`, { name });
}

export function getSubmittedAssessmentPlans() {
  return api(`${METHOD}.get_submitted_assessment_plans`);
}

export function getAssessmentPlanDetails(assessment_plan) {
  return api(`${METHOD}.get_assessment_plan_details`, { assessment_plan });
}

export function getAssessmentCriteriaForPlan(assessment_plan) {
  return api(`${METHOD}.get_assessment_criteria_for_plan`, { assessment_plan });
}

export function getGradingScaleIntervals(grading_scale) {
  return api(`${METHOD}.get_grading_scale_intervals`, { grading_scale });
}

export function getStudentsForClassArm(student_group) {
  return api(`${METHOD}.get_students_for_class_arm`, { student_group });
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms() {
  return api(`${METHOD}.get_academic_terms`);
}

export function getLeafAssessmentGroups() {
  return api(`${METHOD}.get_leaf_assessment_groups`);
}

export function getSubmittedGradingScales() {
  return api(`${METHOD}.get_submitted_grading_scales`);
}
