import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.education_settings_api";

export function getEducationSettings() {
  return api(`${METHOD}.get_education_settings`);
}

export function updateEducationSettings(data) {
  return api(`${METHOD}.update_education_settings`, { data });
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}
