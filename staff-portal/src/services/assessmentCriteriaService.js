import api from "./api";

const METHOD = "education_extension.staff_portal_api.assessment_criteria_api";

export function getAssessmentCriteriaList(params) {
  return api(`${METHOD}.get_assessment_criteria_list`, params);
}

export function getAssessmentCriteria(name) {
  return api(`${METHOD}.get_assessment_criteria`, { name });
}

export function createAssessmentCriteria(data) {
  return api(`${METHOD}.create_assessment_criteria`, { data });
}

export function updateAssessmentCriteria(name, data) {
  return api(`${METHOD}.update_assessment_criteria`, { name, data });
}

export function deleteAssessmentCriteria(name) {
  return api(`${METHOD}.delete_assessment_criteria`, { name });
}

export function getAssessmentCriteriaGroups() {
  return api(`${METHOD}.get_assessment_criteria_groups`);
}
