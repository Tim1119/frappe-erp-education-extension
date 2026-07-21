import {
	_ as b,
	b as v,
	c as t,
	n as e,
	u as a,
	t as c,
	F as g,
	p as m,
	q as x,
	v as w,
	w as k,
	x as S,
	o,
	y as C,
	z as L,
} from "./vendor.js";
import { s as B } from "./index.js";
const i = (n) => (x("data-v-e8872eee"), (n = n()), w(), n),
	V = { class: "page-wrap" },
	M = { class: "page-header" },
	z = { class: "header-left" },
	I = { key: 0, class: "school-logo" },
	N = ["src"],
	j = { key: 1, class: "school-logo-placeholder" },
	G = i(() =>
		e(
			"svg",
			{ viewBox: "0 0 40 40", fill: "none" },
			[
				e("rect", { width: "40", height: "40", rx: "8", fill: "#1a1a1a" }),
				e("path", {
					d: "M20 8L32 15V25L20 32L8 25V15L20 8Z",
					stroke: "white",
					"stroke-width": "1.5",
					fill: "none",
				}),
				e("circle", { cx: "20", cy: "20", r: "3", fill: "white" }),
			],
			-1,
		),
	),
	H = [G],
	P = i(() => e("h1", { class: "page-title" }, "Guardian Portal", -1)),
	R = { class: "page-sub" },
	$ = { class: "header-right" },
	F = { class: "user-email" },
	T = i(() =>
		e(
			"svg",
			{ viewBox: "0 0 20 20", fill: "currentColor", class: "btn-icon" },
			[
				e("path", {
					"fill-rule": "evenodd",
					d: "M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z",
					"clip-rule": "evenodd",
				}),
			],
			-1,
		),
	),
	q = k(" Sign Out "),
	D = [T, q],
	E = { class: "page-body" },
	O = i(() => e("div", { class: "section-label" }, "Your Children", -1)),
	U = { key: 0, class: "cards-grid" },
	Y = { key: 1, class: "empty-state" },
	Z = L(
		'<div class="empty-icon" data-v-e8872eee><svg viewBox="0 0 48 48" fill="none" data-v-e8872eee><circle cx="24" cy="24" r="22" stroke="#e5e7eb" stroke-width="2" data-v-e8872eee></circle><path d="M24 14a5 5 0 100 10 5 5 0 000-10zM14 34c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" data-v-e8872eee></path></svg></div><p class="empty-title" data-v-e8872eee>No students linked to this account</p><p class="empty-sub" data-v-e8872eee>Please contact the school administration to link your children.</p>',
		3,
	),
	A = [Z],
	J = { key: 2, class: "cards-grid" },
	K = ["onClick"],
	Q = { class: "card-avatar" },
	W = ["src", "alt"],
	X = { key: 1, class: "avatar-initials" },
	ee = { class: "card-info" },
	se = { class: "card-name" },
	te = { class: "card-id" },
	oe = { key: 0, class: "card-meta" },
	ae = { class: "meta-badge" },
	ce = i(() =>
		e(
			"div",
			{ class: "card-arrow" },
			[
				e("svg", { viewBox: "0 0 20 20", fill: "currentColor" }, [
					e("path", {
						"fill-rule": "evenodd",
						d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
						"clip-rule": "evenodd",
					}),
				]),
			],
			-1,
		),
	),
	ie = i(() =>
		e(
			"footer",
			{ class: "page-footer" },
			[k("Powered by "), e("strong", null, "Rhocom Technology")],
			-1,
		),
	),
	ne = {
		setup(n) {
			const f = S(),
				h = B(),
				d = v({
					url: "education_extension.guardian.get_linked_students",
					auto: !0,
					cache: !1,
				}),
				r = v({
					url: "education.education.api.get_school_abbr_logo",
					auto: !0,
					cache: !1,
				});
			function y(_) {
				return _
					? _.split(" ")
							.map((l) => l[0])
							.slice(0, 2)
							.join("")
							.toUpperCase()
					: "?";
			}
			return (_, l) => {
				var u, p;
				return (
					o(),
					t("div", V, [
						e("header", M, [
							e("div", z, [
								((u = a(r).data) == null ? void 0 : u.logo)
									? (o(),
										t("div", I, [
											e(
												"img",
												{ src: a(r).data.logo, alt: "School Logo" },
												null,
												8,
												N,
											),
										]))
									: (o(), t("div", j, H)),
								e("div", null, [
									P,
									e(
										"p",
										R,
										c(
											((p = a(r).data) == null ? void 0 : p.name) ||
												"School Management",
										),
										1,
									),
								]),
							]),
							e("div", $, [
								e("span", F, c(a(h).user), 1),
								e(
									"button",
									{
										class: "signout-btn",
										onClick: l[0] || (l[0] = (s) => a(h).logout.submit()),
									},
									D,
								),
							]),
						]),
						e("main", E, [
							O,
							a(d).loading
								? (o(),
									t("div", U, [
										(o(),
										t(
											g,
											null,
											m(2, (s) =>
												e("div", { key: s, class: "ward-card skeleton" }),
											),
											64,
										)),
									]))
								: !a(d).data || a(d).data.length === 0
									? (o(), t("div", Y, A))
									: (o(),
										t("div", J, [
											(o(!0),
											t(
												g,
												null,
												m(
													a(d).data,
													(s) => (
														o(),
														t(
															"div",
															{
																key: s.name,
																class: "ward-card",
																onClick: (de) =>
																	a(f).push(
																		`/student/${s.name}`,
																	),
															},
															[
																e("div", Q, [
																	s.image
																		? (o(),
																			t(
																				"img",
																				{
																					key: 0,
																					src: s.image,
																					alt: s.student_name,
																				},
																				null,
																				8,
																				W,
																			))
																		: (o(),
																			t(
																				"span",
																				X,
																				c(
																					y(
																						s.student_name,
																					),
																				),
																				1,
																			)),
																]),
																e("div", ee, [
																	e(
																		"h3",
																		se,
																		c(s.student_name),
																		1,
																	),
																	e("p", te, c(s.name), 1),
																	s.blood_group
																		? (o(),
																			t("div", oe, [
																				e(
																					"span",
																					ae,
																					c(
																						s.blood_group,
																					),
																					1,
																				),
																			]))
																		: C("", !0),
																]),
																ce,
															],
															8,
															K,
														)
													),
												),
												128,
											)),
										])),
						]),
						ie,
					])
				);
			};
		},
	};
var _e = b(ne, [["__scopeId", "data-v-e8872eee"]]);
export { _e as default };
