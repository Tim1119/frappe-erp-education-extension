import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.academic_term_api";

export function getAcademicTerms(params) {
  return api(`${METHOD}.get_academic_terms`, params);
}

export function getAcademicTerm(name) {
  return api(`${METHOD}.get_academic_term`, { name });
}

export function createAcademicTerm(data) {
  return api(`${METHOD}.create_academic_term`, { data });
}

export function updateAcademicTerm(name, data) {
  return api(`${METHOD}.update_academic_term`, { name, data });
}

export function deleteAcademicTerm(name) {
  return api(`${METHOD}.delete_academic_term`, { name });
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getConnections(academic_term) {
  return api(`${METHOD}.get_connections`, { academic_term });
}