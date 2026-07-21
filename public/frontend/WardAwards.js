import {
	_ as j,
	b as q,
	e as y,
	N as G,
	a6 as O,
	f as g,
	c as a,
	n as e,
	u as c,
	I as h,
	a5 as k,
	w as b,
	t as o,
	W as V,
	K as $,
	F as w,
	p as C,
	y as n,
	a7 as H,
	q as U,
	v as J,
	J as K,
	U as P,
	o as s,
} from "./vendor.js";
const r = (m) => (U("data-v-24af0338"), (m = m()), J(), m),
	Q = { class: "awards-page" },
	X = { class: "section" },
	Z = { class: "page-header" },
	ee = r(() =>
		e(
			"div",
			null,
			[
				e("h1", { class: "page-title" }, "Individual Awards"),
				e("p", { class: "page-sub" }, "Personal certificates and recognition"),
			],
			-1,
		),
	),
	te = ["disabled"],
	se = r(() =>
		e(
			"path",
			{
				"fill-rule": "evenodd",
				d: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
				"clip-rule": "evenodd",
			},
			null,
			-1,
		),
	),
	ae = [se],
	le = b(" Refresh "),
	ie = { class: "filter-card" },
	oe = r(() => e("h2", { class: "filter-title" }, "Filter Awards", -1)),
	ne = { class: "filter-grid" },
	re = { class: "filter-field" },
	ce = r(() => e("label", { class: "filter-label" }, "Year", -1)),
	de = r(() =>
		e(
			"path",
			{
				"fill-rule": "evenodd",
				d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
				"clip-rule": "evenodd",
			},
			null,
			-1,
		),
	),
	ue = [de],
	_e = ["onClick"],
	ve = { class: "filter-field" },
	fe = r(() => e("label", { class: "filter-label" }, "Category", -1)),
	pe = r(() =>
		e(
			"path",
			{
				"fill-rule": "evenodd",
				d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
				"clip-rule": "evenodd",
			},
			null,
			-1,
		),
	),
	he = [pe],
	ye = ["onClick"],
	ge = r(() =>
		e(
			"svg",
			{
				viewBox: "0 0 20 20",
				fill: "currentColor",
				style: { width: "16px", height: "16px" },
			},
			[
				e("path", {
					"fill-rule": "evenodd",
					d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
					"clip-rule": "evenodd",
				}),
			],
			-1,
		),
	),
	me = b(" Clear Filters "),
	ke = [ge, me],
	be = { key: 0, class: "loading" },
	we = r(() => e("div", { class: "spinner" }, null, -1)),
	Ce = r(() => e("p", null, "Loading awards...", -1)),
	xe = [we, Ce],
	Me = { key: 1, class: "awards-grid" },
	Ae = r(() => e("div", { class: "award-icon" }, "\u{1F3C5}", -1)),
	Be = { class: "award-body" },
	Fe = { class: "award-title" },
	Le = { key: 0, class: "award-date" },
	Ie = { key: 1, class: "award-desc" },
	Se = { class: "award-footer" },
	ze = { key: 0, class: "award-badge" },
	Re = { key: 1, class: "award-year" },
	Ne = ["href"],
	Ve = { key: 2, class: "empty-card" },
	$e = r(() =>
		e(
			"svg",
			{
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.5",
				style: { width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 1rem" },
			},
			[
				e("path", {
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					d: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0",
				}),
			],
			-1,
		),
	),
	He = r(() => e("h3", { class: "empty-title" }, "No Individual Awards Found", -1)),
	We = { class: "empty-sub" },
	De = { key: 0, class: "section" },
	Ye = r(() =>
		e(
			"div",
			{ class: "section-header" },
			[
				e("h2", { class: "section-title" }, "General Awards"),
				e("p", { class: "section-sub" }, "Class and group certificates"),
			],
			-1,
		),
	),
	Ee = { class: "awards-grid" },
	Te = r(() => e("div", { class: "award-icon" }, "\u{1F396}\uFE0F", -1)),
	je = { class: "award-body" },
	qe = { class: "award-title" },
	Ge = { key: 0, class: "award-date" },
	Oe = { key: 1, class: "award-desc" },
	Ue = { class: "award-footer" },
	Je = { key: 0, class: "award-badge general-badge" },
	Ke = { key: 1, class: "award-year" },
	Pe = ["href"],
	Qe = {
		setup(m) {
			const W = K(),
				u = q({
					url: "education_extension.guardian.get_ward_awards",
					params: { student_id: W.params.studentId },
					auto: !0,
					cache: !1,
				});
			function F(l) {
				return l ? l.replace(/<[^>]*>/g, "").trim() : "";
			}
			const _ = y(""),
				v = y(""),
				d = y(null),
				x = y({}),
				M = y(null),
				A = y(null),
				D = { year: M, cat: A };
			function L(l) {
				if (d.value === l) {
					d.value = null;
					return;
				}
				((d.value = l),
					P(() => {
						var p;
						const i =
							(p = D[l].value) == null ? void 0 : p.querySelector(".filter-btn");
						if (!i) return;
						const f = i.getBoundingClientRect();
						x.value = {
							position: "fixed",
							top: f.bottom + 4 + "px",
							left: f.left + "px",
							minWidth: f.width + "px",
							zIndex: 9999,
						};
					}));
			}
			function I(l) {
				[M, A].some((f) => {
					var p;
					return (p = f.value) == null ? void 0 : p.contains(l.target);
				}) || (d.value = null);
			}
			(G(() => document.addEventListener("click", I)),
				O(() => document.removeEventListener("click", I)));
			const B = g(() => {
					var l;
					return ((l = u.data) == null ? void 0 : l.individual) || [];
				}),
				Y = g(() =>
					[...new Set(B.value.map((l) => l.academic_year).filter(Boolean))]
						.sort()
						.reverse(),
				),
				E = g(() =>
					[...new Set(B.value.map((l) => l.certificate_type).filter(Boolean))].sort(),
				),
				S = g(() => _.value || v.value);
			function z() {
				((_.value = ""), (v.value = ""));
			}
			const R = g(() =>
				B.value.filter(
					(l) =>
						(!_.value || l.academic_year === _.value) &&
						(!v.value || l.certificate_type === v.value),
				),
			);
			function N(l) {
				return new Date(l).toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				});
			}
			return (l, i) => {
				var f, p;
				return (
					s(),
					a("div", Q, [
						e("div", X, [
							e("div", Z, [
								ee,
								e(
									"button",
									{
										class: "btn-refresh",
										onClick: i[0] || (i[0] = (t) => c(u).reload()),
										disabled: c(u).loading,
									},
									[
										(s(),
										a(
											"svg",
											{
												viewBox: "0 0 20 20",
												fill: "currentColor",
												class: h({ spinning: c(u).loading }),
											},
											ae,
											2,
										)),
										le,
									],
									8,
									te,
								),
							]),
							e("div", ie, [
								oe,
								e("div", ne, [
									e("div", re, [
										ce,
										e(
											"div",
											{
												class: "filter-dropdown-wrap",
												ref_key: "yearRef",
												ref: M,
											},
											[
												e(
													"button",
													{
														class: "filter-btn",
														onClick:
															i[1] ||
															(i[1] = k((t) => L("year"), ["stop"])),
													},
													[
														b(o(_.value || "All Years") + " ", 1),
														(s(),
														a(
															"svg",
															{
																viewBox: "0 0 20 20",
																fill: "currentColor",
																class: h([
																	"chevron",
																	{ open: d.value === "year" },
																]),
															},
															ue,
															2,
														)),
													],
												),
												(s(),
												V(H, { to: "body" }, [
													d.value === "year"
														? (s(),
															a(
																"div",
																{
																	key: 0,
																	class: "award-filter-menu",
																	style: $(x.value),
																	onClick:
																		i[3] ||
																		(i[3] = k(() => {}, [
																			"stop",
																		])),
																},
																[
																	e(
																		"button",
																		{
																			class: h([
																				"award-filter-item",
																				{
																					active: !_.value,
																				},
																			]),
																			onClick:
																				i[2] ||
																				(i[2] = (t) => {
																					((_.value =
																						""),
																						(d.value =
																							null));
																				}),
																		},
																		"All Years",
																		2,
																	),
																	(s(!0),
																	a(
																		w,
																		null,
																		C(
																			c(Y),
																			(t) => (
																				s(),
																				a(
																					"button",
																					{
																						key: t,
																						class: h([
																							"award-filter-item",
																							{
																								active:
																									_.value ===
																									t,
																							},
																						]),
																						onClick: (
																							T,
																						) => {
																							((_.value =
																								t),
																								(d.value =
																									null));
																						},
																					},
																					o(t),
																					11,
																					_e,
																				)
																			),
																		),
																		128,
																	)),
																],
																4,
															))
														: n("", !0),
												])),
											],
											512,
										),
									]),
									e("div", ve, [
										fe,
										e(
											"div",
											{
												class: "filter-dropdown-wrap",
												ref_key: "catRef",
												ref: A,
											},
											[
												e(
													"button",
													{
														class: "filter-btn",
														onClick:
															i[4] ||
															(i[4] = k((t) => L("cat"), ["stop"])),
													},
													[
														b(o(v.value || "All Categories") + " ", 1),
														(s(),
														a(
															"svg",
															{
																viewBox: "0 0 20 20",
																fill: "currentColor",
																class: h([
																	"chevron",
																	{ open: d.value === "cat" },
																]),
															},
															he,
															2,
														)),
													],
												),
												(s(),
												V(H, { to: "body" }, [
													d.value === "cat"
														? (s(),
															a(
																"div",
																{
																	key: 0,
																	class: "award-filter-menu",
																	style: $(x.value),
																	onClick:
																		i[6] ||
																		(i[6] = k(() => {}, [
																			"stop",
																		])),
																},
																[
																	e(
																		"button",
																		{
																			class: h([
																				"award-filter-item",
																				{
																					active: !v.value,
																				},
																			]),
																			onClick:
																				i[5] ||
																				(i[5] = (t) => {
																					((v.value =
																						""),
																						(d.value =
																							null));
																				}),
																		},
																		"All Categories",
																		2,
																	),
																	(s(!0),
																	a(
																		w,
																		null,
																		C(
																			c(E),
																			(t) => (
																				s(),
																				a(
																					"button",
																					{
																						key: t,
																						class: h([
																							"award-filter-item",
																							{
																								active:
																									v.value ===
																									t,
																							},
																						]),
																						onClick: (
																							T,
																						) => {
																							((v.value =
																								t),
																								(d.value =
																									null));
																						},
																					},
																					o(t),
																					11,
																					ye,
																				)
																			),
																		),
																		128,
																	)),
																],
																4,
															))
														: n("", !0),
												])),
											],
											512,
										),
									]),
									e("div", { class: "filter-field filter-clear" }, [
										e("button", { class: "btn-clear", onClick: z }, ke),
									]),
								]),
							]),
							c(u).loading
								? (s(), a("div", be, xe))
								: c(R).length > 0
									? (s(),
										a("div", Me, [
											(s(!0),
											a(
												w,
												null,
												C(
													c(R),
													(t) => (
														s(),
														a(
															"div",
															{ key: t.name, class: "award-card" },
															[
																Ae,
																e("div", Be, [
																	e(
																		"h3",
																		Fe,
																		o(t.certificate_title),
																		1,
																	),
																	t.certificate_date
																		? (s(),
																			a(
																				"p",
																				Le,
																				o(
																					N(
																						t.certificate_date,
																					),
																				),
																				1,
																			))
																		: n("", !0),
																	t.description
																		? (s(),
																			a(
																				"p",
																				Ie,
																				o(
																					F(
																						t.description,
																					),
																				),
																				1,
																			))
																		: n("", !0),
																	e("div", Se, [
																		t.certificate_type
																			? (s(),
																				a(
																					"span",
																					ze,
																					o(
																						t.certificate_type,
																					),
																					1,
																				))
																			: n("", !0),
																		t.academic_year
																			? (s(),
																				a(
																					"span",
																					Re,
																					o(
																						t.academic_year,
																					),
																					1,
																				))
																			: n("", !0),
																		t.certificate_file
																			? (s(),
																				a(
																					"a",
																					{
																						key: 2,
																						href: t.certificate_file,
																						target: "_blank",
																						class: "btn-download",
																					},
																					" \u2193 Certificate ",
																					8,
																					Ne,
																				))
																			: n("", !0),
																	]),
																]),
															],
														)
													),
												),
												128,
											)),
										]))
									: c(u).loading
										? n("", !0)
										: (s(),
											a("div", Ve, [
												$e,
												He,
												e(
													"p",
													We,
													o(
														c(S)
															? "No awards match your filters."
															: "No individual awards yet.",
													),
													1,
												),
												c(S)
													? (s(),
														a(
															"button",
															{
																key: 0,
																class: "btn-clear",
																style: { margin: "0 auto" },
																onClick: z,
															},
															"Clear Filters",
														))
													: n("", !0),
											])),
						]),
						!c(u).loading &&
						((p = (f = c(u).data) == null ? void 0 : f.general) == null
							? void 0
							: p.length)
							? (s(),
								a("div", De, [
									Ye,
									e("div", Ee, [
										(s(!0),
										a(
											w,
											null,
											C(
												c(u).data.general,
												(t) => (
													s(),
													a(
														"div",
														{
															key: t.name,
															class: "award-card general",
														},
														[
															Te,
															e("div", je, [
																e(
																	"h3",
																	qe,
																	o(t.certificate_title),
																	1,
																),
																t.certificate_date
																	? (s(),
																		a(
																			"p",
																			Ge,
																			o(
																				N(
																					t.certificate_date,
																				),
																			),
																			1,
																		))
																	: n("", !0),
																t.description
																	? (s(),
																		a(
																			"p",
																			Oe,
																			o(F(t.description)),
																			1,
																		))
																	: n("", !0),
																e("div", Ue, [
																	t.certificate_type
																		? (s(),
																			a(
																				"span",
																				Je,
																				o(
																					t.certificate_type,
																				),
																				1,
																			))
																		: n("", !0),
																	t.student_group
																		? (s(),
																			a(
																				"span",
																				Ke,
																				o(t.student_group),
																				1,
																			))
																		: n("", !0),
																	t.certificate_file
																		? (s(),
																			a(
																				"a",
																				{
																					key: 2,
																					href: t.certificate_file,
																					target: "_blank",
																					class: "btn-download",
																				},
																				" \u2193 Certificate ",
																				8,
																				Pe,
																			))
																		: n("", !0),
																]),
															]),
														],
													)
												),
											),
											128,
										)),
									]),
								]))
							: n("", !0),
					])
				);
			};
		},
	};
var Ze = j(Qe, [["__scopeId", "data-v-24af0338"]]);
export { Ze as default };
