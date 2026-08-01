import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_group_creation_tool_api";

export function getCandidateGroups(program, academic_year, academic_term, separate_groups) {
  return api(`${METHOD}.get_courses`, {
    program,
    academic_year,
    academic_term,
    separate_groups: separate_groups ? 1 : 0,
  });
}

// courses is the reviewed/edited child-table array -- real backend
// (Document.create_student_groups()) reads it as `data.courses` and
// json.loads() the whole `data` payload if it arrives as a string.
export function createStudentGroups(data) {
  return api(`${METHOD}.create_student_groups`, { data: JSON.stringify(data) });
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getStudentBatchNames() {
  return api(`${METHOD}.get_student_batch_names`);
}

export function getProgramCourses(program) {
  return api(`${METHOD}.get_program_courses`, { program });
}
