import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.academic_year_api";

export function getAcademicYears(params) {
  return api(`${METHOD}.get_academic_years`, params);
}

export function getAcademicYear(name) {
  return api(`${METHOD}.get_academic_year`, { name });
}

export function createAcademicYear(data) {
  return api(`${METHOD}.create_academic_year`, { data });
}

export function updateAcademicYear(name, data) {
  return api(`${METHOD}.update_academic_year`, { name, data });
}

export function deleteAcademicYear(name) {
  return api(`${METHOD}.delete_academic_year`, { name });
}

export function getConnections(academic_year) {
  return api(`${METHOD}.get_connections`, { academic_year });
}
