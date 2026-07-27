/**
 * Frappe Education → School Portal terminology.
 *
 * These translations mirror the Frappe Translation doctype entries so
 * the portal uses the same language the admin configured in the backend.
 * We apply them in the UI layer only — API calls still use the Frappe
 * DocType names (Program, Course, Instructor, etc.).
 */

const TERM_MAP = {
  "Program": "Class",
  "Program Name": "Class Name",
  "Program Abbreviation": "Class Abbreviation",
  "Program Enrollment": "Class Enrollment",
  "Program Enrollment Tool": "Class Enrollment Tool",
  "Program wise Fee Collection Report": "Class wise Fee Collection Report",
  "Program wise Fee Collection": "Class wise Fee Collection",
  "Course": "Subject",
  "Course Name": "Subject Name",
  "Courses": "Subjects",
  "Course Enrollment": "Subject Enrollment",
  "Course Schedule": "Subject Schedule",
  "Course Scheduling Tool": "Subject Scheduling Tool",
  "Course Activity": "Subject Activity",
  "Course wise Assessment Report": "Subject wise Assessment Report",
  "Schedule Course": "Schedule Subject",
  "Enrolled courses": "Enrolled subjects",
  "Instructor": "Teacher",
  "Instructor Name": "Teacher Name",
  "Instructor Log": "Teacher Log",
  "Student Group": "Class Arm",
  "Student Group Name": "Class Arm Name",
  "Room": "Classroom",
  "Room Name": "Classroom Name",
  "Room Number": "Classroom Number",
};

/**
 * Translate a Frappe term to its school-friendly equivalent.
 * Returns the original string if no translation exists.
 */
export function t(term) {
  return TERM_MAP[term] || term;
}

export default TERM_MAP;
