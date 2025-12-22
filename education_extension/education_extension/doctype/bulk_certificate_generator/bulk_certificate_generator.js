// Client Script for Bulk Certificate Generator

frappe.ui.form.on('Bulk Certificate Generator', {
    refresh: function(frm) {
        // Add custom button to reload students
        if (!frm.is_new() && frm.doc.class_arm) {
            frm.add_custom_button(__('Reload Students'), function() {
                load_students(frm);
            });
        }
        
        // Add button to select/deselect all students
        if (frm.doc.students && frm.doc.students.length > 0) {
            frm.add_custom_button(__('Select All'), function() {
                frm.doc.students.forEach(function(row) {
                    frappe.model.set_value(row.doctype, row.name, 'select', 1);
                });
                frm.refresh_field('students');
            });
            
            frm.add_custom_button(__('Deselect All'), function() {
                frm.doc.students.forEach(function(row) {
                    frappe.model.set_value(row.doctype, row.name, 'select', 0);
                });
                frm.refresh_field('students');
            });
        }
    },
    
    class_arm: function(frm) {
        // Load students when class is selected
        if (frm.doc.class_arm) {
            load_students(frm);
        } else {
            // Clear students table if class is deselected
            frm.clear_table('students');
            frm.refresh_field('students');
        }
    }
});

function load_students(frm) {
    if (!frm.doc.class_arm) {
        frappe.msgprint(__('Please select a class first'));
        return;
    }
    
    frappe.call({
        method: 'education_extension.education_extension.doctype.bulk_certificate_generator.bulk_certificate_generator.get_students',
        args: {
            class_arm: frm.doc.class_arm
        },
        callback: function(r) {
            if (r.message) {
                // Clear existing students
                frm.clear_table('students');
                
                // Add students to the table
                r.message.forEach(function(student) {
                    let row = frm.add_child('students');
                    row.student = student.student;
                    row.student_name = student.student_name;
                    row.select = 1; // Select by default
                    row.certificate_generated = 0;
                });
                
                frm.refresh_field('students');
                
                if (r.message.length === 0) {
                    frappe.msgprint(__('No students found in the selected class'));
                } else {
                    frappe.show_alert({
                        message: __('Loaded {0} students', [r.message.length]),
                        indicator: 'green'
                    });
                }
            }
        }
    });
}

// Child table event handlers
frappe.ui.form.on('Bulk Certificate Student', {
    students_add: function(frm, cdt, cdn) {
        // Default select to checked when manually adding a row
        let row = locals[cdt][cdn];
        row.select = 1;
        frm.refresh_field('students');
    }
});