import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.student_attendance_tool_api";

export function getStudentGroupDetails(student_group) {
  return api(`${METHOD}.get_student_group_details`, { student_group });
}

export function getAcademicYearBounds(academic_year) {
  return api(`${METHOD}.get_academic_year_bounds`, { academic_year });
}

export function getCourseScheduleDetails(course_schedule) {
  return api(`${METHOD}.get_course_schedule_details`, { course_schedule });
}

export function getStudentAttendanceRecords({ based_on, date, student_group, course_schedule }) {
  return api(`${METHOD}.get_student_attendance_records`, {
    based_on, date, student_group, course_schedule,
  });
}

// students_present/students_absent must be JSON strings -- the real
// backend (education.education.api.mark_attendance) calls json.loads()
// on them directly.
export function markAttendance({ studentsPresent, studentsAbsent, studentGroup, courseSchedule, date }) {
  return api(`${METHOD}.mark_attendance`, {
    students_present: JSON.stringify(studentsPresent),
    students_absent: JSON.stringify(studentsAbsent),
    student_group: studentGroup,
    course_schedule: courseSchedule,
    date,
  });
}

export function getStudentGroups(group_based_on) {
  return api(`${METHOD}.get_student_groups`, { group_based_on });
}

export function getCourseSchedules() {
  return api(`${METHOD}.get_course_schedules`);
}
