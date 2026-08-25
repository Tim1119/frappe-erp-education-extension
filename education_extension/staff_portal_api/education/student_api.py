import json

import frappe
from frappe import _
from frappe.utils import cint

from education_extension.staff_portal_api.permissions import (
    ensure_doctype_permission,
)


@frappe.whitelist()
def get_students(
    page=1,
    page_size=20,
    search=None,
    status=None,
    class_arm=None,
    course=None,
    student_admission=None,
    guardian=None,
):
    """
    Returns paginated students for the staff portal.
    """

    page = cint(page)
    page_size = cint(page_size)

    ensure_doctype_permission("Student", "read")

    filters = {}

    if status:
        filters["enabled"] = 1 if status == "Active" else 0

    or_filters = []

    if search:
        or_filters = [
            ["student_name", "like", f"%{search}%"],
            ["name", "like", f"%{search}%"],
            ["student_email_id", "like", f"%{search}%"],
        ]

    # Students filtered down by one or more chained lookups (class_arm,
    # course, student_admission, guardian) get intersected -- a student
    # must satisfy every chained filter that was supplied, not just the
    # last one applied.
    name_filter_sets = []

    if guardian:
        students_of_guardian = frappe.get_all(
            "Student Guardian",
            filters={"guardian": guardian},
            fields=["parent"],
            pluck="parent",
        )
        name_filter_sets.append(set(students_of_guardian))

    if class_arm:
        student_names = frappe.get_all(
            "Student Group Student",
            filters={
                "parent": class_arm,
            },
            pluck="student",
        )
        name_filter_sets.append(set(student_names))

    if course:
        # Course -> Student Group(s) teaching it -> students in those groups
        group_names = frappe.get_list(
            "Student Group",
            filters={"course": course},
            pluck="name",
        )
        student_names = (
            frappe.get_all(
                "Student Group Student",
                filters={"parent": ["in", group_names]},
                pluck="student",
            )
            if group_names else []
        )
        name_filter_sets.append(set(student_names))

    if student_admission:
        # Student Admission -> Student Applicant(s) it admitted -> Student
        # records created from those applicants
        applicant_names = frappe.get_list(
            "Student Applicant",
            filters={"student_admission": student_admission},
            pluck="name",
        )
        student_names = (
            frappe.get_list(
                "Student",
                filters={"student_applicant": ["in", applicant_names]},
                pluck="name",
            )
            if applicant_names else []
        )
        name_filter_sets.append(set(student_names))

    if name_filter_sets:
        matching_names = set.intersection(*name_filter_sets)
        if not matching_names:
            return {
                "rows": [],
                "count": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0,
            }
        filters["name"] = ["in", list(matching_names)]

    rows = frappe.get_list(
        "Student",
        fields=[
            "name",
            "student_name",
            "gender",
            "student_email_id",
            "student_mobile_number",
            "date_of_birth",
            "image",
            "enabled",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Student",
        filters=filters,
    )

    if rows:
        student_names = [d.name for d in rows]

        # ------------------------------------------------------
        # Program Enrollments (Current Class)
        # ------------------------------------------------------

        enrollments = frappe.get_list(
            "Program Enrollment",
            filters={
                "student": ["in", student_names],
                "docstatus": ["!=", 2],
            },
            fields=[
                "student",
                "program",
                "academic_year",
                "academic_term",
                "student_batch_name",
            ],
            order_by="creation desc",
        )

        enrollment_map = {}

        for d in enrollments:
            if d.student not in enrollment_map:
                enrollment_map[d.student] = d

        # ------------------------------------------------------
        # Student Groups (Class Arms)
        # ------------------------------------------------------

        group_rows = frappe.db.sql(
            """
            SELECT
                sgs.student,
                sg.name AS class_arm
            FROM `tabStudent Group Student` sgs
            INNER JOIN `tabStudent Group` sg
                ON sg.name = sgs.parent
            WHERE sgs.student IN %(students)s
            ORDER BY sgs.creation DESC
            """,
            {"students": tuple(student_names)},
            as_dict=True,
        )

        class_arm_map = {}

        for d in group_rows:
            if d.student not in class_arm_map:
                class_arm_map[d.student] = d.class_arm

        # ------------------------------------------------------
        # Merge into response
        # ------------------------------------------------------

        for row in rows:

            enrollment = enrollment_map.get(row.name)

            row["class"] = (
                enrollment.program
                if enrollment else None
            )

            row["class_arm"] = class_arm_map.get(row.name)

            row["academic_year"] = (
                enrollment.academic_year
                if enrollment else None
            )

            row["academic_term"] = (
                enrollment.academic_term
                if enrollment else None
            )

            row["student_batch"] = (
                enrollment.student_batch_name
                if enrollment else None
            )

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }


@frappe.whitelist()
def get_student(name):
    if not name:
        frappe.throw(_("Student name is required"))

    student = frappe.get_doc(
        "Student",
        name
    )
    ensure_doctype_permission("Student", "read", student)

    data = student.as_dict()

    # Convert child tables properly
    data["guardians"] = [
        {
            "guardian": row.guardian,
            "guardian_name": row.guardian_name,
            "relation": row.relation,
        }
        for row in student.guardians
    ]
    data["siblings"] = [
        {
            "sibling": row.sibling,
            "sibling_name": row.sibling_name,
            "relation": row.relation,
        }
        for row in student.siblings
    ]

    return data


@frappe.whitelist()
def get_student_connections(student):
    """Connection counts for the Student profile page."""
    if not student:
        frappe.throw(_("Student name is required"))
    try:
        return {
            "class_enrollments": frappe.db.count("Program Enrollment", {"student": student}),
            "subject_enrollments": frappe.db.count("Course Enrollment", {"student": student}),
            "fees": frappe.db.count("Fees", {"student": student}),
            "student_attendance": frappe.db.count("Student Attendance", {"student": student}),
            "student_leave_applications": frappe.db.count("Student Leave Application", {"student": student}),
            "assessment_results": frappe.db.count("Assessment Result", {"student": student}),
            "student_logs": frappe.db.count("Student Log", {"student": student}),
            "school_term_results": frappe.db.count("School Term Result", {"student": student}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching connections for {student}: {str(e)}", "Student API")
        return {}


@frappe.whitelist()
def update_student(student, data):

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc(
        "Student",
        student
    )
    ensure_doctype_permission("Student", "write", doc)

    guardians = data.pop("guardians", None)


    allowed_fields = [
        "student_name",
        "first_name",
        "middle_name",
        "last_name",
        "gender",
        "date_of_birth",
        "student_email_id",
        "student_mobile_number",
        "blood_group",
        "nationality",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "country",
        "pincode",
        "enabled",
    ]


    for field in allowed_fields:
        if field in data:
            doc.set(field, data[field])


    if guardians is not None:

        doc.set("guardians", [])

        for guardian in guardians:

            doc.append(
                "guardians",
                {
                    "guardian": guardian.get("guardian"),
                    "relation": guardian.get("relation"),
                }
            )


    doc.save()

    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def create_student(data):
    ensure_doctype_permission("Student", "create")

    if isinstance(data, str):
        data = json.loads(data)

    guardians = data.pop("guardians", [])

    doc = frappe.get_doc({
        "doctype": "Student",
        **data
    })

    for guardian in guardians:
        doc.append(
            "guardians",
            {
                "guardian": guardian.get("guardian"),
                "relation": guardian.get("relation"),
            }
        )

    doc.insert()

    frappe.db.commit()

    return doc.as_dict()











# ------------------------ dropdown---------------------------
@frappe.whitelist()
def get_class_arms(
    page=1,
    page_size=20,
    search=None,
    program=None,
    academic_year=None,
    academic_term=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if program:
        filters["program"] = program
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["program", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Student Group",  # Assuming class arm is Student Group
        fields=[
            "name",
            "program",
            "academic_year",
            "academic_term",
            "disabled",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Student Group",
        filters=filters,
    )

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }
    
@frappe.whitelist()
def get_guardians(search=None):

    filters = {}

    if search:
        filters["guardian_name"] = [
            "like",
            f"%{search}%"
        ]

    return frappe.get_list(
        "Guardian",
        filters=filters,
        fields=[
            "name",
            "guardian_name",
            "email_address",
            "mobile_number",
        ],
        limit_page_length=20,
    )
