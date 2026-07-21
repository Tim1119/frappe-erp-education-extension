// Function to show a success message after the server action completes
const show_success_message = (frm, result) => {
	frappe.show_alert(
		{
			message: `<h3>Batch Recalculation Complete!</h3>${result}`,
			title: "Success",
			indicator: "green",
		},
		10,
	); // Show for 10 seconds
	frm.refresh();
};

frappe.ui.form.on("Term Result Recalculation", {
	refresh: function (frm) {
		// Only show the button if the required filters are set
		if (frm.doc.academic_year && frm.doc.academic_term && frm.doc.assessment_group) {
			frm.add_custom_button(__("Recalculate Results"), () => {
				// Confirm action before proceeding
				frappe.confirm(
					__(
						"Are you sure you want to recalculate all **School Term Results** for this Term/Year/Group? This may take a while and overwrite existing data.",
					),
					() => {
						// User confirmed, now call the server action
						frm.call({
							method: "batch_recalculate_term_results",
							doc: frm.doc,
							callback: (r) => {
								if (r.message) {
									show_success_message(frm, r.message);
								}
							},
							error: (r) => {
								frappe.show_alert(
									{
										message: `<h3>Recalculation Failed!</h3>Check error logs for details.`,
										title: "Error",
										indicator: "red",
									},
									5,
								);
								frm.refresh();
							},
							freeze: true, // Freeze the screen during processing
							freeze_message: "Recalculating all Term Results. Please wait...",
						});
					},
				);
			}).addClass("btn-primary");
		} else {
			// Display a message if filters are missing
			frm.dashboard.set_headline(
				__(
					'<p class="text-danger">Please fill in **Academic Year**, **Academic Term**, and **Assessment Group** to enable the Recalculation button.</p>',
				),
			);
		}
	},
});
