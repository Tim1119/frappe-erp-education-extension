// frappe.ui.form.on("Bulk Promotion", {
//     // Trigger when user selects a grade
//     grade: function(frm) {
//         if (!frm.doc.grade) return;

//         frappe.confirm(
//             `Fetch all active employees in grade <b>${frm.doc.grade}</b>?`,
//             () => {
//                 frappe.call({
//                     method: "education_extension.education_extension.doctype.bulk_promotion.bulk_promotion.get_employees_by_grade",
//                     args: { grade: frm.doc.grade },
//                     callback: function(r) {
//                         frm.clear_table("employees");

//                         (r.message || []).forEach(emp => {
//                             let row = frm.add_child("employees");
//                             row.employee = emp.name;
//                             row.employee_name = emp.employee_name;
//                             row.department = emp.department;
//                         });

//                         frm.refresh_field("employees");

//                         frappe.msgprint({
//                             title: "Employees Loaded",
//                             message: `${r.message.length} employees fetched successfully.`,
//                             indicator: "green"
//                         });
//                     }
//                 });
//             }
//         );
//     },

//     // Add a custom button on form refresh
//     refresh: function(frm) {
//         frm.add_custom_button("Fetch Employees", function() {
//             if (!frm.doc.grade) {
//                 frappe.msgprint("Please select a grade first.");
//                 return;
//             }

//             frappe.call({
//                 method: "education_extension.education_extension.doctype.bulk_promotion.bulk_promotion.get_employees_by_grade",
//                 args: { grade: frm.doc.grade },
//                 callback: function(r) {
//                     frm.clear_table("employees");

//                     (r.message || []).forEach(emp => {
//                         let row = frm.add_child("employees");
//                         row.employee = emp.name;
//                         row.employee_name = emp.employee_name;
//                         row.department = emp.department;
//                     });

//                     frm.refresh_field("employees");

//                     frappe.msgprint({
//                         title: "Employees Loaded",
//                         message: `${r.message.length} employees fetched successfully.`,
//                         indicator: "green"
//                     });
//                 }
//             });
//         });
//     }
// });

frappe.ui.form.on("Bulk Promotion", {
	grade: function (frm) {
		if (!frm.doc.grade) return;

		// Exclude the selected grade from the "New Grade" options
		frm.set_query("new_grade", function () {
			return {
				filters: [["Employee Grade", "name", "!=", frm.doc.grade]],
			};
		});

		// Optional: Fetch employees prompt
		frappe.confirm(`Fetch all active employees in grade <b>${frm.doc.grade}</b>?`, () => {
			frappe.call({
				method: "education_extension.education_extension.doctype.bulk_promotion.bulk_promotion.get_employees_by_grade",
				args: { grade: frm.doc.grade },
				callback: function (r) {
					frm.clear_table("employees");

					(r.message || []).forEach((emp) => {
						let row = frm.add_child("employees");
						row.employee = emp.name;
						row.employee_name = emp.employee_name;
						row.department = emp.department;
						row.company = emp.company;
						row.current_ctc = emp.ctc;
					});

					frm.refresh_field("employees");

					frappe.msgprint({
						title: "Employees Loaded",
						message: `${r.message.length} employees fetched successfully.`,
						indicator: "green",
					});
				},
			});
		});
	},

	refresh: function (frm) {
		// Re-apply exclusion logic on refresh
		if (frm.doc.grade) {
			frm.set_query("new_grade", function () {
				return {
					filters: [["Employee Grade", "name", "!=", frm.doc.grade]],
				};
			});
		}

		// Custom button to manually fetch employees
		frm.add_custom_button("Fetch Employees", function () {
			if (!frm.doc.grade) {
				frappe.msgprint("Please select a grade first.");
				return;
			}

			frappe.call({
				method: "education_extension.education_extension.doctype.bulk_promotion.bulk_promotion.get_employees_by_grade",
				args: { grade: frm.doc.grade },
				callback: function (r) {
					frm.clear_table("employees");

					(r.message || []).forEach((emp) => {
						let row = frm.add_child("employees");
						row.employee = emp.name;
						row.employee_name = emp.employee_name;
						row.department = emp.department;
						row.company = emp.company;
						row.current_ctc = emp.ctc;
					});

					frm.refresh_field("employees");

					frappe.msgprint({
						title: "Employees Loaded",
						message: `${r.message.length} employees fetched successfully.`,
						indicator: "green",
					});
				},
			});
		});
	},
});
