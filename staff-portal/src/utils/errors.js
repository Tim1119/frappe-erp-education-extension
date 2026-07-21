// export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
//   const data = error?.response?.data;
//   if (!data) return error?.message || fallback;
//   if (typeof data === 'string') return data;
//   if (data.message) return data.message;
//   if (data.detail) return data.detail;
//   if (data.non_field_errors) {
//     const v = data.non_field_errors;
//     return Array.isArray(v) ? v.join(', ') : String(v);
//   }
//   if (data.errors) {
//     if (typeof data.errors === 'string') return data.errors;
//     const firstKey = Object.keys(data.errors)[0];
//     const value = data.errors[firstKey];
//     if (Array.isArray(value)) return `${firstKey}: ${value.join(', ')}`;
//     if (typeof value === 'string') return `${firstKey}: ${value}`;
//   }
//   // Django field errors
//   const firstField = Object.keys(data)[0];
//   if (firstField && firstField !== 'success') {
//     const val = data[firstField];
//     if (Array.isArray(val)) return `${firstField}: ${val.join(', ')}`;
//     if (typeof val === 'string') return `${firstField}: ${val}`;
//   }
//   return fallback;
// }

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
	const data = error?.response?.data;
	if (!data) return error?.message || fallback;
	if (typeof data === "string") return data;

	// Check nested errors FIRST (before data.message)
	if (data.non_field_errors) {
		const v = data.non_field_errors;
		return Array.isArray(v) ? v.join(", ") : String(v);
	}
	if (data.errors) {
		if (typeof data.errors === "string") return data.errors;
		if (data.errors.non_field_errors) {
			const v = data.errors.non_field_errors;
			return Array.isArray(v) ? v.join(", ") : String(v);
		}
		const firstKey = Object.keys(data.errors)[0];
		if (firstKey) {
			const value = data.errors[firstKey];
			if (Array.isArray(value)) return `${firstKey}: ${value.join(", ")}`;
			if (typeof value === "string") return `${firstKey}: ${value}`;
		}
	}

	// Fall back to generic message / detail
	if (data.detail) return data.detail;
	if (data.message && data.message !== "Validation failed.") return data.message;

	// Django field errors
	const firstField = Object.keys(data)[0];
	if (firstField && firstField !== "success" && firstField !== "code") {
		const val = data[firstField];
		if (Array.isArray(val)) return `${firstField}: ${val.join(", ")}`;
		if (typeof val === "string") return `${firstField}: ${val}`;
	}
	return fallback;
}
