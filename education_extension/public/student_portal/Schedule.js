import { _ as d } from "./Calendar.js";
import { s as f, r as o, c as v, o as m, a as g, u as _, b as h, d as k } from "./index.js";
import "./index2.js";
const B = { class: "w-full h-full" },
	G = {
		__name: "Schedule",
		setup(w) {
			var s, u;
			const { getCurrentProgram: c, getStudentGroups: i } = f(),
				l = o((u = (s = c()) == null ? void 0 : s.value) == null ? void 0 : u.program),
				p = o(i().value),
				r = o([]),
				a = v({
					url: "education.education.api.get_course_schedule_for_student",
					params: { program_name: l.value, student_groups: p.value },
					onSuccess: (n) => {
						let t = [];
						(n.forEach((e) => {
							t.push({
								title: e.title,
								with: e.instructor,
								name: e.name,
								room: e.room,
								date: e.schedule_date,
								from_time: e.from_time.split(".")[0],
								to_time: e.to_time.split(".")[0],
								color: e.class_schedule_color,
							});
						}),
							(r.value = t));
					},
					auto: !0,
				});
			return (n, t) => (
				m(),
				g("div", B, [
					!_(a).loading && _(a).data
						? (m(), h(d, { key: 0, events: r.value }, null, 8, ["events"]))
						: k("", !0),
				])
			);
		},
	};
export { G as default };
