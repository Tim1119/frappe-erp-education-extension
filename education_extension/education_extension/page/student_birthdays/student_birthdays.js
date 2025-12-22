frappe.pages['student-birthdays'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '🎂 Student Birthdays',
		single_column: true
	});

	// Add filter fields
	page.add_field({
		fieldname: 'view_type',
		label: __('View By'),
		fieldtype: 'Select',
		options: [
			'Upcoming Birthdays',
			'Specific Month',
			'All Students'
		],
		default: 'Upcoming Birthdays',
		change: function() {
			toggle_filters();
			load_birthdays();
		}
	});

	page.add_field({
		fieldname: 'days',
		label: __('Days Ahead'),
		fieldtype: 'Select',
		options: [
			{label: '7 Days', value: '7'},
			{label: '14 Days', value: '14'},
			{label: '30 Days', value: '30'},
			{label: '60 Days', value: '60'},
			{label: '90 Days', value: '90'},
			{label: '180 Days', value: '180'},
			{label: '365 Days', value: '365'}
		],
		default: '30',
		change: function() {
			load_birthdays();
		}
	});

	page.add_field({
		fieldname: 'month',
		label: __('Select Month'),
		fieldtype: 'Select',
		options: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		change: function() {
			load_birthdays();
		}
	});

	page.main.html(`
		<div class="birthday-dashboard">
			<div class="row">
				<div class="col-md-12">
					<div id="birthday-stats" style="margin-bottom: 20px;"></div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<div id="birthday-list" style="min-height: 400px;">
						<div class="text-center" style="padding: 50px;">
							<i class="fa fa-spinner fa-spin fa-3x"></i>
							<p>Loading birthdays...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	`);

	function toggle_filters() {
		const view_type = page.fields_dict.view_type.get_value();
		
		if (view_type === 'Upcoming Birthdays') {
			page.fields_dict.days.$wrapper.show();
			page.fields_dict.month.$wrapper.hide();
		} else if (view_type === 'Specific Month') {
			page.fields_dict.days.$wrapper.hide();
			page.fields_dict.month.$wrapper.show();
		} else {
			page.fields_dict.days.$wrapper.hide();
			page.fields_dict.month.$wrapper.hide();
		}
	}

	function load_birthdays() {
		const view_type = page.fields_dict.view_type.get_value();
		const days = page.fields_dict.days.get_value();
		const month = page.fields_dict.month.get_value();
		
		let method_days = 365; // Default to all
		
		if (view_type === 'Upcoming Birthdays') {
			method_days = parseInt(days) || 30;
		}
		
		frappe.call({
			method: 'education_extension.education_extension.doctype.student_birthday_reminder.student_birthday_reminder.get_upcoming_birthdays',
			args: {
				days: method_days
			},
			callback: function(r) {
				if (r.message) {
					let students = r.message;
					
					// Filter by month if "Specific Month" is selected
					if (view_type === 'Specific Month' && month) {
						const month_num = get_month_number(month);
						students = students.filter(s => {
							const dob = new Date(s.date_of_birth);
							return dob.getMonth() + 1 === month_num;
						});
					}
					
					// Filter by days for "Upcoming Birthdays"
					if (view_type === 'Upcoming Birthdays') {
						const days_limit = parseInt(days) || 30;
						students = students.filter(s => s.days_until_birthday <= days_limit);
					}
					
					render_birthdays(students, view_type, month);
				}
			}
		});
	}

	function get_month_number(month_name) {
		const months = {
			'January': 1, 'February': 2, 'March': 3, 'April': 4,
			'May': 5, 'June': 6, 'July': 7, 'August': 8,
			'September': 9, 'October': 10, 'November': 11, 'December': 12
		};
		return months[month_name];
	}

	function render_birthdays(students, view_type, selected_month) {
		let html = '';
		
		// Show statistics
		let stats_html = `
			<div class="row">
				<div class="col-md-4">
					<div class="card" style="padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px;">
						<h2 style="color: #667eea; margin: 0;">${students.length}</h2>
						<p style="color: #666; margin: 5px 0 0 0;">Total Birthdays</p>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card" style="padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px;">
						<h2 style="color: #16a34a; margin: 0;">${students.filter(s => s.days_until_birthday === 0).length}</h2>
						<p style="color: #666; margin: 5px 0 0 0;">Today</p>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card" style="padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px;">
						<h2 style="color: #f59e0b; margin: 0;">${students.filter(s => s.days_until_birthday > 0 && s.days_until_birthday <= 7).length}</h2>
						<p style="color: #666; margin: 5px 0 0 0;">This Week</p>
					</div>
				</div>
			</div>
		`;
		$('#birthday-stats').html(stats_html);
		
		if (students.length === 0) {
			html = `
				<div class="text-center text-muted" style="padding: 50px;">
					<i class="fa fa-birthday-cake fa-3x"></i>
					<p style="margin-top: 20px;">No birthdays found</p>
				</div>
			`;
		} else {
			// Group birthdays
			if (view_type === 'Specific Month') {
				// For specific month, group by date
				html += `<h3 style="color: #667eea; margin-top: 20px;">${selected_month} Birthdays (${students.length})</h3>`;
				
				// Sort by day of month
				students.sort((a, b) => {
					const date_a = new Date(a.date_of_birth);
					const date_b = new Date(b.date_of_birth);
					return date_a.getDate() - date_b.getDate();
				});
				
				html += '<div class="row">';
				students.forEach(student => {
					html += get_birthday_card(student, false);
				});
				html += '</div>';
			} else {
				// For upcoming/all, group by today and upcoming
				let today_birthdays = students.filter(s => s.days_until_birthday === 0);
				let upcoming_birthdays = students.filter(s => s.days_until_birthday > 0);
				
				if (today_birthdays.length > 0) {
					html += '<h3 style="color: #667eea; margin-top: 20px;">🎉 Today\'s Birthdays</h3>';
					html += '<div class="row">';
					today_birthdays.forEach(student => {
						html += get_birthday_card(student, true);
					});
					html += '</div>';
				}
				
				if (upcoming_birthdays.length > 0) {
					html += '<h3 style="color: #764ba2; margin-top: 30px;">📅 Upcoming Birthdays</h3>';
					html += '<div class="row">';
					upcoming_birthdays.forEach(student => {
						html += get_birthday_card(student, false);
					});
					html += '</div>';
				}
			}
		}
		
		$('#birthday-list').html(html);
	}

	function get_birthday_card(student, is_today) {
		let badge_color = is_today ? '#667eea' : '#999';
		let days_text = '';
		
		if (is_today) {
			days_text = 'Today!';
		} else if (student.days_until_birthday === 1) {
			days_text = 'Tomorrow';
		} else {
			days_text = `In ${student.days_until_birthday} days`;
		}
		
		const dob = new Date(student.date_of_birth);
		const day = dob.getDate();
		const month_name = dob.toLocaleString('default', { month: 'long' });
		
		return `
			<div class="col-md-4" style="margin-bottom: 20px;">
				<div class="birthday-card" style="border: 2px solid ${badge_color}; border-radius: 10px; padding: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
					<div style="text-align: center;">
						<div style="width: 60px; height: 60px; border-radius: 50%; background: ${badge_color}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px;">
							🎂
						</div>
						<h4 style="margin: 10px 0 5px; color: #333;">
							<a href="/app/student/${student.name}">${student.student_name}</a>
						</h4>
						<p style="color: #666; font-size: 13px; margin: 5px 0;">
							<strong>${days_text}</strong>
						</p>
						<p style="color: #999; font-size: 12px; margin: 5px 0;">
							${month_name} ${day}${get_ordinal_suffix(day)} | Turning ${student.age_turning} years old
						</p>
						${student.guardian_name ? `
							<p style="color: #999; font-size: 11px; margin: 5px 0;">
								Guardian: ${student.guardian_name}
							</p>
						` : ''}
					</div>
				</div>
			</div>
		`;
	}

	function get_ordinal_suffix(day) {
		if (day >= 11 && day <= 13) {
			return 'th';
		}
		switch (day % 10) {
			case 1: return 'st';
			case 2: return 'nd';
			case 3: return 'rd';
			default: return 'th';
		}
	}

	// Initialize
	toggle_filters();
	load_birthdays();
}