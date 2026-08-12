import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.subject_scheduling_tool_api";

export function scheduleSubjectCourse(data, days) {
  return api(`${METHOD}.schedule_course`, { data, days });
}
