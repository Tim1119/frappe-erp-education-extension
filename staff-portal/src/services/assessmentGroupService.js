import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.assessment_group_api";

export function getAssessmentGroups() {
  return api(`${METHOD}.get_assessment_groups`);
}

export function getAssessmentGroup(name) {
  return api(`${METHOD}.get_assessment_group`, { name });
}

export function createAssessmentGroup(data) {
  return api(`${METHOD}.create_assessment_group`, { data });
}

export function updateAssessmentGroup(name, data) {
  return api(`${METHOD}.update_assessment_group`, { name, data });
}

export function deleteAssessmentGroup(name) {
  return api(`${METHOD}.delete_assessment_group`, { name });
}

export function getConnections(assessment_group) {
  return api(`${METHOD}.get_connections`, { assessment_group });
}
