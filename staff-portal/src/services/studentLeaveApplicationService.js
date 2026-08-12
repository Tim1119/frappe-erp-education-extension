import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.student_leave_application_api";

export function getStudentLeaveApplications(params) {
  return api(`${METHOD}.get_student_leave_applications`, params);
}

export function getStudentLeaveApplication(name) {
  return api(`${METHOD}.get_student_leave_application`, { name });
}

export function createStudentLeaveApplication(data) {
  return api(`${METHOD}.create_student_leave_application`, { data });
}

export function updateStudentLeaveApplication(name, data) {
  return api(`${METHOD}.update_student_leave_application`, { name, data });
}

export function deleteStudentLeaveApplication(name) {
  return api(`${METHOD}.delete_student_leave_application`, { name });
}

export function submitStudentLeaveApplication(name) {
  return api(`${METHOD}.submit_student_leave_application`, { name });
}

export function cancelStudentLeaveApplication(name) {
  return api(`${METHOD}.cancel_student_leave_application`, { name });
}

export function getConnections(leave_application) {
  return api(`${METHOD}.get_connections`, { leave_application });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getClassArms() {
  return api(`${METHOD}.get_class_arms`);
}

export function getStudentGroupsForStudent(student) {
  return api(`${METHOD}.get_student_groups_for_student`, { student });
}

export function getCourseSchedulesForStudent(student) {
  return api(`${METHOD}.get_course_schedules_for_student`, { student });
}
