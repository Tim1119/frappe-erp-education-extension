import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.program_enrollment_tool_api";

export function getCandidateStudents(get_students_from, program, academic_year, academic_term, student_batch) {
  return api(`${METHOD}.get_students`, {
    get_students_from, program, academic_year, academic_term, student_batch,
  });
}

// data.students is the reviewed/selected child-table array -- real
// backend (Document.enroll_students()) reads it as `data.students` and
// json.loads() the whole `data` payload if it arrives as a string.
export function enrollStudents(data) {
  return api(`${METHOD}.enroll_students`, { data: JSON.stringify(data) });
}

export function getAcademicTermReqd() {
  return api(`${METHOD}.get_academic_term_reqd`);
}

export function getPeriodStartDate(academic_term, academic_year) {
  return api(`${METHOD}.get_period_start_date`, { academic_term, academic_year });
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
