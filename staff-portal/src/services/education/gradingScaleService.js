import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.grading_scale_api";

export function getGradingScales(params) {
  return api(`${METHOD}.get_grading_scales`, params);
}

export function getGradingScale(name) {
  return api(`${METHOD}.get_grading_scale`, { name });
}

export function createGradingScale(data) {
  return api(`${METHOD}.create_grading_scale`, { data });
}

export function updateGradingScale(name, data) {
  return api(`${METHOD}.update_grading_scale`, { name, data });
}

export function deleteGradingScale(name) {
  return api(`${METHOD}.delete_grading_scale`, { name });
}

export function submitGradingScale(name) {
  return api(`${METHOD}.submit_grading_scale`, { name });
}

export function cancelGradingScale(name) {
  return api(`${METHOD}.cancel_grading_scale`, { name });
}

export function getConnections(grading_scale) {
  return api(`${METHOD}.get_connections`, { grading_scale });
}
