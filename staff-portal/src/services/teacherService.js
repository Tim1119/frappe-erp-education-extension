// services/teacherService.js
import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.teacher_api";

export function getTeachers({
  page = 1,
  search = "",
  status = "",
  department = "",
  pageSize = 20,
} = {}) {
  return api(`${METHOD}.get_teachers`, {
    page,
    page_size: pageSize,
    search: search || undefined,
    status: status || undefined,
    department: department || undefined,
  });
}

export function getTeacher(name) {
  return api(`${METHOD}.get_teacher`, {
    name,
  });
}

export function getTeacherConnections(instructor) {
  return api(`${METHOD}.get_teacher_connections`, {
    instructor,
  });
}

export function createTeacher(data) {
  return api(`${METHOD}.create_teacher`, {
    data,
  });
}

export function updateTeacher(name, data) {
  return api(`${METHOD}.update_teacher`, {
    name,
    data,
  });
}

export function deleteTeacher(name) {
  return api(`${METHOD}.delete_teacher`, {
    name,
  });
}

export function getDepartments() {
  return api(`${METHOD}.get_departments`, {});
}

export function getEmployees() {
  return api(`${METHOD}.get_employees`, {});
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`, {});
}

export function getAcademicTerms() {
  return api(`${METHOD}.get_academic_terms`, {});
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`, {});
}

export function getProgramCourses(program) {
  return api(`${METHOD}.get_program_courses`, {
    program,
  });
}