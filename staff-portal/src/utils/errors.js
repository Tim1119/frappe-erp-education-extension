/**
 * Strip HTML tags from a string, e.g. Frappe's own error messages
 * sometimes include literal markup like "<strong>2026/2027</strong>"
 * intended for its Desk UI — our toasts render plain text, so raw tags
 * would otherwise show up literally instead of being interpreted.
 */
function stripHtml(str) {
	if (typeof str !== "string") return str;
	return str
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/p>|<\/div>|<\/li>/gi, " ")
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
	const data = error?.response?.data;
	if (!data) return stripHtml(error?.message) || fallback;
	if (typeof data === "string") return stripHtml(data);

	// Check nested errors FIRST (before data.message)
	if (data.non_field_errors) {
		const v = data.non_field_errors;
		return stripHtml(Array.isArray(v) ? v.join(", ") : String(v));
	}
	if (data.errors) {
		if (typeof data.errors === "string") return stripHtml(data.errors);
		if (data.errors.non_field_errors) {
			const v = data.errors.non_field_errors;
			return stripHtml(Array.isArray(v) ? v.join(", ") : String(v));
		}
		const firstKey = Object.keys(data.errors)[0];
		if (firstKey) {
			const value = data.errors[firstKey];
			if (Array.isArray(value)) return stripHtml(`${firstKey}: ${value.join(", ")}`);
			if (typeof value === "string") return stripHtml(`${firstKey}: ${value}`);
		}
	}

	// Fall back to generic message / detail
	if (data.detail) return stripHtml(data.detail);
	if (data.message && data.message !== "Validation failed.") return stripHtml(data.message);

	// Django field errors
	const firstField = Object.keys(data)[0];
	if (firstField && firstField !== "success" && firstField !== "code") {
		const val = data[firstField];
		if (Array.isArray(val)) return stripHtml(`${firstField}: ${val.join(", ")}`);
		if (typeof val === "string") return stripHtml(`${firstField}: ${val}`);
	}
	return fallback;
}
