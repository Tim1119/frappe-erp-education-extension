import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_api";

export function getStudents(params) {
	return api(`${METHOD}.get_students`, params);
}

export function getGuardians(search = "") {
	return api(`${METHOD}.get_guardians`, {
		search,
	});
}

export function getClassArms(params) {
	return api(`${METHOD}.get_class_arms`, params);
}

export function getStudent(name) {
	return api(`${METHOD}.get_student`, {
		name,
	});
}

export function createStudent(data) {
	return api(`${METHOD}.create_student`, {
		data,
	});
}

export function updateStudent(student, data) {
	return api(`${METHOD}.update_student`, {
		student,
		data,
	});
}

export function deleteStudent(student) {
	return api(`${METHOD}.delete_student`, {
		student,
	});
}
