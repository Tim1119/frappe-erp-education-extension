import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.assessment_plan_api";

export function getAssessmentPlans(params) {
  return api(`${METHOD}.get_assessment_plans`, params);
}

export function getAssessmentPlan(name) {
  return api(`${METHOD}.get_assessment_plan`, { name });
}

export function createAssessmentPlan(data) {
  return api(`${METHOD}.create_assessment_plan`, { data });
}

export function updateAssessmentPlan(name, data) {
  return api(`${METHOD}.update_assessment_plan`, { name, data });
}

export function deleteAssessmentPlan(name) {
  return api(`${METHOD}.delete_assessment_plan`, { name });
}

export function submitAssessmentPlan(name) {
  return api(`${METHOD}.submit_assessment_plan`, { name });
}

export function cancelAssessmentPlan(name) {
  return api(`${METHOD}.cancel_assessment_plan`, { name });
}

export function getConnections(assessment_plan) {
  return api(`${METHOD}.get_connections`, { assessment_plan });
}

export function getStudentGroupDetails(student_group) {
  return api(`${METHOD}.get_student_group_details`, { student_group });
}

export function getCourseDefaultGradingScale(course) {
  return api(`${METHOD}.get_course_default_grading_scale`, { course });
}

export function getCriteriaTemplate(course, maximum_assessment_score) {
  return api(`${METHOD}.get_criteria_template`, { course, maximum_assessment_score });
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}

export function getLeafAssessmentGroups() {
  return api(`${METHOD}.get_leaf_assessment_groups`);
}

export function getSubmittedGradingScales() {
  return api(`${METHOD}.get_submitted_grading_scales`);
}

export function getCoursesForProgram(program) {
  return api(`${METHOD}.get_courses_for_program`, { program });
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getClassrooms() {
  return api(`${METHOD}.get_classrooms`);
}

export function getInstructors() {
  return api(`${METHOD}.get_instructors`);
}

export function getAssessmentCriteriaOptions() {
  return api(`${METHOD}.get_assessment_criteria_options`);
}
