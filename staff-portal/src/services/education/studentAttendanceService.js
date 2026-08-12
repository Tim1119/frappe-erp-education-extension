import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.student_attendance_api";

export function getStudentAttendanceList(params) {
  return api(`${METHOD}.get_student_attendance_list`, params);
}

export function getStudentAttendance(name) {
  return api(`${METHOD}.get_student_attendance`, { name });
}

export function createStudentAttendance(data) {
  return api(`${METHOD}.create_student_attendance`, { data });
}

export function updateStudentAttendance(name, data) {
  return api(`${METHOD}.update_student_attendance`, { name, data });
}

export function deleteStudentAttendance(name) {
  return api(`${METHOD}.delete_student_attendance`, { name });
}

export function submitStudentAttendance(name) {
  return api(`${METHOD}.submit_student_attendance`, { name });
}

export function cancelStudentAttendance(name) {
  return api(`${METHOD}.cancel_student_attendance`, { name });
}

export function getCourseSchedules() {
  return api(`${METHOD}.get_course_schedules`);
}

export function getCourseScheduleDetails(course_schedule) {
  return api(`${METHOD}.get_course_schedule_details`, { course_schedule });
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}

export function getProgramForStudentGroup(student_group) {
  return api(`${METHOD}.get_program_for_student_group`, { student_group });
}

export function getStudentsForClassArm(student_group) {
  return api(`${METHOD}.get_students_for_class_arm`, { student_group });
}
