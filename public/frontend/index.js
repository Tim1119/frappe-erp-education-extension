import {
	_ as E,
	c as v,
	a as L,
	r as A,
	o as P,
	d as p,
	b as d,
	e as l,
	f as w,
	g as I,
	h as R,
	s as _,
	i as k,
	j as y,
	k as S,
	B as W,
	l as O,
	m as j,
} from "./vendor.js";
const D = function () {
	const e = document.createElement("link").relList;
	if (e && e.supports && e.supports("modulepreload")) return;
	for (const t of document.querySelectorAll('link[rel="modulepreload"]')) n(t);
	new MutationObserver((t) => {
		for (const s of t)
			if (s.type === "childList")
				for (const a of s.addedNodes)
					a.tagName === "LINK" && a.rel === "modulepreload" && n(a);
	}).observe(document, { childList: !0, subtree: !0 });
	function r(t) {
		const s = {};
		return (
			t.integrity && (s.integrity = t.integrity),
			t.referrerpolicy && (s.referrerPolicy = t.referrerpolicy),
			t.crossorigin === "use-credentials"
				? (s.credentials = "include")
				: t.crossorigin === "anonymous"
					? (s.credentials = "omit")
					: (s.credentials = "same-origin"),
			s
		);
	}
	function n(t) {
		if (t.ep) return;
		t.ep = !0;
		const s = r(t);
		fetch(t.href, s);
	}
};
D();
const T = {};
function V(o, e) {
	const r = A("router-view");
	return (P(), v("div", null, [L(r)]));
}
var b = E(T, [["render", V]]);
const G = "modulepreload",
	f = {},
	q = "/assets/education_extension/frontend/",
	u = function (e, r) {
		return !r || r.length === 0
			? e()
			: Promise.all(
					r.map((n) => {
						if (((n = `${q}${n}`), n in f)) return;
						f[n] = !0;
						const t = n.endsWith(".css"),
							s = t ? '[rel="stylesheet"]' : "";
						if (document.querySelector(`link[href="${n}"]${s}`)) return;
						const a = document.createElement("link");
						if (
							((a.rel = t ? "stylesheet" : G),
							t || ((a.as = "script"), (a.crossOrigin = "")),
							(a.href = n),
							document.head.appendChild(a),
							t)
						)
							return new Promise((i, g) => {
								(a.addEventListener("load", i), a.addEventListener("error", g));
							});
					}),
				).then(() => e());
	},
	C = p("education-users", () => ({
		user: d({
			url: "education.education.api.get_user_info",
			cache: "User",
			initialData: [],
			onError(e) {
				(console.log(e),
					console.log(e.exc_type),
					e && e.exc_type === "AuthenticationError" && m.push("/login"));
			},
		}),
	})),
	F = p("education-student", () => {
		const o = l({}),
			e = l({}),
			r = l([]),
			n = d({
				url: "education.education.api.get_student_info",
				onSuccess(i) {
					(i || (window.location.href = "/app"),
						(e.value = i.current_program),
						delete i.current_program,
						(r.value = i.student_groups),
						delete i.student_groups,
						(o.value = i));
				},
				onError(i) {
					console.error(i);
				},
			});
		function t() {
			return o;
		}
		function s() {
			return e;
		}
		function a() {
			return r;
		}
		return {
			student: n,
			studentInfo: o,
			currentProgram: e,
			studentGroups: r,
			getStudentInfo: t,
			getCurrentProgram: s,
			getStudentGroups: a,
		};
	}),
	$ = p("education-session", () => {
		const { user: o } = C();
		F();
		function e() {
			let i = new URLSearchParams(document.cookie.split("; ").join("&")).get("user_id");
			return (i === "Guest" && (i = null), i);
		}
		let r = l(e());
		const n = w(() => !!r.value),
			t = d({
				url: "login",
				onError() {},
				onSuccess() {
					((r.value = e()), o.reload(), t.reset(), m.replace({ path: "/" }));
				},
			}),
			s = d({
				url: "logout",
				onSuccess() {
					((r.value = null), (window.location.href = "/login"));
				},
			});
		return { user: r, isLoggedIn: n, login: t, logout: s };
	}),
	B = [
		{
			path: "/",
			name: "GuardianHome",
			component: () =>
				u(
					() => import("./GuardianHome.js"),
					["GuardianHome.js", "GuardianHome.css", "vendor.js", "vendor.css"],
				),
			meta: { requiresAuth: !0 },
		},
		{
			path: "/login",
			name: "Login",
			component: () =>
				u(
					() => import("./Login.js"),
					["Login.js", "Login.css", "vendor.js", "vendor.css"],
				),
			meta: { requiresAuth: !1 },
		},
		{
			path: "/student/:studentId",
			component: () =>
				u(
					() => import("./StudentDetail.js"),
					["StudentDetail.js", "StudentDetail.css", "vendor.js", "vendor.css"],
				),
			meta: { requiresAuth: !0 },
			children: [
				{ path: "", redirect: (o) => `/student/${o.params.studentId}/profile` },
				{
					path: "attendance",
					name: "WardAttendance",
					component: () =>
						u(
							() => import("./WardAttendance.js"),
							[
								"WardAttendance.js",
								"WardAttendance.css",
								"vendor.js",
								"vendor.css",
								"style.js",
								"style.css",
							],
						),
				},
				{
					path: "schedule",
					name: "WardSchedule",
					component: () =>
						u(
							() => import("./WardSchedule.js"),
							[
								"WardSchedule.js",
								"WardSchedule.css",
								"vendor.js",
								"vendor.css",
								"style.js",
								"style.css",
							],
						),
				},
				{
					path: "grades",
					name: "WardGrades",
					component: () =>
						u(
							() => import("./WardGrades.js"),
							["WardGrades.js", "WardGrades.css", "vendor.js", "vendor.css"],
						),
				},
				{
					path: "fees",
					name: "WardFees",
					component: () =>
						u(
							() => import("./WardFees.js"),
							["WardFees.js", "WardFees.css", "vendor.js", "vendor.css"],
						),
				},
				{
					path: "report",
					name: "WardReport",
					component: () =>
						u(
							() => import("./WardReport.js"),
							["WardReport.js", "WardReport.css", "vendor.js", "vendor.css"],
						),
				},
				{
					path: "awards",
					name: "WardAwards",
					component: () =>
						u(
							() => import("./WardAwards.js"),
							["WardAwards.js", "WardAwards.css", "vendor.js", "vendor.css"],
						),
				},
				{
					path: "profile",
					name: "WardProfile",
					component: () =>
						u(
							() => import("./WardProfile.js"),
							["WardProfile.js", "WardProfile.css", "vendor.js", "vendor.css"],
						),
				},
			],
		},
	],
	m = I({ history: R("/guardian-dashboard"), routes: B });
m.beforeEach((o, e, r) => {
	const n = $();
	if ((n.user === "Administrator" || n.user === "admin@gmail.com") && o.name !== "Login") {
		window.location.href = "/app";
		return;
	}
	o.meta.requiresAuth && !n.isLoggedIn
		? r({ name: "Login" })
		: o.name === "Login" && n.isLoggedIn
			? r({ name: "GuardianHome" })
			: r();
});
function U(o) {
	let e = document.cookie.match("\\b" + o + "=([^;]*)\\b");
	return e ? e[1] : void 0;
}
var h;
window.csrf_token = (h = window.frappe) == null ? void 0 : h.csrf_token;
_("resourceFetcher", (o, e) => {
	var n;
	(e || (e = {}), e.headers || (e.headers = {}), (e.credentials = "include"));
	const r = U("csrf_token") || ((n = window.frappe) == null ? void 0 : n.csrf_token);
	return (r && r !== "Guest" && (e.headers["X-Frappe-CSRF-Token"] = r), j(o));
});
_("cache", !1);
const c = k(b);
c.use(y());
c.use(m);
c.use(S);
c.component("Button", W);
c.component("FeatherIcon", O);
c.mount("#app");
export { $ as s };
