export function initials(name) {
	const p = String(name || "Sync User").split(" ");
	return (p[0]?.[0] || "S") + (p[1]?.[0] || "U");
}

export function badgeClass(value) {
	const map = {
		green: "b-green",
		brand: "b-blue",
		amber: "b-amber",
		red: "b-red",
		purple: "b-purple",
		gray: "b-gray",
		cyan: "b-blue",
		ISSUED: "b-green",
		PRINTED: "b-blue",
		PENDING: "b-amber",
		REVOKED: "b-red",
		DRAFT: "b-gray",
		READY: "b-purple",
		SENT_TO_PRINT: "b-blue",
		GENERATED: "b-blue",
		ACTIVE: "b-green",
		INACTIVE: "b-gray",
		SUSPENDED: "b-amber",
		EXPIRED: "b-amber",
		PENDING_SETUP: "b-amber",
		SETUP_COMPLETE: "b-green",
		APPROVED: "b-green",
		REJECTED: "b-red",
		AWAITING_INFO: "b-amber",
		COMPLETED: "b-green",
		FAILED: "b-red",
		PROCESSING: "b-blue",
		QUEUED: "b-amber",
		VALID: "b-green",
		INVALID: "b-red",
		EXPIRED_SCAN: "b-amber",
		COMPLETED_WITH_SKIPS: "b-amber",
		COMPLETED_WITH_ERRORS: "b-red",
	};
	return map[value] || map[String(value).toUpperCase()] || "b-gray";
}

export const cx = (...items) => items.filter(Boolean).join(" ");

export function fmtDate(d) {
	if (!d) return "—";
	return new Date(d).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function fmtDateTime(d) {
	if (!d) return "—";
	return new Date(d).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function fmtNum(v) {
	return Number(v || 0).toLocaleString();
}

export function fmtPct(v) {
	return `${Number(v || 0).toFixed(1)}%`;
}

export function capitalize(s) {
	return (
		String(s || "")
			.charAt(0)
			.toUpperCase() +
		String(s || "")
			.slice(1)
			.toLowerCase()
	);
}

export function fullName(p) {
	return (
		p?.full_name ||
		[p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
		p?.name ||
		p?.email ||
		"Unnamed"
	);
}

export function personRef(p) {
	return p?.matric_number || p?.employee_id || p?.staff_id || p?.student_id || "";
}
