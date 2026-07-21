var g = (o, e, l) =>
	new Promise((p, s) => {
		var t = (i) => {
				try {
					a(l.next(i));
				} catch (d) {
					s(d);
				}
			},
			r = (i) => {
				try {
					a(l.throw(i));
				} catch (d) {
					s(d);
				}
			},
			a = (i) => (i.done ? p(i.value) : Promise.resolve(i.value).then(t, r));
		a((l = l.apply(o, e)).next());
	});
import {
	E as D,
	o as c,
	a as _,
	e as F,
	M as y,
	N as k,
	O as w,
	h as C,
	x as S,
	m,
	f as u,
	w as n,
	K as f,
	t as N,
	b as U,
	d as v,
	F as E,
} from "./index.js";
class O {
	constructor() {
		((this.listeners = {}), (this.failed = !1));
	}
	on(e, l) {
		((this.listeners[e] = this.listeners[e] || []), this.listeners[e].push(l));
	}
	trigger(e, l) {
		(this.listeners[e] || []).forEach((s) => {
			s.call(this, l);
		});
	}
	upload(e, l) {
		return new Promise((p, s) => {
			let t = new XMLHttpRequest();
			(t.upload.addEventListener("loadstart", () => {
				this.trigger("start");
			}),
				t.upload.addEventListener("progress", (i) => {
					i.lengthComputable &&
						this.trigger("progress", { uploaded: i.loaded, total: i.total });
				}),
				t.upload.addEventListener("load", () => {
					this.trigger("finish");
				}),
				t.addEventListener("error", () => {
					(this.trigger("error"), s());
				}),
				(t.onreadystatechange = () => {
					if (t.readyState == XMLHttpRequest.DONE) {
						let i;
						if (t.status === 200) {
							let d = null;
							try {
								d = JSON.parse(t.responseText);
							} catch (V) {
								d = t.responseText;
							}
							let h = d.message || d;
							p(h);
						} else if (t.status === 403) i = JSON.parse(t.responseText);
						else {
							this.failed = !0;
							try {
								i = JSON.parse(t.responseText);
							} catch (d) {}
						}
						(i && i.exc && console.error(JSON.parse(i.exc)[0]), s(i));
					}
				}));
			const r = l.upload_endpoint || "/api/method/upload_file";
			(t.open("POST", r, !0),
				t.setRequestHeader("Accept", "application/json"),
				window.csrf_token &&
					window.csrf_token !== "{{ csrf_token }}" &&
					t.setRequestHeader("X-Frappe-CSRF-Token", window.csrf_token));
			let a = new FormData();
			(e && a.append("file", e, e.name),
				a.append("is_private", l.private ? "1" : "0"),
				a.append("folder", l.folder || "Home"),
				l.file_url && a.append("file_url", l.file_url),
				l.doctype &&
					l.docname &&
					(a.append("doctype", l.doctype),
					a.append("docname", l.docname),
					l.fieldname && a.append("fieldname", l.fieldname)),
				l.method && a.append("method", l.method),
				l.type && a.append("type", l.type),
				t.send(a));
		});
	}
}
const A = {
		name: "FileUploader",
		props: ["fileTypes", "uploadArgs", "validateFile"],
		data() {
			return {
				uploader: null,
				uploading: !1,
				uploaded: 0,
				error: null,
				message: "",
				total: 0,
				file: null,
				finishedUploading: !1,
			};
		},
		computed: {
			progress() {
				let o = Math.floor((this.uploaded / this.total) * 100);
				return isNaN(o) ? 0 : o;
			},
			success() {
				return this.finishedUploading && !this.error;
			},
		},
		methods: {
			openFileSelector() {
				this.$refs.input.click();
			},
			onFileAdd(o) {
				return g(this, null, function* () {
					if (
						((this.error = null),
						(this.file = o.target.files[0]),
						this.file && this.validateFile)
					)
						try {
							let e = yield this.validateFile(this.file);
							e && (this.error = e);
						} catch (e) {
							this.error = e;
						}
					this.error || this.uploadFile(this.file);
				});
			},
			uploadFile(o) {
				return g(this, null, function* () {
					((this.error = null),
						(this.uploaded = 0),
						(this.total = 0),
						(this.uploader = new O()),
						this.uploader.on("start", () => {
							this.uploading = !0;
						}),
						this.uploader.on("progress", (e) => {
							((this.uploaded = e.uploaded), (this.total = e.total));
						}),
						this.uploader.on("error", () => {
							((this.uploading = !1), (this.error = "Error Uploading File"));
						}),
						this.uploader.on("finish", () => {
							((this.uploading = !1), (this.finishedUploading = !0));
						}),
						this.uploader
							.upload(o, this.uploadArgs || {})
							.then((e) => {
								this.$emit("success", e);
							})
							.catch((e) => {
								this.uploading = !1;
								let l = "Error Uploading File";
								(e != null && e._server_messages
									? (l = JSON.parse(JSON.parse(e._server_messages)[0]).message)
									: e != null &&
										e.exc &&
										(l = JSON.parse(e.exc)[0]
											.split(
												`
`,
											)
											.slice(-2, -1)[0]),
									(this.error = l),
									this.$emit("failure", e));
							}));
				});
			},
		},
	},
	T = ["accept"];
function L(o, e, l, p, s, t) {
	return (
		c(),
		_("div", null, [
			F(
				"input",
				{
					ref: "input",
					type: "file",
					accept: l.fileTypes,
					class: "hidden",
					onChange: e[0] || (e[0] = (...r) => t.onFileAdd && t.onFileAdd(...r)),
				},
				null,
				40,
				T,
			),
			y(
				o.$slots,
				"default",
				k(
					w({
						file: s.file,
						uploading: s.uploading,
						progress: t.progress,
						uploaded: s.uploaded,
						message: s.message,
						error: s.error,
						total: s.total,
						success: t.success,
						openFileSelector: t.openFileSelector,
					}),
				),
			),
		])
	);
}
var B = D(A, [["render", L]]);
const J = {
		name: "InsertImage",
		props: ["editor"],
		expose: ["openDialog"],
		data() {
			return { addVideoDialog: { url: "", file: null, show: !1 } };
		},
		components: { Button: C, Dialog: S, FileUploader: B },
		methods: {
			openDialog() {
				this.addVideoDialog.show = !0;
			},
			onVideoSelect(o) {
				let e = o.target.files[0];
				!e || (this.addVideoDialog.file = e);
			},
			addVideo(o) {
				(this.editor.chain().focus().insertContent(`<video src="${o}"></video>`).run(),
					this.reset());
			},
			reset() {
				this.addVideoDialog = this.$options.data().addVideoDialog;
			},
		},
	},
	R = { class: "flex items-center space-x-2" },
	H = ["src"];
function M(o, e, l, p, s, t) {
	const r = m("Button"),
		a = m("FileUploader"),
		i = m("Dialog");
	return (
		c(),
		_(
			E,
			null,
			[
				y(o.$slots, "default", k(w({ onClick: t.openDialog }))),
				u(
					i,
					{
						options: { title: "Add Video" },
						modelValue: s.addVideoDialog.show,
						"onUpdate:modelValue": e[2] || (e[2] = (d) => (s.addVideoDialog.show = d)),
						onAfterLeave: t.reset,
					},
					{
						"body-content": n(() => [
							u(
								a,
								{
									"file-types": "video/*",
									onSuccess:
										e[0] ||
										(e[0] = (d) => (s.addVideoDialog.url = d.file_url)),
								},
								{
									default: n(
										({
											file: d,
											progress: h,
											uploading: V,
											openFileSelector: x,
										}) => [
											F("div", R, [
												u(
													r,
													{ onClick: x },
													{
														default: n(() => [
															f(
																N(
																	V
																		? `Uploading ${h}%`
																		: s.addVideoDialog.url
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
												s.addVideoDialog.url
													? (c(),
														U(
															r,
															{
																key: 0,
																onClick: () => {
																	((s.addVideoDialog.url = null),
																		(s.addVideoDialog.file =
																			null));
																},
															},
															{
																default: n(() => [
																	...(e[3] ||
																		(e[3] = [
																			f(" Remove ", -1),
																		])),
																]),
																_: 1,
															},
															8,
															["onClick"],
														))
													: v("", !0),
											]),
										],
									),
									_: 1,
								},
							),
							s.addVideoDialog.url
								? (c(),
									_(
										"video",
										{
											key: 0,
											src: s.addVideoDialog.url,
											class: "mt-2 w-full rounded-lg",
											type: "video/mp4",
											controls: "",
										},
										null,
										8,
										H,
									))
								: v("", !0),
						]),
						actions: n(() => [
							u(
								r,
								{
									variant: "solid",
									onClick:
										e[1] || (e[1] = (d) => t.addVideo(s.addVideoDialog.url)),
								},
								{
									default: n(() => [
										...(e[4] || (e[4] = [f(" Insert Video ", -1)])),
									]),
									_: 1,
								},
							),
							u(
								r,
								{ onClick: t.reset },
								{
									default: n(() => [...(e[5] || (e[5] = [f("Cancel", -1)]))]),
									_: 1,
								},
								8,
								["onClick"],
							),
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
var P = D(J, [["render", M]]);
export { P as default };
