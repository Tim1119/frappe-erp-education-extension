import {
	_ as D,
	B as C,
	ab as h,
	ad as v,
	c as u,
	$ as k,
	X as y,
	a1 as B,
	a as t,
	C as l,
	F as w,
	r,
	o as c,
	n as x,
	w as n,
	t as U,
	W as F,
	y as p,
} from "./vendor.js";
const I = {
		name: "InsertImage",
		props: ["editor"],
		expose: ["openDialog"],
		data() {
			return { addVideoDialog: { url: "", file: null, show: !1 } };
		},
		components: { Button: C, Dialog: h, FileUploader: v },
		methods: {
			openDialog() {
				this.addVideoDialog.show = !0;
			},
			onVideoSelect(i) {
				let o = i.target.files[0];
				!o || (this.addVideoDialog.file = o);
			},
			addVideo(i) {
				(this.editor.chain().focus().insertContent(`<video src="${i}"></video>`).run(),
					this.reset());
			},
			reset() {
				this.addVideoDialog = this.$options.data().addVideoDialog;
			},
		},
	},
	N = { class: "flex items-center space-x-2" },
	S = n(" Remove "),
	A = ["src"],
	b = n(" Insert Video "),
	L = n("Cancel");
function P(i, o, R, j, e, a) {
	const s = r("Button"),
		V = r("FileUploader"),
		g = r("Dialog");
	return (
		c(),
		u(
			w,
			null,
			[
				k(i.$slots, "default", y(B({ onClick: a.openDialog }))),
				t(
					g,
					{
						options: { title: "Add Video" },
						modelValue: e.addVideoDialog.show,
						"onUpdate:modelValue": o[2] || (o[2] = (d) => (e.addVideoDialog.show = d)),
						onAfterLeave: a.reset,
					},
					{
						"body-content": l(() => [
							t(
								V,
								{
									"file-types": "video/*",
									onSuccess:
										o[0] ||
										(o[0] = (d) => (e.addVideoDialog.url = d.file_url)),
								},
								{
									default: l(
										({
											file: d,
											progress: f,
											uploading: _,
											openFileSelector: m,
										}) => [
											x("div", N, [
												t(
													s,
													{ onClick: m },
													{
														default: l(() => [
															n(
																U(
																	_
																		? `Uploading ${f}%`
																		: e.addVideoDialog.url
																			? "Change Video"
																			: "Upload Video",
																),
																1,
															),
														]),
														_: 2,
													},
													1032,
													["onClick"],
												),
												e.addVideoDialog.url
													? (c(),
														F(
															s,
															{
																key: 0,
																onClick: () => {
																	((e.addVideoDialog.url = null),
																		(e.addVideoDialog.file =
																			null));
																},
															},
															{ default: l(() => [S]), _: 2 },
															1032,
															["onClick"],
														))
													: p("", !0),
											]),
										],
									),
									_: 1,
								},
							),
							e.addVideoDialog.url
								? (c(),
									u(
										"video",
										{
											key: 0,
											src: e.addVideoDialog.url,
											class: "mt-2 w-full rounded-lg",
											type: "video/mp4",
											controls: "",
										},
										null,
										8,
										A,
									))
								: p("", !0),
						]),
						actions: l(() => [
							t(
								s,
								{
									appearance: "primary",
									onClick:
										o[1] || (o[1] = (d) => a.addVideo(e.addVideoDialog.url)),
								},
								{ default: l(() => [b]), _: 1 },
							),
							t(s, { onClick: a.reset }, { default: l(() => [L]), _: 1 }, 8, [
								"onClick",
							]),
						]),
						_: 1,
					},
					8,
					["modelValue", "onAfterLeave"],
				),
			],
			64,
		)
	);
}
var E = D(I, [["render", P]]);
export { E as default };
