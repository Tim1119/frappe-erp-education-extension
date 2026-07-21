// ─────────────────────────────────────────────────────────────────────────
// DocType + field map for every module.
//
// This is the ONE place to edit if your site uses custom field names or
// versions of Frappe Education/HRMS that differ from the defaults below.
// Every page imports its field list from here rather than hardcoding it.
// ─────────────────────────────────────────────────────────────────────────

export const DOCTYPES = {
	// Core Student record (frappe/education)
	student: {
		doctype: "Student",
		fields: [
			"name",
			"student_name",
			"first_name",
			"last_name",
			"gender",
			"date_of_birth",
			"student_email_id",
			"student_mobile_number",
			"student_applicant",
			"image",
			"enabled",
		],
	},
	// Program Enrollment carries the per-year/term group + program link for a student
	programEnrollment: {
		doctype: "Program Enrollment",
		fields: [
			"name",
			"student",
			"student_name",
			"program",
			"academic_year",
			"academic_term",
			"student_batch_name",
			"enrollment_date",
		],
	},
	studentGroup: {
		doctype: "Student Group",
		fields: [
			"name",
			"student_group_name",
			"program",
			"batch",
			"academic_year",
			"academic_term",
			"instructor",
			"max_strength",
			"disabled",
		],
	},
	instructor: {
		doctype: "Instructor",
		fields: ["name", "instructor_name", "employee", "department", "status"],
	},
	guardian: {
		doctype: "Guardian",
		fields: [
			"name",
			"guardian_name",
			"email_address",
			"mobile_number",
			"occupation",
			"education",
		],
	},
	studentAttendance: {
		doctype: "Student Attendance",
		fields: [
			"name",
			"student",
			"student_name",
			"student_group",
			"course_schedule",
			"attendance_date",
			"status",
			"academic_year",
			"academic_term",
		],
	},
	assessmentGroup: {
		doctype: "Assessment Group",
		fields: ["name", "assessment_group_name", "parent_assessment_group"],
	},
	assessmentPlan: {
		doctype: "Assessment Plan",
		fields: [
			"name",
			"assessment_name",
			"assessment_group",
			"course",
			"student_group",
			"grading_scale",
			"maximum_assessment_score",
			"supervisor",
		],
	},
	assessmentResult: {
		doctype: "Assessment Result",
		fields: ["name", "student", "student_name", "assessment_plan", "grade", "total_score"],
	},
	courseSchedule: {
		doctype: "Course Schedule",
		fields: [
			"name",
			"course",
			"student_group",
			"instructor",
			"room",
			"schedule_date",
			"from_time",
			"to_time",
		],
	},
	program: { doctype: "Program", fields: ["name", "program_name"] },
	academicYear: { doctype: "Academic Year", fields: ["name", "academic_year_name"] },
	academicTerm: { doctype: "Academic Term", fields: ["name", "term_name", "academic_year"] },
	gradingScale: { doctype: "Grading Scale", fields: ["name"] },

	// Fees (frappe/education)
	feeCategory: { doctype: "Fee Category", fields: ["name", "category_name"] },
	feeStructure: {
		doctype: "Fee Structure",
		fields: ["name", "program", "academic_year", "total_amount"],
	},
	feeSchedule: {
		doctype: "Fee Schedule",
		fields: ["name", "program", "academic_year", "due_date", "total_amount"],
	},
	fees: {
		doctype: "Fees",
		fields: [
			"name",
			"student",
			"student_name",
			"program",
			"academic_year",
			"grand_total",
			"outstanding_amount",
			"paid_amount",
			"status",
			"due_date",
		],
	},

	paymentEntry: {
		doctype: "Payment Entry",
		fields: [
			"name",
			"party",
			"paid_amount",
			"posting_date",
			"mode_of_payment",
			"reference_no",
			"status",
		],
	},

	// HR (frappe/hrms)
	employee: {
		doctype: "Employee",
		fields: [
			"name",
			"employee_name",
			"department",
			"designation",
			"company_email",
			"status",
			"date_of_joining",
			"image",
		],
	},
	department: { doctype: "Department", fields: ["name", "department_name"] },
	designation: { doctype: "Designation", fields: ["name"] },
	leaveApplication: {
		doctype: "Leave Application",
		fields: [
			"name",
			"employee",
			"employee_name",
			"leave_type",
			"from_date",
			"to_date",
			"total_leave_days",
			"status",
		],
	},
	leaveAllocation: {
		doctype: "Leave Allocation",
		fields: [
			"name",
			"employee",
			"employee_name",
			"leave_type",
			"new_leaves_allocated",
			"total_leaves_allocated",
		],
	},
	holidayList: { doctype: "Holiday List", fields: ["name", "holiday_list_name"] },
};
