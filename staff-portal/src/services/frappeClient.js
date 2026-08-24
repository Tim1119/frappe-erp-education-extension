// ─────────────────────────────────────────────────────────────────────────
// Frappe REST client.
//
// Assumes the built frontend is served from the SAME origin as the Frappe
// site (e.g. Frappe serves /assets/school_staff_portal/... or this app sits
// behind the same reverse proxy). That means:
//   - No CORS configuration is needed.
//   - The session cookie (sid) Frappe sets on login is sent automatically
//     on same-origin requests, so `credentials: 'same-origin'` is enough.
//   - All calls are made with relative paths ("/api/..."), never an absolute
//     host, so this works unchanged in dev (behind Vite's proxy — see
//     vite.config.js) and in production.
//
// Frappe's REST conventions used here:
//   GET    /api/resource/<DocType>                → list (filters/fields/paging via querystring)
//   GET    /api/resource/<DocType>/<name>          → single doc
//   POST   /api/resource/<DocType>                 → create
//   PUT    /api/resource/<DocType>/<name>           → update
//   DELETE /api/resource/<DocType>/<name>           → delete
//   POST   /api/method/login                        → session login (usr, pwd)
//   GET    /api/method/logout                       → session logout
//   GET    /api/method/frappe.auth.get_logged_user   → current session user
//   GET    /api/method/frappe.client.get_count       → count matching filters
//   POST   /api/method/<dotted.path>                → call a whitelisted method
// ─────────────────────────────────────────────────────────────────────────

const BASE = ""; // relative — same origin as the Frappe site

class FrappeError extends Error {
	constructor(message, status, payload) {
		super(message);
		this.name = "FrappeError";
		this.status = status;
		this.payload = payload;
	}
}

function qs(params = {}) {
	const parts = [];
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") return;
		const v = typeof value === "string" ? value : JSON.stringify(value);
		parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
	});
	return parts.length ? `?${parts.join("&")}` : "";
}

async function request(path, { method = "GET", body, headers } = {}) {
	const res = await fetch(`${BASE}${path}`, {
		method,
		credentials: "same-origin", // send the Frappe session cookie
		headers: {
			Accept: "application/json",
			...(body ? { "Content-Type": "application/json" } : {}),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const isJson = (res.headers.get("content-type") || "").includes("application/json");
	const payload = isJson ? await res.json().catch(() => null) : await res.text();

	if (!res.ok) {
		const message = payload?._server_messages
			? safeParseServerMessages(payload._server_messages)
			: payload?.message || payload?.exception || res.statusText || "Request failed";
		throw new FrappeError(message, res.status, payload);
	}
	return payload;
}

function safeParseServerMessages(raw) {
	try {
		const arr = JSON.parse(raw);
		const messages = arr
			.map((m) => {
				try {
					return JSON.parse(m).message;
				} catch {
					return m;
				}
			})
			.filter(Boolean);
		return [...new Set(messages)].join(" ");
	} catch {
		return raw;
	}
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function login(usr, pwd) {
	// Frappe's session login endpoint. On success it sets the `sid` cookie.
	return request("/api/method/login", { method: "POST", body: { usr, pwd } });
}

export async function logout() {
	return request("/api/method/logout");
}

export async function getLoggedUser() {
	const data = await request("/api/method/frappe.auth.get_logged_user");
	return data?.message;
}

/** Fetch profile fields (full name, roles, user image) for the logged-in user. */
export async function getCurrentUserProfile(email) {
	const data = await request(`/api/resource/User/${encodeURIComponent(email)}`);
	return data?.data;
}

// ── Generic resource CRUD ────────────────────────────────────────────────

/**
 * List documents for a DocType.
 * params: { fields, filters, or_filters, order_by, limit_start, limit_page_length }
 * `fields` and `filters` should be arrays (JSON-encoded automatically).
 */
export async function getList(doctype, params = {}) {
	const data = await request(`/api/resource/${encodeURIComponent(doctype)}${qs(params)}`);
	return data?.data || [];
}

/** Count documents matching filters (for pagination totals). */
export async function getCount(doctype, filters = []) {
	const data = await request(`/api/method/frappe.client.get_count${qs({ doctype, filters })}`);
	return data?.message || 0;
}

export async function getDoc(doctype, name) {
	const data = await request(
		`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
	);
	return data?.data;
}

export async function createDoc(doctype, values) {
	const data = await request(`/api/resource/${encodeURIComponent(doctype)}`, {
		method: "POST",
		body: values,
	});
	return data?.data;
}

export async function updateDoc(doctype, name, values) {
	const data = await request(
		`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
		{ method: "PUT", body: values },
	);
	return data?.data;
}

export async function deleteDoc(doctype, name) {
	await request(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, {
		method: "DELETE",
	});
	return true;
}

/** Call a whitelisted server method, e.g. "education.education.api.mark_attendance". */
export async function callMethod(dottedPath, args = {}) {
	const data = await request(`/api/method/${dottedPath}`, { method: "POST", body: args });
	return data?.message;
}

/**
 * Convenience: fetch a page of results AND the total count together, in the
 * shape most list pages want: { rows, count }.
 */
export async function getPage(
	doctype,
	{ fields, filters, order_by, page = 1, pageSize = 20 } = {},
) {
	const limit_start = (page - 1) * pageSize;
	const [rows, count] = await Promise.all([
		getList(doctype, { fields, filters, order_by, limit_start, limit_page_length: pageSize }),
		getCount(doctype, filters),
	]);
	return { rows, count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
}

export { FrappeError };
