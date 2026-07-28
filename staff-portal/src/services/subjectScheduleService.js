import api from "./api";

const METHOD = "education_extension.staff_portal_api.subject_schedule_api";

export function getSubjectSchedules(params) {
  return api(`${METHOD}.get_subject_schedules`, params);
}

export function getSubjectSchedule(name) {
  return api(`${METHOD}.get_subject_schedule`, { name });
}

export function getConnections(subjectSchedule) {
  return api(`${METHOD}.get_connections`, { subject_schedule: subjectSchedule });
}

export function createSubjectSchedule(data) {
  return api(`${METHOD}.create_subject_schedule`, { data });
}

export function updateSubjectSchedule(name, data) {
  return api(`${METHOD}.update_subject_schedule`, { name, data });
}

export function deleteSubjectSchedule(name) {
  return api(`${METHOD}.delete_subject_schedule`, { name });
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}

export function getInstructors() {
  return api(`${METHOD}.get_instructors`);
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

export function getInstructorsForStudentGroup(studentGroup) {
  return api(`${METHOD}.get_instructors_for_student_group`, { student_group: studentGroup });
}

export function getCoursesForProgram(program) {
  return api(`${METHOD}.get_courses_for_program`, { program });
}

export function getRooms() {
  return api(`${METHOD}.get_rooms`);
}

export function getAcademicTermBounds(academicTerm) {
  return api(`${METHOD}.get_academic_term_bounds`, { academic_term: academicTerm });
}

export function getAcademicYearBounds(academicYear) {
  return api(`${METHOD}.get_academic_year_bounds`, { academic_year: academicYear });
}
