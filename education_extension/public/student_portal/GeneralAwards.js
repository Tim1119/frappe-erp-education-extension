var j = (G, b, p) =>
	new Promise((h, i) => {
		var r = (m) => {
				try {
					_(p.next(m));
				} catch (x) {
					i(x);
				}
			},
			d = (m) => {
				try {
					_(p.throw(m));
				} catch (x) {
					i(x);
				}
			},
			_ = (m) => (m.done ? h(m.value) : Promise.resolve(m.value).then(r, d));
		_((p = p.apply(G, b)).next());
	});
import {
	E as R,
	r as f,
	g as C,
	p as U,
	o as u,
	a as v,
	e as s,
	f as o,
	w as n,
	u as l,
	_ as c,
	K as w,
	h as y,
	D as V,
	t as g,
	d as A,
	F as O,
	i as $,
	b as z,
} from "./index.js";
import { c as Y } from "./call.js";
const I = { class: "min-h-screen bg-gray-50 px-6 py-8" },
	K = { class: "mb-8" },
	P = { class: "bg-white rounded-lg p-6 shadow-sm border" },
	q = { class: "flex justify-between items-center" },
	H = { class: "bg-white rounded-lg shadow-sm border p-6 mb-6" },
	J = { class: "grid grid-cols-1 md:grid-cols-4 gap-4" },
	Q = { class: "flex items-end" },
	W = { key: 0, class: "mb-6 bg-red-50 border border-red-200 rounded-lg p-4" },
	X = { class: "flex items-start" },
	Z = { class: "text-sm text-red-700 mt-1" },
	ee = { key: 1, class: "text-center py-12" },
	te = { key: 2, class: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" },
	se = { class: "flex items-start justify-between mb-3" },
	ae = { class: "flex-1" },
	le = { class: "text-lg font-semibold text-gray-900 mb-1" },
	oe = {
		class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
	},
	ie = { class: "space-y-2 mb-4" },
	ne = { class: "flex items-center text-sm text-gray-600" },
	re = { key: 0, class: "flex items-center text-sm text-gray-600" },
	de = { key: 0, class: "text-sm text-gray-700 mb-4 line-clamp-3" },
	ue = { class: "flex justify-end items-center border-t pt-4" },
	ce = { key: 1, class: "text-xs text-gray-400 italic" },
	me = { key: 3, class: "text-center py-12" },
	fe = { class: "bg-white rounded-lg p-8 shadow-sm border" },
	ve = { class: "text-gray-600" },
	pe = {
		__name: "GeneralAwards",
		setup(G) {
			const b = f(!1),
				p = f(!1),
				h = f([]),
				i = f(""),
				r = f(""),
				d = f(""),
				_ = f(""),
				m = f([]),
				x = f([]),
				D = f([]),
				M = C(() => [
					{ label: "All Years", value: "", onClick: () => (i.value = "") },
					...m.value.map((a) => ({ label: a, value: a, onClick: () => (i.value = a) })),
				]),
				L = C(() => [
					{ label: "All Types", value: "", onClick: () => (r.value = "") },
					...x.value.map((a) => ({ label: a, value: a, onClick: () => (r.value = a) })),
				]),
				S = C(() => [
					{ label: "All Classes", value: "", onClick: () => (d.value = "") },
					...D.value.map((a) => ({ label: a, value: a, onClick: () => (d.value = a) })),
				]),
				F = C(() =>
					h.value.filter((a) => {
						const e = !i.value || a.year === i.value,
							t = !r.value || a.category === r.value,
							k = !d.value || a.studentGroup === d.value;
						return e && t && k;
					}),
				),
				N = () =>
					j(this, null, function* () {
						((b.value = !0), (p.value = !0), (_.value = ""));
						try {
							const a = yield Y(
									"education_extension.student_portal_api.get_student_bulk_certificates",
								),
								e = yield Y(
									"education_extension.student_portal_api.get_bulk_certificate_filters",
								);
							((h.value = (a || []).map((t) => {
								const k = new Date(t.certificate_date);
								return {
									name: t.name,
									title: t.certificate_title,
									date: t.certificate_date,
									description: t.description,
									category: t.certificate_type,
									year: k.getFullYear().toString(),
									studentGroup: t.student_group,
									file: t.certificate_file,
								};
							})),
								e &&
									((m.value = e.years || []),
									(x.value = e.categories || []),
									(D.value = e.student_groups || [])));
						} catch (a) {
							(console.error("Error loading certificates:", a),
								(_.value =
									a.message ||
									"Failed to load certificates. Please try again."));
						} finally {
							((b.value = !1), (p.value = !1));
						}
					}),
				T = () => {
					((i.value = ""), (r.value = ""), (d.value = ""));
				},
				B = (a) =>
					a
						? new Date(a).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})
						: "N/A",
				E = (a) => {
					a.file && window.open(a.file, "_blank");
				};
			return (
				U(() => {
					N();
				}),
				(a, e) => (
					u(),
					v("div", I, [
						s("div", K, [
							s("div", P, [
								s("div", q, [
									e[4] ||
										(e[4] = s(
											"div",
											null,
											[
												s(
													"h1",
													{
														class: "text-3xl font-bold text-gray-900 mb-2",
													},
													"My General Awards",
												),
												s(
													"p",
													{ class: "text-gray-600" },
													"View certificates awarded to your class or group",
												),
											],
											-1,
										)),
									s("div", null, [
										o(
											l(y),
											{
												onClick: N,
												loading: p.value,
												size: "sm",
												variant: "outline",
											},
											{
												prefix: n(() => [
													o(l(c), {
														name: "refresh-cw",
														class: "h-4 w-4",
													}),
												]),
												default: n(() => [
													e[3] || (e[3] = w(" Refresh ", -1)),
												]),
												_: 1,
											},
											8,
											["loading"],
										),
									]),
								]),
							]),
						]),
						s("div", H, [
							e[9] ||
								(e[9] = s(
									"h2",
									{ class: "text-lg font-semibold text-gray-900 mb-4" },
									"Filter Certificates",
									-1,
								)),
							s("div", J, [
								s("div", null, [
									e[5] ||
										(e[5] = s(
											"label",
											{
												class: "block text-sm font-medium text-gray-700 mb-2",
											},
											"Year",
											-1,
										)),
									o(
										l(V),
										{
											options: M.value,
											modelValue: i.value,
											"onUpdate:modelValue":
												e[0] || (e[0] = (t) => (i.value = t)),
										},
										{
											default: n(({ open: t }) => [
												o(
													l(y),
													{
														label: i.value || "All Years",
														class: "w-full justify-between",
													},
													{
														suffix: n(() => [
															o(
																l(c),
																{
																	name: t
																		? "chevron-up"
																		: "chevron-down",
																	class: "h-4 text-gray-600",
																},
																null,
																8,
																["name"],
															),
														]),
														_: 2,
													},
													1032,
													["label"],
												),
											]),
											_: 1,
										},
										8,
										["options", "modelValue"],
									),
								]),
								s("div", null, [
									e[6] ||
										(e[6] = s(
											"label",
											{
												class: "block text-sm font-medium text-gray-700 mb-2",
											},
											"Type",
											-1,
										)),
									o(
										l(V),
										{
											options: L.value,
											modelValue: r.value,
											"onUpdate:modelValue":
												e[1] || (e[1] = (t) => (r.value = t)),
										},
										{
											default: n(({ open: t }) => [
												o(
													l(y),
													{
														label: r.value || "All Types",
														class: "w-full justify-between",
													},
													{
														suffix: n(() => [
															o(
																l(c),
																{
																	name: t
																		? "chevron-up"
																		: "chevron-down",
																	class: "h-4 text-gray-600",
																},
																null,
																8,
																["name"],
															),
														]),
														_: 2,
													},
													1032,
													["label"],
												),
											]),
											_: 1,
										},
										8,
										["options", "modelValue"],
									),
								]),
								s("div", null, [
									e[7] ||
										(e[7] = s(
											"label",
											{
												class: "block text-sm font-medium text-gray-700 mb-2",
											},
											"Class",
											-1,
										)),
									o(
										l(V),
										{
											options: S.value,
											modelValue: d.value,
											"onUpdate:modelValue":
												e[2] || (e[2] = (t) => (d.value = t)),
										},
										{
											default: n(({ open: t }) => [
												o(
													l(y),
													{
														label: d.value || "All Classes",
														class: "w-full justify-between",
													},
													{
														suffix: n(() => [
															o(
																l(c),
																{
																	name: t
																		? "chevron-up"
																		: "chevron-down",
																	class: "h-4 text-gray-600",
																},
																null,
																8,
																["name"],
															),
														]),
														_: 2,
													},
													1032,
													["label"],
												),
											]),
											_: 1,
										},
										8,
										["options", "modelValue"],
									),
								]),
								s("div", Q, [
									o(
										l(y),
										{ onClick: T, class: "w-full", variant: "outline" },
										{
											prefix: n(() => [
												o(l(c), { name: "x-circle", class: "h-4 w-4" }),
											]),
											default: n(() => [
												e[8] || (e[8] = w(" Clear Filters ", -1)),
											]),
											_: 1,
										},
									),
								]),
							]),
						]),
						_.value
							? (u(),
								v("div", W, [
									s("div", X, [
										o(l(c), {
											name: "alert-circle",
											class: "h-5 w-5 text-red-600 mt-0.5 mr-3",
										}),
										s("div", null, [
											e[10] ||
												(e[10] = s(
													"h3",
													{ class: "text-sm font-medium text-red-800" },
													"Error Loading Certificates",
													-1,
												)),
											s("p", Z, g(_.value), 1),
										]),
									]),
								]))
							: A("", !0),
						b.value
							? (u(),
								v("div", ee, [
									...(e[11] ||
										(e[11] = [
											s(
												"div",
												{
													class: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4",
												},
												null,
												-1,
											),
											s(
												"p",
												{ class: "text-gray-600" },
												"Loading your certificates...",
												-1,
											),
										])),
								]))
							: F.value.length > 0
								? (u(),
									v("div", te, [
										(u(!0),
										v(
											O,
											null,
											$(
												F.value,
												(t) => (
													u(),
													v(
														"div",
														{
															key: t.name,
															class: "bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow",
														},
														[
															s("div", se, [
																s("div", ae, [
																	s("h3", le, g(t.title), 1),
																	s(
																		"span",
																		oe,
																		g(
																			t.studentGroup ||
																				"General",
																		),
																		1,
																	),
																]),
																o(l(c), {
																	name: "award",
																	class: "h-6 w-6 text-yellow-500 flex-shrink-0 ml-2",
																}),
															]),
															s("div", ie, [
																s("div", ne, [
																	o(l(c), {
																		name: "calendar",
																		class: "h-4 w-4 mr-2",
																	}),
																	w(" " + g(B(t.date)), 1),
																]),
																t.category
																	? (u(),
																		v("div", re, [
																			o(l(c), {
																				name: "tag",
																				class: "h-4 w-4 mr-2",
																			}),
																			w(
																				" " +
																					g(t.category),
																				1,
																			),
																		]))
																	: A("", !0),
															]),
															t.description
																? (u(),
																	v(
																		"p",
																		de,
																		g(t.description),
																		1,
																	))
																: A("", !0),
															s("div", ue, [
																t.file
																	? (u(),
																		z(
																			l(y),
																			{
																				key: 0,
																				size: "sm",
																				onClick: (k) =>
																					E(t),
																				variant: "solid",
																			},
																			{
																				prefix: n(() => [
																					o(l(c), {
																						name: "download",
																						class: "h-4 w-4",
																					}),
																				]),
																				default: n(() => [
																					e[12] ||
																						(e[12] = w(
																							" Download ",
																							-1,
																						)),
																				]),
																				_: 1,
																			},
																			8,
																			["onClick"],
																		))
																	: (u(),
																		v(
																			"span",
																			ce,
																			"No file attached",
																		)),
															]),
														],
													)
												),
											),
											128,
										)),
									]))
								: (u(),
									v("div", me, [
										s("div", fe, [
											o(l(c), {
												name: "award",
												class: "h-12 w-12 text-gray-400 mx-auto mb-4",
											}),
											e[13] ||
												(e[13] = s(
													"h3",
													{
														class: "text-lg font-medium text-gray-900 mb-2",
													},
													"No Certificates Found",
													-1,
												)),
											s(
												"p",
												ve,
												g(
													i.value || r.value || d.value
														? "No certificates match your current filters. Try adjusting your filters."
														: "You have not received any certificates yet.",
												),
												1,
											),
										]),
									])),
					])
				)
			);
		},
	};
var ye = R(pe, [["__scopeId", "data-v-4afeb624"]]);
export { ye as default };
