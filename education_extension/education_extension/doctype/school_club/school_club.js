// Copyright (c) 2024, Your Company and contributors
// For license information, please see license.txt

frappe.ui.form.on("School Club", {
	refresh: function (frm) {
		// Add custom buttons
		if (!frm.is_new()) {
			frm.add_custom_button(
				__("View Available Students"),
				function () {
					show_available_students(frm);
				},
				__("Students"),
			);

			frm.add_custom_button(
				__("View Available Instructors"),
				function () {
					show_available_instructors(frm);
				},
				__("Instructors"),
			);

			frm.add_custom_button(
				__("Club Summary"),
				function () {
					show_club_summary(frm);
				},
				__("Reports"),
			);
		}

		// Set queries for child tables
		set_student_query(frm);
		set_instructor_query(frm);

		// Highlight primary instructor
		setTimeout(() => {
			highlight_primary_instructor(frm);
		}, 500);
	},

	academic_year: function (frm) {
		// Warn when changing academic year
		if (
			(frm.doc.club_instructors && frm.doc.club_instructors.length > 0) ||
			(frm.doc.club_members && frm.doc.club_members.length > 0)
		) {
			frappe.confirm(
				__(
					"Changing Academic Year will clear all instructors and members. Do you want to continue?",
				),
				function () {
					frm.clear_table("club_instructors");
					frm.clear_table("club_members");
					frm.refresh_field("club_instructors");
					frm.refresh_field("club_members");
				},
				function () {
					frm.reload_doc();
				},
			);
		}
	},
});

// Set up the query for student field
function set_student_query(frm) {
	frm.set_query("student", "club_members", function (doc, cdt, cdn) {
		if (!doc.academic_year) {
			frappe.msgprint(__("Please select Academic Year first"));
			return { filters: { name: ["=", ""] } };
		}

		// Get list of students already selected in the current form
		let selected_students = [];
		if (doc.club_members) {
			doc.club_members.forEach(function (row) {
				if (row.student) {
					selected_students.push(row.student);
				}
			});
		}

		return {
			query: "education_extension.education_extension.doctype.school_club.school_club.get_available_students_query",
			filters: {
				academic_year: doc.academic_year,
				current_club: doc.name,
				selected_students: selected_students,
			},
		};
	});
}

// Set up the query for instructor field
function set_instructor_query(frm) {
	frm.set_query("instructor", "club_instructors", function (doc, cdt, cdn) {
		if (!doc.academic_year) {
			frappe.msgprint(__("Please select Academic Year first"));
			return { filters: { name: ["=", ""] } };
		}

		// Get list of instructors already selected in the current form
		let selected_instructors = [];
		if (doc.club_instructors) {
			doc.club_instructors.forEach(function (row) {
				if (row.instructor) {
					selected_instructors.push(row.instructor);
				}
			});
		}

		return {
			query: "education_extension.education_extension.doctype.school_club.school_club.get_available_instructors_query",
			filters: {
				academic_year: doc.academic_year,
				current_club: doc.name,
				selected_instructors: selected_instructors,
			},
		};
	});
}

function highlight_primary_instructor(frm) {
	if (frm.fields_dict["club_instructors"]) {
		frm.fields_dict["club_instructors"].grid.wrapper
			.find(".grid-body .rows")
			.each(function () {
				$(this)
					.find(".grid-row")
					.each(function () {
						let row = $(this);
						let grid_row = row.data("gridRow");
						if (grid_row && grid_row.doc && grid_row.doc.is_primary) {
							row.css("background-color", "#e8f5e9");
						}
					});
			});
	}
}

// Club Instructor Events
frappe.ui.form.on("Club Instructor", {
	instructor: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn];

		if (row.instructor && frm.doc.academic_year) {
			// Check if instructor is eligible
			frappe.call({
				method: "education_extension.education_extension.doctype.school_club.school_club.check_instructor_eligibility",
				args: {
					instructor: row.instructor,
					academic_year: frm.doc.academic_year,
					current_club: frm.doc.name,
				},
				callback: function (r) {
					if (r.message && !r.message.eligible) {
						frappe.msgprint({
							title: __("Instructor Not Eligible"),
							indicator: "red",
							message: r.message.message,
						});

						// Clear the instructor field
						frappe.model.set_value(cdt, cdn, "instructor", "");
					}
				},
			});
		}
	},

	is_primary: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn];

		// If this is set to primary, uncheck others
		if (row.is_primary) {
			frm.doc.club_instructors.forEach(function (instructor) {
				if (instructor.name !== row.name && instructor.is_primary) {
					frappe.model.set_value(instructor.doctype, instructor.name, "is_primary", 0);
				}
			});
			frm.refresh_field("club_instructors");

			// Highlight after a short delay
			setTimeout(() => {
				highlight_primary_instructor(frm);
			}, 300);
		}
	},

	club_instructors_add: function (frm, cdt, cdn) {
		set_instructor_query(frm);
	},
});

// Club Member Events
frappe.ui.form.on("Club Member", {
	student: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn];

		if (row.student && frm.doc.academic_year) {
			// Fetch student name
			frappe.db.get_value(
				"Student",
				row.student,
				["student_name", "first_name", "middle_name", "last_name"],
				function (r) {
					if (r) {
						let student_name = r.student_name;
						if (!student_name) {
							// Build name from parts
							let name_parts = [];
							if (r.first_name) name_parts.push(r.first_name);
							if (r.middle_name) name_parts.push(r.middle_name);
							if (r.last_name) name_parts.push(r.last_name);
							student_name = name_parts.join(" ");
						}
						frappe.model.set_value(cdt, cdn, "student_name", student_name);
					}
				},
			);

			// Fetch and set the class arm
			frappe.call({
				method: "education_extension.education_extension.doctype.school_club.school_club.get_student_class_arm",
				args: {
					student: row.student,
					academic_year: frm.doc.academic_year,
				},
				callback: function (r) {
					if (r.message) {
						frappe.model.set_value(cdt, cdn, "class_arm", r.message);
					}
				},
			});

			// Check if student is eligible
			frappe.call({
				method: "education_extension.education_extension.doctype.school_club.school_club.check_student_eligibility",
				args: {
					student: row.student,
					academic_year: frm.doc.academic_year,
					current_club: frm.doc.name,
				},
				callback: function (r) {
					if (r.message && !r.message.eligible) {
						frappe.msgprint({
							title: __("Student Not Eligible"),
							indicator: "red",
							message: r.message.message,
						});

						// Clear the student field
						frappe.model.set_value(cdt, cdn, "student", "");
						frappe.model.set_value(cdt, cdn, "student_name", "");
						frappe.model.set_value(cdt, cdn, "class_arm", "");
					}
				},
			});
		}
	},

	club_members_add: function (frm, cdt, cdn) {
		set_student_query(frm);
	},
});

// Helper Functions

function show_available_students(frm) {
	if (!frm.doc.academic_year) {
		frappe.msgprint(__("Please select Academic Year first"));
		return;
	}

	frappe.call({
		method: "education_extension.education_extension.doctype.school_club.school_club.get_available_students",
		args: {
			academic_year: frm.doc.academic_year,
			current_club: frm.doc.name,
		},
		callback: function (r) {
			if (r.message && r.message.length > 0) {
				// Filter out students already in the form
				let already_added = [];
				if (frm.doc.club_members) {
					already_added = frm.doc.club_members.map((m) => m.student).filter(Boolean);
				}

				let available = r.message.filter((s) => !already_added.includes(s.name));

				if (available.length > 0) {
					show_student_dialog(frm, available);
				} else {
					frappe.msgprint(
						__("All available students have already been added to this club"),
					);
				}
			} else {
				frappe.msgprint(__("No available students found for this academic year"));
			}
		},
	});
}

function show_student_dialog(frm, students) {
	let d = new frappe.ui.Dialog({
		title: __("Available Students ({0})", [students.length]),
		fields: [
			{
				fieldname: "search",
				fieldtype: "Data",
				label: __("Search"),
				placeholder: __("Search by name or ID..."),
				onchange: function () {
					filter_student_table(this.get_value());
				},
			},
			{
				fieldname: "students",
				fieldtype: "HTML",
			},
		],
		primary_action_label: __("Close"),
		size: "extra-large",
	});

	function render_student_table(filtered_students) {
		let html = '<div style="max-height: 500px; overflow-y: auto;">';
		html +=
			'<table class="table table-bordered table-hover" id="students-table"><thead><tr>' +
			"<th>Student ID</th><th>Student Name</th><th>Class Arm</th><th>Email</th><th>Action</th>" +
			"</tr></thead><tbody>";

		filtered_students.forEach(function (student) {
			html += `<tr data-student-id="${student.name}">
				<td>${student.name}</td>
				<td>${student.student_name || ""}</td>
				<td>${student.class_arm || "N/A"}</td>
				<td>${student.student_email_id || ""}</td>
				<td><button class="btn btn-xs btn-primary add-student-btn" 
					data-student="${student.name}"
					data-student-name="${student.student_name || ""}"
					data-class-arm="${student.class_arm || ""}">
					<i class="fa fa-plus"></i> Add
				</button></td>
			</tr>`;
		});

		html += "</tbody></table></div>";

		if (filtered_students.length === 0) {
			html =
				'<div class="text-center text-muted" style="padding: 40px;">No students found matching your search</div>';
		}

		d.fields_dict.students.$wrapper.html(html);

		// Add click event for add buttons
		d.$wrapper.off("click", ".add-student-btn");
		d.$wrapper.on("click", ".add-student-btn", function () {
			let student = $(this).data("student");
			let student_name = $(this).data("student-name");
			let class_arm = $(this).data("class-arm");
			let row_element = $(this).closest("tr");

			// Add to form
			let child = frm.add_child("club_members");
			frappe.model.set_value(child.doctype, child.name, "student", student);
			frappe.model.set_value(child.doctype, child.name, "student_name", student_name);
			frappe.model.set_value(child.doctype, child.name, "class_arm", class_arm);
			frm.refresh_field("club_members");

			// Remove from dialog with animation
			row_element.fadeOut(300, function () {
				$(this).remove();

				// Update count in dialog title
				let remaining = d.$wrapper.find("#students-table tbody tr").length;
				d.set_title(__("Available Students ({0})", [remaining]));

				// If no students left, show message
				if (remaining === 0) {
					d.fields_dict.students.$wrapper.html(
						'<div class="text-center text-muted" style="padding: 40px;">' +
							'<i class="fa fa-check-circle" style="font-size: 48px; color: #98d85b;"></i>' +
							'<p style="margin-top: 20px;">All students have been added!</p>' +
							"</div>",
					);
				}
			});

			frappe.show_alert({ message: __("Student added to club"), indicator: "green" });
		});
	}

	function filter_student_table(search_term) {
		if (!search_term) {
			render_student_table(students);
			return;
		}

		search_term = search_term.toLowerCase();
		let filtered = students.filter(function (student) {
			return (
				student.name.toLowerCase().includes(search_term) ||
				(student.student_name &&
					student.student_name.toLowerCase().includes(search_term)) ||
				(student.student_email_id &&
					student.student_email_id.toLowerCase().includes(search_term))
			);
		});

		render_student_table(filtered);
	}

	// Initial render
	render_student_table(students);

	d.show();
}

function show_available_instructors(frm) {
	if (!frm.doc.academic_year) {
		frappe.msgprint(__("Please select Academic Year first"));
		return;
	}

	frappe.call({
		method: "education_extension.education_extension.doctype.school_club.school_club.get_available_instructors",
		args: {
			academic_year: frm.doc.academic_year,
			current_club: frm.doc.name,
		},
		callback: function (r) {
			if (r.message && r.message.length > 0) {
				// Filter out instructors already in the form
				let already_added = [];
				if (frm.doc.club_instructors) {
					already_added = frm.doc.club_instructors
						.map((i) => i.instructor)
						.filter(Boolean);
				}

				let available = r.message.filter((i) => !already_added.includes(i.name));

				if (available.length > 0) {
					show_instructor_dialog(frm, available);
				} else {
					frappe.msgprint(
						__("All available instructors have already been added to this club"),
					);
				}
			} else {
				frappe.msgprint(__("No available instructors found for this academic year"));
			}
		},
	});
}

function show_instructor_dialog(frm, instructors) {
	let d = new frappe.ui.Dialog({
		title: __("Available Instructors ({0})", [instructors.length]),
		fields: [
			{
				fieldname: "search",
				fieldtype: "Data",
				label: __("Search"),
				placeholder: __("Search by name or ID..."),
				onchange: function () {
					filter_instructor_table(this.get_value());
				},
			},
			{
				fieldname: "instructors",
				fieldtype: "HTML",
			},
		],
		primary_action_label: __("Close"),
		size: "large",
	});

	function render_instructor_table(filtered_instructors) {
		let html = '<div style="max-height: 500px; overflow-y: auto;">';
		html +=
			'<table class="table table-bordered table-hover" id="instructors-table"><thead><tr>' +
			"<th>Instructor ID</th><th>Instructor Name</th><th>Department</th><th>Action</th>" +
			"</tr></thead><tbody>";

		filtered_instructors.forEach(function (instructor) {
			html += `<tr data-instructor-id="${instructor.name}">
				<td>${instructor.name}</td>
				<td>${instructor.instructor_name || ""}</td>
				<td>${instructor.department || ""}</td>
				<td><button class="btn btn-xs btn-primary add-instructor-btn" data-instructor="${instructor.name}">
					<i class="fa fa-plus"></i> Add
				</button></td>
			</tr>`;
		});

		html += "</tbody></table></div>";

		if (filtered_instructors.length === 0) {
			html =
				'<div class="text-center text-muted" style="padding: 40px;">No instructors found matching your search</div>';
		}

		d.fields_dict.instructors.$wrapper.html(html);

		// Add click event for add buttons
		d.$wrapper.off("click", ".add-instructor-btn");
		d.$wrapper.on("click", ".add-instructor-btn", function () {
			let instructor = $(this).data("instructor");
			let row_element = $(this).closest("tr");

			// Add to form
			let child = frm.add_child("club_instructors");
			frappe.model.set_value(child.doctype, child.name, "instructor", instructor);
			frm.refresh_field("club_instructors");

			// Remove from dialog with animation
			row_element.fadeOut(300, function () {
				$(this).remove();

				// Update count in dialog title
				let remaining = d.$wrapper.find("#instructors-table tbody tr").length;
				d.set_title(__("Available Instructors ({0})", [remaining]));

				// If no instructors left, show message
				if (remaining === 0) {
					d.fields_dict.instructors.$wrapper.html(
						'<div class="text-center text-muted" style="padding: 40px;">' +
							'<i class="fa fa-check-circle" style="font-size: 48px; color: #98d85b;"></i>' +
							'<p style="margin-top: 20px;">All instructors have been added!</p>' +
							"</div>",
					);
				}
			});

			frappe.show_alert({ message: __("Instructor added to club"), indicator: "green" });
		});
	}

	function filter_instructor_table(search_term) {
		if (!search_term) {
			render_instructor_table(instructors);
			return;
		}

		search_term = search_term.toLowerCase();
		let filtered = instructors.filter(function (instructor) {
			return (
				instructor.name.toLowerCase().includes(search_term) ||
				(instructor.instructor_name &&
					instructor.instructor_name.toLowerCase().includes(search_term)) ||
				(instructor.department &&
					instructor.department.toLowerCase().includes(search_term))
			);
		});

		render_instructor_table(filtered);
	}

	// Initial render
	render_instructor_table(instructors);

	d.show();
}

function show_club_summary(frm) {
	let primary_instructor = frm.doc.club_instructors
		? frm.doc.club_instructors.find((i) => i.is_primary)
		: null;
	let total_instructors = frm.doc.club_instructors ? frm.doc.club_instructors.length : 0;
	let total_members = frm.doc.club_members ? frm.doc.club_members.length : 0;
	let active_members = frm.doc.club_members
		? frm.doc.club_members.filter((m) => m.status === "Active").length
		: 0;

	let message = `
		<h4>${frm.doc.club_name}</h4>
		<p><strong>Academic Year:</strong> ${frm.doc.academic_year}</p>
		<p><strong>Status:</strong> <span class="indicator ${frm.doc.status === "Active" ? "green" : "red"}">${frm.doc.status}</span></p>
		<hr>
		<h5>Instructors (${total_instructors})</h5>
		<p><strong>Primary Instructor:</strong> ${primary_instructor ? primary_instructor.instructor_name : "Not Set"}</p>
		<hr>
		<h5>Members</h5>
		<p><strong>Total Members:</strong> ${total_members}</p>
		<p><strong>Active Members:</strong> ${active_members}</p>
		<p><strong>Inactive Members:</strong> ${total_members - active_members}</p>
	`;

	frappe.msgprint({
		title: __("Club Summary"),
		message: message,
		indicator: "blue",
	});
}
