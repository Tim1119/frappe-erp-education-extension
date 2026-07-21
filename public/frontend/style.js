var po = Object.defineProperty,
	yo = Object.defineProperties;
var go = Object.getOwnPropertyDescriptors;
var rr = Object.getOwnPropertySymbols;
var Cn = Object.prototype.hasOwnProperty,
	On = Object.prototype.propertyIsEnumerable;
var Sn = (e, t, r) =>
		t in e
			? po(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
			: (e[t] = r),
	_ = (e, t) => {
		for (var r in t || (t = {})) Cn.call(t, r) && Sn(e, r, t[r]);
		if (rr) for (var r of rr(t)) On.call(t, r) && Sn(e, r, t[r]);
		return e;
	},
	S = (e, t) => yo(e, go(t));
var In = (e, t) => {
	var r = {};
	for (var n in e) Cn.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
	if (e != null && rr) for (var n of rr(e)) t.indexOf(n) < 0 && On.call(e, n) && (r[n] = e[n]);
	return r;
};
var Je = (e, t, r) =>
	new Promise((n, a) => {
		var s = (l) => {
				try {
					i(r.next(l));
				} catch (u) {
					a(u);
				}
			},
			o = (l) => {
				try {
					i(r.throw(l));
				} catch (u) {
					a(u);
				}
			},
			i = (l) => (l.done ? n(l.value) : Promise.resolve(l.value).then(s, o));
		i((r = r.apply(e, t)).next());
	});
import {
	L as xr,
	f as m,
	M as oe,
	e as X,
	A as me,
	N as nr,
	O as Fr,
	P as bo,
	Q as St,
	R as An,
	S as It,
	U as At,
	V as Do,
	u as y,
	o as Y,
	W as De,
	X as En,
	Y as Et,
	Z as Nn,
	$ as ar,
	C as re,
	a as B,
	n as W,
	c as C,
	t as pe,
	y as ne,
	p as Me,
	F as ue,
	I as J,
	G as Ln,
	D as xn,
	K as Nt,
	a0 as sr,
	a1 as wo,
	w as Rr,
	a2 as Lt,
	T as Fn,
	r as Qe,
	a3 as $o,
	a4 as _o,
	a5 as Mo,
} from "./vendor.js";
var ko = Object.defineProperty,
	Yo = (e, t, r) =>
		t in e
			? ko(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
			: (e[t] = r),
	P = (e, t, r) => (Yo(e, typeof t != "symbol" ? t + "" : t, r), r),
	or =
		typeof globalThis != "undefined"
			? globalThis
			: typeof window != "undefined"
				? window
				: typeof global != "undefined"
					? global
					: typeof self != "undefined"
						? self
						: {};
function Rn(e) {
	return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var To = Object.prototype,
	Po = To.hasOwnProperty;
function Co(e, t) {
	return e != null && Po.call(e, t);
}
var Oo = Co,
	So = Array.isArray,
	Ce = So,
	Io = typeof or == "object" && or && or.Object === Object && or,
	Hn = Io,
	Ao = Hn,
	Eo = typeof self == "object" && self && self.Object === Object && self,
	No = Ao || Eo || Function("return this")(),
	Ae = No,
	Lo = Ae,
	xo = Lo.Symbol,
	ir = xo,
	Wn = ir,
	jn = Object.prototype,
	Fo = jn.hasOwnProperty,
	Ro = jn.toString,
	xt = Wn ? Wn.toStringTag : void 0;
function Ho(e) {
	var t = Fo.call(e, xt),
		r = e[xt];
	try {
		e[xt] = void 0;
		var n = !0;
	} catch (s) {}
	var a = Ro.call(e);
	return (n && (t ? (e[xt] = r) : delete e[xt]), a);
}
var Wo = Ho,
	jo = Object.prototype,
	Bo = jo.toString;
function zo(e) {
	return Bo.call(e);
}
var Uo = zo,
	Bn = ir,
	Vo = Wo,
	Ko = Uo,
	Go = "[object Null]",
	Zo = "[object Undefined]",
	zn = Bn ? Bn.toStringTag : void 0;
function qo(e) {
	return e == null ? (e === void 0 ? Zo : Go) : zn && zn in Object(e) ? Vo(e) : Ko(e);
}
var Ee = qo;
function Xo(e) {
	return e != null && typeof e == "object";
}
var Oe = Xo,
	Jo = Ee,
	Qo = Oe,
	ei = "[object Symbol]";
function ti(e) {
	return typeof e == "symbol" || (Qo(e) && Jo(e) == ei);
}
var Hr = ti,
	ri = Ce,
	ni = Hr,
	ai = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	si = /^\w*$/;
function oi(e, t) {
	if (ri(e)) return !1;
	var r = typeof e;
	return r == "number" || r == "symbol" || r == "boolean" || e == null || ni(e)
		? !0
		: si.test(e) || !ai.test(e) || (t != null && e in Object(t));
}
var Wr = oi;
function ii(e) {
	var t = typeof e;
	return e != null && (t == "object" || t == "function");
}
var He = ii,
	li = Ee,
	ui = He,
	ci = "[object AsyncFunction]",
	di = "[object Function]",
	fi = "[object GeneratorFunction]",
	vi = "[object Proxy]";
function hi(e) {
	if (!ui(e)) return !1;
	var t = li(e);
	return t == di || t == fi || t == ci || t == vi;
}
var et = hi,
	mi = Ae,
	pi = mi["__core-js_shared__"],
	yi = pi,
	jr = yi,
	Un = (function () {
		var e = /[^.]+$/.exec((jr && jr.keys && jr.keys.IE_PROTO) || "");
		return e ? "Symbol(src)_1." + e : "";
	})();
function gi(e) {
	return !!Un && Un in e;
}
var bi = gi,
	Di = Function.prototype,
	wi = Di.toString;
function $i(e) {
	if (e != null) {
		try {
			return wi.call(e);
		} catch (t) {}
		try {
			return e + "";
		} catch (t) {}
	}
	return "";
}
var Vn = $i,
	_i = et,
	Mi = bi,
	ki = He,
	Yi = Vn,
	Ti = /[\\^$.*+?()[\]{}|]/g,
	Pi = /^\[object .+?Constructor\]$/,
	Ci = Function.prototype,
	Oi = Object.prototype,
	Si = Ci.toString,
	Ii = Oi.hasOwnProperty,
	Ai = RegExp(
		"^" +
			Si.call(Ii)
				.replace(Ti, "\\$&")
				.replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
			"$",
	);
function Ei(e) {
	if (!ki(e) || Mi(e)) return !1;
	var t = _i(e) ? Ai : Pi;
	return t.test(Yi(e));
}
var Ni = Ei;
function Li(e, t) {
	return e == null ? void 0 : e[t];
}
var xi = Li,
	Fi = Ni,
	Ri = xi;
function Hi(e, t) {
	var r = Ri(e, t);
	return Fi(r) ? r : void 0;
}
var tt = Hi,
	Wi = tt,
	ji = Wi(Object, "create"),
	lr = ji,
	Kn = lr;
function Bi() {
	((this.__data__ = Kn ? Kn(null) : {}), (this.size = 0));
}
var zi = Bi;
function Ui(e) {
	var t = this.has(e) && delete this.__data__[e];
	return ((this.size -= t ? 1 : 0), t);
}
var Vi = Ui,
	Ki = lr,
	Gi = "__lodash_hash_undefined__",
	Zi = Object.prototype,
	qi = Zi.hasOwnProperty;
function Xi(e) {
	var t = this.__data__;
	if (Ki) {
		var r = t[e];
		return r === Gi ? void 0 : r;
	}
	return qi.call(t, e) ? t[e] : void 0;
}
var Ji = Xi,
	Qi = lr,
	el = Object.prototype,
	tl = el.hasOwnProperty;
function rl(e) {
	var t = this.__data__;
	return Qi ? t[e] !== void 0 : tl.call(t, e);
}
var nl = rl,
	al = lr,
	sl = "__lodash_hash_undefined__";
function ol(e, t) {
	var r = this.__data__;
	return ((this.size += this.has(e) ? 0 : 1), (r[e] = al && t === void 0 ? sl : t), this);
}
var il = ol,
	ll = zi,
	ul = Vi,
	cl = Ji,
	dl = nl,
	fl = il;
function ut(e) {
	var t = -1,
		r = e == null ? 0 : e.length;
	for (this.clear(); ++t < r;) {
		var n = e[t];
		this.set(n[0], n[1]);
	}
}
ut.prototype.clear = ll;
ut.prototype.delete = ul;
ut.prototype.get = cl;
ut.prototype.has = dl;
ut.prototype.set = fl;
var vl = ut;
function hl() {
	((this.__data__ = []), (this.size = 0));
}
var ml = hl;
function pl(e, t) {
	return e === t || (e !== e && t !== t);
}
var ct = pl,
	yl = ct;
function gl(e, t) {
	for (var r = e.length; r--;) if (yl(e[r][0], t)) return r;
	return -1;
}
var ur = gl,
	bl = ur,
	Dl = Array.prototype,
	wl = Dl.splice;
function $l(e) {
	var t = this.__data__,
		r = bl(t, e);
	if (r < 0) return !1;
	var n = t.length - 1;
	return (r == n ? t.pop() : wl.call(t, r, 1), --this.size, !0);
}
var _l = $l,
	Ml = ur;
function kl(e) {
	var t = this.__data__,
		r = Ml(t, e);
	return r < 0 ? void 0 : t[r][1];
}
var Yl = kl,
	Tl = ur;
function Pl(e) {
	return Tl(this.__data__, e) > -1;
}
var Cl = Pl,
	Ol = ur;
function Sl(e, t) {
	var r = this.__data__,
		n = Ol(r, e);
	return (n < 0 ? (++this.size, r.push([e, t])) : (r[n][1] = t), this);
}
var Il = Sl,
	Al = ml,
	El = _l,
	Nl = Yl,
	Ll = Cl,
	xl = Il;
function dt(e) {
	var t = -1,
		r = e == null ? 0 : e.length;
	for (this.clear(); ++t < r;) {
		var n = e[t];
		this.set(n[0], n[1]);
	}
}
dt.prototype.clear = Al;
dt.prototype.delete = El;
dt.prototype.get = Nl;
dt.prototype.has = Ll;
dt.prototype.set = xl;
var cr = dt,
	Fl = tt,
	Rl = Ae,
	Hl = Fl(Rl, "Map"),
	Br = Hl,
	Gn = vl,
	Wl = cr,
	jl = Br;
function Bl() {
	((this.size = 0),
		(this.__data__ = { hash: new Gn(), map: new (jl || Wl)(), string: new Gn() }));
}
var zl = Bl;
function Ul(e) {
	var t = typeof e;
	return t == "string" || t == "number" || t == "symbol" || t == "boolean"
		? e !== "__proto__"
		: e === null;
}
var Vl = Ul,
	Kl = Vl;
function Gl(e, t) {
	var r = e.__data__;
	return Kl(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
var dr = Gl,
	Zl = dr;
function ql(e) {
	var t = Zl(this, e).delete(e);
	return ((this.size -= t ? 1 : 0), t);
}
var Xl = ql,
	Jl = dr;
function Ql(e) {
	return Jl(this, e).get(e);
}
var eu = Ql,
	tu = dr;
function ru(e) {
	return tu(this, e).has(e);
}
var nu = ru,
	au = dr;
function su(e, t) {
	var r = au(this, e),
		n = r.size;
	return (r.set(e, t), (this.size += r.size == n ? 0 : 1), this);
}
var ou = su,
	iu = zl,
	lu = Xl,
	uu = eu,
	cu = nu,
	du = ou;
function ft(e) {
	var t = -1,
		r = e == null ? 0 : e.length;
	for (this.clear(); ++t < r;) {
		var n = e[t];
		this.set(n[0], n[1]);
	}
}
ft.prototype.clear = iu;
ft.prototype.delete = lu;
ft.prototype.get = uu;
ft.prototype.has = cu;
ft.prototype.set = du;
var zr = ft,
	Zn = zr,
	fu = "Expected a function";
function Ur(e, t) {
	if (typeof e != "function" || (t != null && typeof t != "function")) throw new TypeError(fu);
	var r = function () {
		var n = arguments,
			a = t ? t.apply(this, n) : n[0],
			s = r.cache;
		if (s.has(a)) return s.get(a);
		var o = e.apply(this, n);
		return ((r.cache = s.set(a, o) || s), o);
	};
	return ((r.cache = new (Ur.Cache || Zn)()), r);
}
Ur.Cache = Zn;
var vu = Ur,
	hu = vu,
	mu = 500;
function pu(e) {
	var t = hu(e, function (n) {
			return (r.size === mu && r.clear(), n);
		}),
		r = t.cache;
	return t;
}
var yu = pu,
	gu = yu,
	bu =
		/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
	Du = /\\(\\)?/g,
	wu = gu(function (e) {
		var t = [];
		return (
			e.charCodeAt(0) === 46 && t.push(""),
			e.replace(bu, function (r, n, a, s) {
				t.push(a ? s.replace(Du, "$1") : n || r);
			}),
			t
		);
	}),
	$u = wu;
function _u(e, t) {
	for (var r = -1, n = e == null ? 0 : e.length, a = Array(n); ++r < n;) a[r] = t(e[r], r, e);
	return a;
}
var Mu = _u,
	qn = ir,
	ku = Mu,
	Yu = Ce,
	Tu = Hr,
	Pu = 1 / 0,
	Xn = qn ? qn.prototype : void 0,
	Jn = Xn ? Xn.toString : void 0;
function Qn(e) {
	if (typeof e == "string") return e;
	if (Yu(e)) return ku(e, Qn) + "";
	if (Tu(e)) return Jn ? Jn.call(e) : "";
	var t = e + "";
	return t == "0" && 1 / e == -Pu ? "-0" : t;
}
var Cu = Qn,
	Ou = Cu;
function Su(e) {
	return e == null ? "" : Ou(e);
}
var Iu = Su,
	Au = Ce,
	Eu = Wr,
	Nu = $u,
	Lu = Iu;
function xu(e, t) {
	return Au(e) ? e : Eu(e, t) ? [e] : Nu(Lu(e));
}
var ea = xu,
	Fu = Ee,
	Ru = Oe,
	Hu = "[object Arguments]";
function Wu(e) {
	return Ru(e) && Fu(e) == Hu;
}
var ju = Wu,
	ta = ju,
	Bu = Oe,
	ra = Object.prototype,
	zu = ra.hasOwnProperty,
	Uu = ra.propertyIsEnumerable,
	Vu = ta(
		(function () {
			return arguments;
		})(),
	)
		? ta
		: function (e) {
				return Bu(e) && zu.call(e, "callee") && !Uu.call(e, "callee");
			},
	Vr = Vu,
	Ku = 9007199254740991,
	Gu = /^(?:0|[1-9]\d*)$/;
function Zu(e, t) {
	var r = typeof e;
	return (
		(t = t == null ? Ku : t),
		!!t && (r == "number" || (r != "symbol" && Gu.test(e))) && e > -1 && e % 1 == 0 && e < t
	);
}
var Kr = Zu,
	qu = 9007199254740991;
function Xu(e) {
	return typeof e == "number" && e > -1 && e % 1 == 0 && e <= qu;
}
var Gr = Xu,
	Ju = Hr,
	Qu = 1 / 0;
function ec(e) {
	if (typeof e == "string" || Ju(e)) return e;
	var t = e + "";
	return t == "0" && 1 / e == -Qu ? "-0" : t;
}
var fr = ec,
	tc = ea,
	rc = Vr,
	nc = Ce,
	ac = Kr,
	sc = Gr,
	oc = fr;
function ic(e, t, r) {
	t = tc(t, e);
	for (var n = -1, a = t.length, s = !1; ++n < a;) {
		var o = oc(t[n]);
		if (!(s = e != null && r(e, o))) break;
		e = e[o];
	}
	return s || ++n != a
		? s
		: ((a = e == null ? 0 : e.length), !!a && sc(a) && ac(o, a) && (nc(e) || rc(e)));
}
var na = ic,
	lc = Oo,
	uc = na;
function cc(e, t) {
	return e != null && uc(e, t, lc);
}
var aa = cc,
	dc = Ee,
	fc = Oe,
	vc = "[object Date]";
function hc(e) {
	return fc(e) && dc(e) == vc;
}
var mc = hc;
function pc(e) {
	return function (t) {
		return e(t);
	};
}
var sa = pc,
	Ft = {},
	yc = {
		get exports() {
			return Ft;
		},
		set exports(e) {
			Ft = e;
		},
	};
(function (e, t) {
	var r = Hn,
		n = t && !t.nodeType && t,
		a = n && !0 && e && !e.nodeType && e,
		s = a && a.exports === n,
		o = s && r.process,
		i = (function () {
			try {
				var l = a && a.require && a.require("util").types;
				return l || (o && o.binding && o.binding("util"));
			} catch (u) {}
		})();
	e.exports = i;
})(yc, Ft);
var gc = mc,
	bc = sa,
	oa = Ft,
	ia = oa && oa.isDate,
	Dc = ia ? bc(ia) : gc,
	wc = Dc,
	$c = Ee,
	_c = Ce,
	Mc = Oe,
	kc = "[object String]";
function Yc(e) {
	return typeof e == "string" || (!_c(e) && Mc(e) && $c(e) == kc);
}
var Ne = Yc;
function Tc(e, t) {
	for (var r = -1, n = e == null ? 0 : e.length; ++r < n;) if (t(e[r], r, e)) return !0;
	return !1;
}
var la = Tc,
	Pc = cr;
function Cc() {
	((this.__data__ = new Pc()), (this.size = 0));
}
var Oc = Cc;
function Sc(e) {
	var t = this.__data__,
		r = t.delete(e);
	return ((this.size = t.size), r);
}
var Ic = Sc;
function Ac(e) {
	return this.__data__.get(e);
}
var Ec = Ac;
function Nc(e) {
	return this.__data__.has(e);
}
var Lc = Nc,
	xc = cr,
	Fc = Br,
	Rc = zr,
	Hc = 200;
function Wc(e, t) {
	var r = this.__data__;
	if (r instanceof xc) {
		var n = r.__data__;
		if (!Fc || n.length < Hc - 1) return (n.push([e, t]), (this.size = ++r.size), this);
		r = this.__data__ = new Rc(n);
	}
	return (r.set(e, t), (this.size = r.size), this);
}
var jc = Wc,
	Bc = cr,
	zc = Oc,
	Uc = Ic,
	Vc = Ec,
	Kc = Lc,
	Gc = jc;
function vt(e) {
	var t = (this.__data__ = new Bc(e));
	this.size = t.size;
}
vt.prototype.clear = zc;
vt.prototype.delete = Uc;
vt.prototype.get = Vc;
vt.prototype.has = Kc;
vt.prototype.set = Gc;
var Zr = vt,
	Zc = "__lodash_hash_undefined__";
function qc(e) {
	return (this.__data__.set(e, Zc), this);
}
var Xc = qc;
function Jc(e) {
	return this.__data__.has(e);
}
var Qc = Jc,
	ed = zr,
	td = Xc,
	rd = Qc;
function vr(e) {
	var t = -1,
		r = e == null ? 0 : e.length;
	for (this.__data__ = new ed(); ++t < r;) this.add(e[t]);
}
vr.prototype.add = vr.prototype.push = td;
vr.prototype.has = rd;
var nd = vr;
function ad(e, t) {
	return e.has(t);
}
var sd = ad,
	od = nd,
	id = la,
	ld = sd,
	ud = 1,
	cd = 2;
function dd(e, t, r, n, a, s) {
	var o = r & ud,
		i = e.length,
		l = t.length;
	if (i != l && !(o && l > i)) return !1;
	var u = s.get(e),
		d = s.get(t);
	if (u && d) return u == t && d == e;
	var f = -1,
		v = !0,
		h = r & cd ? new od() : void 0;
	for (s.set(e, t), s.set(t, e); ++f < i;) {
		var D = e[f],
			T = t[f];
		if (n) var M = o ? n(T, D, f, t, e, s) : n(D, T, f, e, t, s);
		if (M !== void 0) {
			if (M) continue;
			v = !1;
			break;
		}
		if (h) {
			if (
				!id(t, function (b, L) {
					if (!ld(h, L) && (D === b || a(D, b, r, n, s))) return h.push(L);
				})
			) {
				v = !1;
				break;
			}
		} else if (!(D === T || a(D, T, r, n, s))) {
			v = !1;
			break;
		}
	}
	return (s.delete(e), s.delete(t), v);
}
var ua = dd,
	fd = Ae,
	vd = fd.Uint8Array,
	ca = vd;
function hd(e) {
	var t = -1,
		r = Array(e.size);
	return (
		e.forEach(function (n, a) {
			r[++t] = [a, n];
		}),
		r
	);
}
var md = hd;
function pd(e) {
	var t = -1,
		r = Array(e.size);
	return (
		e.forEach(function (n) {
			r[++t] = n;
		}),
		r
	);
}
var yd = pd,
	da = ir,
	fa = ca,
	gd = ct,
	bd = ua,
	Dd = md,
	wd = yd,
	$d = 1,
	_d = 2,
	Md = "[object Boolean]",
	kd = "[object Date]",
	Yd = "[object Error]",
	Td = "[object Map]",
	Pd = "[object Number]",
	Cd = "[object RegExp]",
	Od = "[object Set]",
	Sd = "[object String]",
	Id = "[object Symbol]",
	Ad = "[object ArrayBuffer]",
	Ed = "[object DataView]",
	va = da ? da.prototype : void 0,
	qr = va ? va.valueOf : void 0;
function Nd(e, t, r, n, a, s, o) {
	switch (r) {
		case Ed:
			if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
			((e = e.buffer), (t = t.buffer));
		case Ad:
			return !(e.byteLength != t.byteLength || !s(new fa(e), new fa(t)));
		case Md:
		case kd:
		case Pd:
			return gd(+e, +t);
		case Yd:
			return e.name == t.name && e.message == t.message;
		case Cd:
		case Sd:
			return e == t + "";
		case Td:
			var i = Dd;
		case Od:
			var l = n & $d;
			if ((i || (i = wd), e.size != t.size && !l)) return !1;
			var u = o.get(e);
			if (u) return u == t;
			((n |= _d), o.set(e, t));
			var d = bd(i(e), i(t), n, a, s, o);
			return (o.delete(e), d);
		case Id:
			if (qr) return qr.call(e) == qr.call(t);
	}
	return !1;
}
var Ld = Nd;
function xd(e, t) {
	for (var r = -1, n = t.length, a = e.length; ++r < n;) e[a + r] = t[r];
	return e;
}
var Fd = xd,
	Rd = Fd,
	Hd = Ce;
function Wd(e, t, r) {
	var n = t(e);
	return Hd(e) ? n : Rd(n, r(e));
}
var jd = Wd;
function Bd(e, t) {
	for (var r = -1, n = e == null ? 0 : e.length, a = 0, s = []; ++r < n;) {
		var o = e[r];
		t(o, r, e) && (s[a++] = o);
	}
	return s;
}
var zd = Bd;
function Ud() {
	return [];
}
var Vd = Ud,
	Kd = zd,
	Gd = Vd,
	Zd = Object.prototype,
	qd = Zd.propertyIsEnumerable,
	ha = Object.getOwnPropertySymbols,
	Xd = ha
		? function (e) {
				return e == null
					? []
					: ((e = Object(e)),
						Kd(ha(e), function (t) {
							return qd.call(e, t);
						}));
			}
		: Gd,
	Jd = Xd;
function Qd(e, t) {
	for (var r = -1, n = Array(e); ++r < e;) n[r] = t(r);
	return n;
}
var ef = Qd,
	ht = {},
	tf = {
		get exports() {
			return ht;
		},
		set exports(e) {
			ht = e;
		},
	};
function rf() {
	return !1;
}
var nf = rf;
(function (e, t) {
	var r = Ae,
		n = nf,
		a = t && !t.nodeType && t,
		s = a && !0 && e && !e.nodeType && e,
		o = s && s.exports === a,
		i = o ? r.Buffer : void 0,
		l = i ? i.isBuffer : void 0,
		u = l || n;
	e.exports = u;
})(tf, ht);
var af = Ee,
	sf = Gr,
	of = Oe,
	lf = "[object Arguments]",
	uf = "[object Array]",
	cf = "[object Boolean]",
	df = "[object Date]",
	ff = "[object Error]",
	vf = "[object Function]",
	hf = "[object Map]",
	mf = "[object Number]",
	pf = "[object Object]",
	yf = "[object RegExp]",
	gf = "[object Set]",
	bf = "[object String]",
	Df = "[object WeakMap]",
	wf = "[object ArrayBuffer]",
	$f = "[object DataView]",
	_f = "[object Float32Array]",
	Mf = "[object Float64Array]",
	kf = "[object Int8Array]",
	Yf = "[object Int16Array]",
	Tf = "[object Int32Array]",
	Pf = "[object Uint8Array]",
	Cf = "[object Uint8ClampedArray]",
	Of = "[object Uint16Array]",
	Sf = "[object Uint32Array]",
	G = {};
G[_f] = G[Mf] = G[kf] = G[Yf] = G[Tf] = G[Pf] = G[Cf] = G[Of] = G[Sf] = !0;
G[lf] =
	G[uf] =
	G[wf] =
	G[cf] =
	G[$f] =
	G[df] =
	G[ff] =
	G[vf] =
	G[hf] =
	G[mf] =
	G[pf] =
	G[yf] =
	G[gf] =
	G[bf] =
	G[Df] =
		!1;
function If(e) {
	return of(e) && sf(e.length) && !!G[af(e)];
}
var Af = If,
	Ef = Af,
	Nf = sa,
	ma = Ft,
	pa = ma && ma.isTypedArray,
	Lf = pa ? Nf(pa) : Ef,
	Xr = Lf,
	xf = ef,
	Ff = Vr,
	Rf = Ce,
	Hf = ht,
	Wf = Kr,
	jf = Xr,
	Bf = Object.prototype,
	zf = Bf.hasOwnProperty;
function Uf(e, t) {
	var r = Rf(e),
		n = !r && Ff(e),
		a = !r && !n && Hf(e),
		s = !r && !n && !a && jf(e),
		o = r || n || a || s,
		i = o ? xf(e.length, String) : [],
		l = i.length;
	for (var u in e)
		(t || zf.call(e, u)) &&
			!(
				o &&
				(u == "length" ||
					(a && (u == "offset" || u == "parent")) ||
					(s && (u == "buffer" || u == "byteLength" || u == "byteOffset")) ||
					Wf(u, l))
			) &&
			i.push(u);
	return i;
}
var ya = Uf,
	Vf = Object.prototype;
function Kf(e) {
	var t = e && e.constructor,
		r = (typeof t == "function" && t.prototype) || Vf;
	return e === r;
}
var Jr = Kf;
function Gf(e, t) {
	return function (r) {
		return e(t(r));
	};
}
var ga = Gf,
	Zf = ga,
	qf = Zf(Object.keys, Object),
	Xf = qf,
	Jf = Jr,
	Qf = Xf,
	ev = Object.prototype,
	tv = ev.hasOwnProperty;
function rv(e) {
	if (!Jf(e)) return Qf(e);
	var t = [];
	for (var r in Object(e)) tv.call(e, r) && r != "constructor" && t.push(r);
	return t;
}
var nv = rv,
	av = et,
	sv = Gr;
function ov(e) {
	return e != null && sv(e.length) && !av(e);
}
var Rt = ov,
	iv = ya,
	lv = nv,
	uv = Rt;
function cv(e) {
	return uv(e) ? iv(e) : lv(e);
}
var Qr = cv,
	dv = jd,
	fv = Jd,
	vv = Qr;
function hv(e) {
	return dv(e, vv, fv);
}
var mv = hv,
	ba = mv,
	pv = 1,
	yv = Object.prototype,
	gv = yv.hasOwnProperty;
function bv(e, t, r, n, a, s) {
	var o = r & pv,
		i = ba(e),
		l = i.length,
		u = ba(t),
		d = u.length;
	if (l != d && !o) return !1;
	for (var f = l; f--;) {
		var v = i[f];
		if (!(o ? v in t : gv.call(t, v))) return !1;
	}
	var h = s.get(e),
		D = s.get(t);
	if (h && D) return h == t && D == e;
	var T = !0;
	(s.set(e, t), s.set(t, e));
	for (var M = o; ++f < l;) {
		v = i[f];
		var b = e[v],
			L = t[v];
		if (n) var z = o ? n(L, b, v, t, e, s) : n(b, L, v, e, t, s);
		if (!(z === void 0 ? b === L || a(b, L, r, n, s) : z)) {
			T = !1;
			break;
		}
		M || (M = v == "constructor");
	}
	if (T && !M) {
		var E = e.constructor,
			N = t.constructor;
		E != N &&
			"constructor" in e &&
			"constructor" in t &&
			!(
				typeof E == "function" &&
				E instanceof E &&
				typeof N == "function" &&
				N instanceof N
			) &&
			(T = !1);
	}
	return (s.delete(e), s.delete(t), T);
}
var Dv = bv,
	wv = tt,
	$v = Ae,
	_v = wv($v, "DataView"),
	Mv = _v,
	kv = tt,
	Yv = Ae,
	Tv = kv(Yv, "Promise"),
	Pv = Tv,
	Cv = tt,
	Ov = Ae,
	Sv = Cv(Ov, "Set"),
	Iv = Sv,
	Av = tt,
	Ev = Ae,
	Nv = Av(Ev, "WeakMap"),
	Lv = Nv,
	en = Mv,
	tn = Br,
	rn = Pv,
	nn = Iv,
	an = Lv,
	Da = Ee,
	mt = Vn,
	wa = "[object Map]",
	xv = "[object Object]",
	$a = "[object Promise]",
	_a = "[object Set]",
	Ma = "[object WeakMap]",
	ka = "[object DataView]",
	Fv = mt(en),
	Rv = mt(tn),
	Hv = mt(rn),
	Wv = mt(nn),
	jv = mt(an),
	rt = Da;
((en && rt(new en(new ArrayBuffer(1))) != ka) ||
	(tn && rt(new tn()) != wa) ||
	(rn && rt(rn.resolve()) != $a) ||
	(nn && rt(new nn()) != _a) ||
	(an && rt(new an()) != Ma)) &&
	(rt = function (e) {
		var t = Da(e),
			r = t == xv ? e.constructor : void 0,
			n = r ? mt(r) : "";
		if (n)
			switch (n) {
				case Fv:
					return ka;
				case Rv:
					return wa;
				case Hv:
					return $a;
				case Wv:
					return _a;
				case jv:
					return Ma;
			}
		return t;
	});
var Bv = rt,
	sn = Zr,
	zv = ua,
	Uv = Ld,
	Vv = Dv,
	Ya = Bv,
	Ta = Ce,
	Pa = ht,
	Kv = Xr,
	Gv = 1,
	Ca = "[object Arguments]",
	Oa = "[object Array]",
	hr = "[object Object]",
	Zv = Object.prototype,
	Sa = Zv.hasOwnProperty;
function qv(e, t, r, n, a, s) {
	var o = Ta(e),
		i = Ta(t),
		l = o ? Oa : Ya(e),
		u = i ? Oa : Ya(t);
	((l = l == Ca ? hr : l), (u = u == Ca ? hr : u));
	var d = l == hr,
		f = u == hr,
		v = l == u;
	if (v && Pa(e)) {
		if (!Pa(t)) return !1;
		((o = !0), (d = !1));
	}
	if (v && !d)
		return (s || (s = new sn()), o || Kv(e) ? zv(e, t, r, n, a, s) : Uv(e, t, l, r, n, a, s));
	if (!(r & Gv)) {
		var h = d && Sa.call(e, "__wrapped__"),
			D = f && Sa.call(t, "__wrapped__");
		if (h || D) {
			var T = h ? e.value() : e,
				M = D ? t.value() : t;
			return (s || (s = new sn()), a(T, M, r, n, s));
		}
	}
	return v ? (s || (s = new sn()), Vv(e, t, r, n, a, s)) : !1;
}
var Xv = qv,
	Jv = Xv,
	Ia = Oe;
function Aa(e, t, r, n, a) {
	return e === t
		? !0
		: e == null || t == null || (!Ia(e) && !Ia(t))
			? e !== e && t !== t
			: Jv(e, t, r, n, Aa, a);
}
var Ea = Aa,
	Qv = Zr,
	eh = Ea,
	th = 1,
	rh = 2;
function nh(e, t, r, n) {
	var a = r.length,
		s = a,
		o = !n;
	if (e == null) return !s;
	for (e = Object(e); a--;) {
		var i = r[a];
		if (o && i[2] ? i[1] !== e[i[0]] : !(i[0] in e)) return !1;
	}
	for (; ++a < s;) {
		i = r[a];
		var l = i[0],
			u = e[l],
			d = i[1];
		if (o && i[2]) {
			if (u === void 0 && !(l in e)) return !1;
		} else {
			var f = new Qv();
			if (n) var v = n(u, d, l, e, t, f);
			if (!(v === void 0 ? eh(d, u, th | rh, n, f) : v)) return !1;
		}
	}
	return !0;
}
var ah = nh,
	sh = He;
function oh(e) {
	return e === e && !sh(e);
}
var Na = oh,
	ih = Na,
	lh = Qr;
function uh(e) {
	for (var t = lh(e), r = t.length; r--;) {
		var n = t[r],
			a = e[n];
		t[r] = [n, a, ih(a)];
	}
	return t;
}
var ch = uh;
function dh(e, t) {
	return function (r) {
		return r == null ? !1 : r[e] === t && (t !== void 0 || e in Object(r));
	};
}
var La = dh,
	fh = ah,
	vh = ch,
	hh = La;
function mh(e) {
	var t = vh(e);
	return t.length == 1 && t[0][2]
		? hh(t[0][0], t[0][1])
		: function (r) {
				return r === e || fh(r, e, t);
			};
}
var ph = mh,
	yh = ea,
	gh = fr;
function bh(e, t) {
	t = yh(t, e);
	for (var r = 0, n = t.length; e != null && r < n;) e = e[gh(t[r++])];
	return r && r == n ? e : void 0;
}
var xa = bh,
	Dh = xa;
function wh(e, t, r) {
	var n = e == null ? void 0 : Dh(e, t);
	return n === void 0 ? r : n;
}
var nt = wh;
function $h(e, t) {
	return e != null && t in Object(e);
}
var _h = $h,
	Mh = _h,
	kh = na;
function Yh(e, t) {
	return e != null && kh(e, t, Mh);
}
var Th = Yh,
	Ph = Ea,
	Ch = nt,
	Oh = Th,
	Sh = Wr,
	Ih = Na,
	Ah = La,
	Eh = fr,
	Nh = 1,
	Lh = 2;
function xh(e, t) {
	return Sh(e) && Ih(t)
		? Ah(Eh(e), t)
		: function (r) {
				var n = Ch(r, e);
				return n === void 0 && n === t ? Oh(r, e) : Ph(t, n, Nh | Lh);
			};
}
var Fh = xh;
function Rh(e) {
	return e;
}
var on = Rh;
function Hh(e) {
	return function (t) {
		return t == null ? void 0 : t[e];
	};
}
var Wh = Hh,
	jh = xa;
function Bh(e) {
	return function (t) {
		return jh(t, e);
	};
}
var zh = Bh,
	Uh = Wh,
	Vh = zh,
	Kh = Wr,
	Gh = fr;
function Zh(e) {
	return Kh(e) ? Uh(Gh(e)) : Vh(e);
}
var qh = Zh,
	Xh = ph,
	Jh = Fh,
	Qh = on,
	em = Ce,
	tm = qh;
function rm(e) {
	return typeof e == "function"
		? e
		: e == null
			? Qh
			: typeof e == "object"
				? em(e)
					? Jh(e[0], e[1])
					: Xh(e)
				: tm(e);
}
var Fa = rm;
function nm(e) {
	return function (t, r, n) {
		for (var a = -1, s = Object(t), o = n(t), i = o.length; i--;) {
			var l = o[e ? i : ++a];
			if (r(s[l], l, s) === !1) break;
		}
		return t;
	};
}
var am = nm,
	sm = am,
	om = sm(),
	Ra = om,
	im = Ra,
	lm = Qr;
function um(e, t) {
	return e && im(e, t, lm);
}
var Ha = um,
	cm = Rt;
function dm(e, t) {
	return function (r, n) {
		if (r == null) return r;
		if (!cm(r)) return e(r, n);
		for (
			var a = r.length, s = t ? a : -1, o = Object(r);
			(t ? s-- : ++s < a) && n(o[s], s, o) !== !1;
		);
		return r;
	};
}
var fm = dm,
	vm = Ha,
	hm = fm,
	mm = hm(vm),
	pm = mm,
	ym = pm;
function gm(e, t) {
	var r;
	return (
		ym(e, function (n, a, s) {
			return ((r = t(n, a, s)), !r);
		}),
		!!r
	);
}
var bm = gm,
	Dm = ct,
	wm = Rt,
	$m = Kr,
	_m = He;
function Mm(e, t, r) {
	if (!_m(r)) return !1;
	var n = typeof t;
	return (n == "number" ? wm(r) && $m(t, r.length) : n == "string" && t in r) ? Dm(r[t], e) : !1;
}
var ln = Mm,
	km = la,
	Ym = Fa,
	Tm = bm,
	Pm = Ce,
	Cm = ln;
function Om(e, t, r) {
	var n = Pm(e) ? km : Tm;
	return (r && Cm(e, t, r) && (t = void 0), n(e, Ym(t)));
}
var Sm = Om,
	Im = Ee,
	Am = Oe,
	Em = "[object Boolean]";
function Nm(e) {
	return e === !0 || e === !1 || (Am(e) && Im(e) == Em);
}
var Lm = Nm,
	xm = Ee,
	Fm = Oe,
	Rm = "[object Number]";
function Hm(e) {
	return typeof e == "number" || (Fm(e) && xm(e) == Rm);
}
var Se = Hm,
	Wm = tt,
	jm = (function () {
		try {
			var e = Wm(Object, "defineProperty");
			return (e({}, "", {}), e);
		} catch (t) {}
	})(),
	Wa = jm,
	ja = Wa;
function Bm(e, t, r) {
	t == "__proto__" && ja
		? ja(e, t, { configurable: !0, enumerable: !0, value: r, writable: !0 })
		: (e[t] = r);
}
var mr = Bm,
	zm = mr,
	Um = ct,
	Vm = Object.prototype,
	Km = Vm.hasOwnProperty;
function Gm(e, t, r) {
	var n = e[t];
	(!(Km.call(e, t) && Um(n, r)) || (r === void 0 && !(t in e))) && zm(e, t, r);
}
var Zm = Gm,
	qm = mr,
	Xm = Ha,
	Jm = Fa;
function Qm(e, t) {
	var r = {};
	return (
		(t = Jm(t)),
		Xm(e, function (n, a, s) {
			qm(r, a, t(n, a, s));
		}),
		r
	);
}
var ep = Qm;
function tp(e, t, r) {
	switch (r.length) {
		case 0:
			return e.call(t);
		case 1:
			return e.call(t, r[0]);
		case 2:
			return e.call(t, r[0], r[1]);
		case 3:
			return e.call(t, r[0], r[1], r[2]);
	}
	return e.apply(t, r);
}
var Ba = tp,
	rp = Ba,
	za = Math.max;
function np(e, t, r) {
	return (
		(t = za(t === void 0 ? e.length - 1 : t, 0)),
		function () {
			for (var n = arguments, a = -1, s = za(n.length - t, 0), o = Array(s); ++a < s;)
				o[a] = n[t + a];
			a = -1;
			for (var i = Array(t + 1); ++a < t;) i[a] = n[a];
			return ((i[t] = r(o)), rp(e, this, i));
		}
	);
}
var ap = np;
function sp(e) {
	return function () {
		return e;
	};
}
var op = sp,
	ip = op,
	Ua = Wa,
	lp = on,
	up = Ua
		? function (e, t) {
				return Ua(e, "toString", {
					configurable: !0,
					enumerable: !1,
					value: ip(t),
					writable: !0,
				});
			}
		: lp,
	cp = up,
	dp = 800,
	fp = 16,
	vp = Date.now;
function hp(e) {
	var t = 0,
		r = 0;
	return function () {
		var n = vp(),
			a = fp - (n - r);
		if (((r = n), a > 0)) {
			if (++t >= dp) return arguments[0];
		} else t = 0;
		return e.apply(void 0, arguments);
	};
}
var mp = hp,
	pp = cp,
	yp = mp,
	gp = yp(pp),
	bp = gp,
	Dp = on,
	wp = ap,
	$p = bp;
function _p(e, t) {
	return $p(wp(e, t, Dp), e + "");
}
var un = _p;
function Mp(e) {
	var t = [];
	if (e != null) for (var r in Object(e)) t.push(r);
	return t;
}
var kp = Mp,
	Yp = He,
	Tp = Jr,
	Pp = kp,
	Cp = Object.prototype,
	Op = Cp.hasOwnProperty;
function Sp(e) {
	if (!Yp(e)) return Pp(e);
	var t = Tp(e),
		r = [];
	for (var n in e) (n == "constructor" && (t || !Op.call(e, n))) || r.push(n);
	return r;
}
var Ip = Sp,
	Ap = ya,
	Ep = Ip,
	Np = Rt;
function Lp(e) {
	return Np(e) ? Ap(e, !0) : Ep(e);
}
var cn = Lp,
	xp = un,
	Fp = ct,
	Rp = ln,
	Hp = cn,
	Va = Object.prototype,
	Wp = Va.hasOwnProperty,
	jp = xp(function (e, t) {
		e = Object(e);
		var r = -1,
			n = t.length,
			a = n > 2 ? t[2] : void 0;
		for (a && Rp(t[0], t[1], a) && (n = 1); ++r < n;)
			for (var s = t[r], o = Hp(s), i = -1, l = o.length; ++i < l;) {
				var u = o[i],
					d = e[u];
				(d === void 0 || (Fp(d, Va[u]) && !Wp.call(e, u))) && (e[u] = s[u]);
			}
		return e;
	}),
	Ka = jp,
	Bp = mr,
	zp = ct;
function Up(e, t, r) {
	((r !== void 0 && !zp(e[t], r)) || (r === void 0 && !(t in e))) && Bp(e, t, r);
}
var Ga = Up,
	pr = {},
	Vp = {
		get exports() {
			return pr;
		},
		set exports(e) {
			pr = e;
		},
	};
(function (e, t) {
	var r = Ae,
		n = t && !t.nodeType && t,
		a = n && !0 && e && !e.nodeType && e,
		s = a && a.exports === n,
		o = s ? r.Buffer : void 0,
		i = o ? o.allocUnsafe : void 0;
	function l(u, d) {
		if (d) return u.slice();
		var f = u.length,
			v = i ? i(f) : new u.constructor(f);
		return (u.copy(v), v);
	}
	e.exports = l;
})(Vp, pr);
var Za = ca;
function Kp(e) {
	var t = new e.constructor(e.byteLength);
	return (new Za(t).set(new Za(e)), t);
}
var Gp = Kp,
	Zp = Gp;
function qp(e, t) {
	var r = t ? Zp(e.buffer) : e.buffer;
	return new e.constructor(r, e.byteOffset, e.length);
}
var Xp = qp;
function Jp(e, t) {
	var r = -1,
		n = e.length;
	for (t || (t = Array(n)); ++r < n;) t[r] = e[r];
	return t;
}
var Qp = Jp,
	ey = He,
	qa = Object.create,
	ty = (function () {
		function e() {}
		return function (t) {
			if (!ey(t)) return {};
			if (qa) return qa(t);
			e.prototype = t;
			var r = new e();
			return ((e.prototype = void 0), r);
		};
	})(),
	ry = ty,
	ny = ga,
	ay = ny(Object.getPrototypeOf, Object),
	Xa = ay,
	sy = ry,
	oy = Xa,
	iy = Jr;
function ly(e) {
	return typeof e.constructor == "function" && !iy(e) ? sy(oy(e)) : {};
}
var uy = ly,
	cy = Rt,
	dy = Oe;
function fy(e) {
	return dy(e) && cy(e);
}
var vy = fy,
	hy = Ee,
	my = Xa,
	py = Oe,
	yy = "[object Object]",
	gy = Function.prototype,
	by = Object.prototype,
	Ja = gy.toString,
	Dy = by.hasOwnProperty,
	wy = Ja.call(Object);
function $y(e) {
	if (!py(e) || hy(e) != yy) return !1;
	var t = my(e);
	if (t === null) return !0;
	var r = Dy.call(t, "constructor") && t.constructor;
	return typeof r == "function" && r instanceof r && Ja.call(r) == wy;
}
var _y = $y;
function My(e, t) {
	if (!(t === "constructor" && typeof e[t] == "function") && t != "__proto__") return e[t];
}
var Qa = My,
	ky = Zm,
	Yy = mr;
function Ty(e, t, r, n) {
	var a = !r;
	r || (r = {});
	for (var s = -1, o = t.length; ++s < o;) {
		var i = t[s],
			l = n ? n(r[i], e[i], i, r, e) : void 0;
		(l === void 0 && (l = e[i]), a ? Yy(r, i, l) : ky(r, i, l));
	}
	return r;
}
var Py = Ty,
	Cy = Py,
	Oy = cn;
function Sy(e) {
	return Cy(e, Oy(e));
}
var Iy = Sy,
	es = Ga,
	Ay = pr,
	Ey = Xp,
	Ny = Qp,
	Ly = uy,
	ts = Vr,
	rs = Ce,
	xy = vy,
	Fy = ht,
	Ry = et,
	Hy = He,
	Wy = _y,
	jy = Xr,
	ns = Qa,
	By = Iy;
function zy(e, t, r, n, a, s, o) {
	var i = ns(e, r),
		l = ns(t, r),
		u = o.get(l);
	if (u) {
		es(e, r, u);
		return;
	}
	var d = s ? s(i, l, r + "", e, t, o) : void 0,
		f = d === void 0;
	if (f) {
		var v = rs(l),
			h = !v && Fy(l),
			D = !v && !h && jy(l);
		((d = l),
			v || h || D
				? rs(i)
					? (d = i)
					: xy(i)
						? (d = Ny(i))
						: h
							? ((f = !1), (d = Ay(l, !0)))
							: D
								? ((f = !1), (d = Ey(l, !0)))
								: (d = [])
				: Wy(l) || ts(l)
					? ((d = i), ts(i) ? (d = By(i)) : (!Hy(i) || Ry(i)) && (d = Ly(l)))
					: (f = !1));
	}
	(f && (o.set(l, d), a(d, l, n, s, o), o.delete(l)), es(e, r, d));
}
var Uy = zy,
	Vy = Zr,
	Ky = Ga,
	Gy = Ra,
	Zy = Uy,
	qy = He,
	Xy = cn,
	Jy = Qa;
function as(e, t, r, n, a) {
	e !== t &&
		Gy(
			t,
			function (s, o) {
				if ((a || (a = new Vy()), qy(s))) Zy(e, t, o, r, as, n, a);
				else {
					var i = n ? n(Jy(e, o), s, o + "", e, t, a) : void 0;
					(i === void 0 && (i = s), Ky(e, o, i));
				}
			},
			Xy,
		);
}
var ss = as,
	Qy = ss,
	os = He;
function is(e, t, r, n, a, s) {
	return (os(e) && os(t) && (s.set(t, e), Qy(e, t, void 0, is, s), s.delete(t)), e);
}
var eg = is,
	tg = un,
	rg = ln;
function ng(e) {
	return tg(function (t, r) {
		var n = -1,
			a = r.length,
			s = a > 1 ? r[a - 1] : void 0,
			o = a > 2 ? r[2] : void 0;
		for (
			s = e.length > 3 && typeof s == "function" ? (a--, s) : void 0,
				o && rg(r[0], r[1], o) && ((s = a < 3 ? void 0 : s), (a = 1)),
				t = Object(t);
			++n < a;
		) {
			var i = r[n];
			i && e(t, i, n, s);
		}
		return t;
	});
}
var ag = ng,
	sg = ss,
	og = ag,
	ig = og(function (e, t, r, n) {
		sg(e, t, r, n);
	}),
	lg = ig,
	ug = Ba,
	cg = un,
	dg = eg,
	fg = lg,
	vg = cg(function (e) {
		return (e.push(void 0, dg), ug(fg, void 0, e));
	}),
	Ht = vg;
function hg(e) {
	return e && e.length ? e[0] : void 0;
}
var ls = hg;
function mg(e) {
	var t = e == null ? 0 : e.length;
	return t ? e[t - 1] : void 0;
}
var pt = mg;
const pg = (e) => Object.prototype.toString.call(e).slice(8, -1),
	yt = (e) => wc(e) && !isNaN(e.getTime()),
	We = (e) => pg(e) === "Object",
	us = aa,
	cs = (e, t) => Sm(t, (r) => aa(e, r)),
	U = (e, t, r = "0") => {
		for (e = e != null ? String(e) : "", t = t || 2; e.length < t;) e = `${r}${e}`;
		return e;
	},
	ke = (e) => Array.isArray(e),
	je = (e) => ke(e) && e.length > 0,
	yr = (e) => {
		var t;
		return e == null
			? null
			: document && Ne(e)
				? document.querySelector(e)
				: (t = e.$el) != null
					? t
					: e;
	},
	Ue = (e, t, r, n = void 0) => {
		e.removeEventListener(t, r, n);
	},
	Ve = (e, t, r, n = void 0) => (e.addEventListener(t, r, n), () => Ue(e, t, r, n)),
	gr = (e, t) => !!e && !!t && (e === t || e.contains(t)),
	br = (e, t) => {
		(e.key === " " || e.key === "Enter") && (t(e), e.preventDefault());
	},
	ds = (e, ...t) => {
		const r = {};
		let n;
		for (n in e) t.includes(n) || (r[n] = e[n]);
		return r;
	},
	fs = (e, t) => {
		const r = {};
		return (
			t.forEach((n) => {
				n in e && (r[n] = e[n]);
			}),
			r
		);
	};
function yg(e, t, r) {
	return Math.min(Math.max(e, t), r);
}
var Dr = {},
	gg = {
		get exports() {
			return Dr;
		},
		set exports(e) {
			Dr = e;
		},
	};
(function (e, t) {
	(Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = r));
	function r(n) {
		if (n === null || n === !0 || n === !1) return NaN;
		var a = Number(n);
		return isNaN(a) ? a : a < 0 ? Math.ceil(a) : Math.floor(a);
	}
	e.exports = t.default;
})(gg, Dr);
const bg = Rn(Dr);
var wr = {},
	Dg = {
		get exports() {
			return wr;
		},
		set exports(e) {
			wr = e;
		},
	};
(function (e, t) {
	(Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = r));
	function r(n) {
		var a = new Date(
			Date.UTC(
				n.getFullYear(),
				n.getMonth(),
				n.getDate(),
				n.getHours(),
				n.getMinutes(),
				n.getSeconds(),
				n.getMilliseconds(),
			),
		);
		return (a.setUTCFullYear(n.getFullYear()), n.getTime() - a.getTime());
	}
	e.exports = t.default;
})(Dg, wr);
const vs = Rn(wr);
function wg(e, t) {
	var r = kg(t);
	return r.formatToParts ? _g(r, e) : Mg(r, e);
}
var $g = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 };
function _g(e, t) {
	try {
		for (var r = e.formatToParts(t), n = [], a = 0; a < r.length; a++) {
			var s = $g[r[a].type];
			s >= 0 && (n[s] = parseInt(r[a].value, 10));
		}
		return n;
	} catch (o) {
		if (o instanceof RangeError) return [NaN];
		throw o;
	}
}
function Mg(e, t) {
	var r = e.format(t).replace(/\u200E/g, ""),
		n = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(r);
	return [n[3], n[1], n[2], n[4], n[5], n[6]];
}
var dn = {};
function kg(e) {
	if (!dn[e]) {
		var t = new Intl.DateTimeFormat("en-US", {
				hour12: !1,
				timeZone: "America/New_York",
				year: "numeric",
				month: "numeric",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}).format(new Date("2014-06-25T04:00:00.123Z")),
			r =
				t === "06/25/2014, 00:00:00" ||
				t ===
					"\u200E06\u200E/\u200E25\u200E/\u200E2014\u200E \u200E00\u200E:\u200E00\u200E:\u200E00";
		dn[e] = r
			? new Intl.DateTimeFormat("en-US", {
					hour12: !1,
					timeZone: e,
					year: "numeric",
					month: "numeric",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})
			: new Intl.DateTimeFormat("en-US", {
					hourCycle: "h23",
					timeZone: e,
					year: "numeric",
					month: "numeric",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				});
	}
	return dn[e];
}
function hs(e, t, r, n, a, s, o) {
	var i = new Date(0);
	return (i.setUTCFullYear(e, t, r), i.setUTCHours(n, a, s, o), i);
}
var ms = 36e5,
	Yg = 6e4,
	fn = {
		timezone: /([Z+-].*)$/,
		timezoneZ: /^(Z)$/,
		timezoneHH: /^([+-]\d{2})$/,
		timezoneHHMM: /^([+-]\d{2}):?(\d{2})$/,
	};
function Tg(e, t, r) {
	var n, a;
	if (!e || ((n = fn.timezoneZ.exec(e)), n)) return 0;
	var s;
	if (((n = fn.timezoneHH.exec(e)), n))
		return ((s = parseInt(n[1], 10)), ps(s) ? -(s * ms) : NaN);
	if (((n = fn.timezoneHHMM.exec(e)), n)) {
		s = parseInt(n[1], 10);
		var o = parseInt(n[2], 10);
		return ps(s, o) ? ((a = Math.abs(s) * ms + o * Yg), s > 0 ? -a : a) : NaN;
	}
	if (Og(e)) {
		t = new Date(t || Date.now());
		var i = r ? t : Pg(t),
			l = vn(i, e),
			u = r ? l : Cg(t, l, e);
		return -u;
	}
	return NaN;
}
function Pg(e) {
	return hs(
		e.getFullYear(),
		e.getMonth(),
		e.getDate(),
		e.getHours(),
		e.getMinutes(),
		e.getSeconds(),
		e.getMilliseconds(),
	);
}
function vn(e, t) {
	var r = wg(e, t),
		n = hs(r[0], r[1] - 1, r[2], r[3] % 24, r[4], r[5], 0).getTime(),
		a = e.getTime(),
		s = a % 1e3;
	return ((a -= s >= 0 ? s : 1e3 + s), n - a);
}
function Cg(e, t, r) {
	var n = e.getTime(),
		a = n - t,
		s = vn(new Date(a), r);
	if (t === s) return t;
	a -= s - t;
	var o = vn(new Date(a), r);
	return s === o ? s : Math.max(s, o);
}
function ps(e, t) {
	return -23 <= e && e <= 23 && (t == null || (0 <= t && t <= 59));
}
var ys = {};
function Og(e) {
	if (ys[e]) return !0;
	try {
		return (new Intl.DateTimeFormat(void 0, { timeZone: e }), (ys[e] = !0), !0);
	} catch (t) {
		return !1;
	}
}
var Sg = /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/;
const Ig = Sg;
var hn = 36e5,
	gs = 6e4,
	Ag = 2,
	ye = {
		dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
		datePattern: /^([0-9W+-]+)(.*)/,
		plainTime: /:/,
		YY: /^(\d{2})$/,
		YYY: [/^([+-]\d{2})$/, /^([+-]\d{3})$/, /^([+-]\d{4})$/],
		YYYY: /^(\d{4})/,
		YYYYY: [/^([+-]\d{4})/, /^([+-]\d{5})/, /^([+-]\d{6})/],
		MM: /^-(\d{2})$/,
		DDD: /^-?(\d{3})$/,
		MMDD: /^-?(\d{2})-?(\d{2})$/,
		Www: /^-?W(\d{2})$/,
		WwwD: /^-?W(\d{2})-?(\d{1})$/,
		HH: /^(\d{2}([.,]\d*)?)$/,
		HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
		HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
		timeZone: Ig,
	};
function Eg(e, t) {
	if (arguments.length < 1)
		throw new TypeError("1 argument required, but only " + arguments.length + " present");
	if (e === null) return new Date(NaN);
	var r = t || {},
		n = r.additionalDigits == null ? Ag : bg(r.additionalDigits);
	if (n !== 2 && n !== 1 && n !== 0) throw new RangeError("additionalDigits must be 0, 1 or 2");
	if (
		e instanceof Date ||
		(typeof e == "object" && Object.prototype.toString.call(e) === "[object Date]")
	)
		return new Date(e.getTime());
	if (typeof e == "number" || Object.prototype.toString.call(e) === "[object Number]")
		return new Date(e);
	if (!(typeof e == "string" || Object.prototype.toString.call(e) === "[object String]"))
		return new Date(NaN);
	var a = Ng(e),
		s = Lg(a.date, n),
		o = s.year,
		i = s.restDateString,
		l = xg(i, o);
	if (isNaN(l)) return new Date(NaN);
	if (l) {
		var u = l.getTime(),
			d = 0,
			f;
		if (a.time && ((d = Fg(a.time)), isNaN(d))) return new Date(NaN);
		if (a.timeZone || r.timeZone) {
			if (((f = Tg(a.timeZone || r.timeZone, new Date(u + d))), isNaN(f)))
				return new Date(NaN);
		} else ((f = vs(new Date(u + d))), (f = vs(new Date(u + d + f))));
		return new Date(u + d + f);
	} else return new Date(NaN);
}
function Ng(e) {
	var t = {},
		r = ye.dateTimePattern.exec(e),
		n;
	if (
		(r
			? ((t.date = r[1]), (n = r[3]))
			: ((r = ye.datePattern.exec(e)),
				r ? ((t.date = r[1]), (n = r[2])) : ((t.date = null), (n = e))),
		n)
	) {
		var a = ye.timeZone.exec(n);
		a ? ((t.time = n.replace(a[1], "")), (t.timeZone = a[1].trim())) : (t.time = n);
	}
	return t;
}
function Lg(e, t) {
	var r = ye.YYY[t],
		n = ye.YYYYY[t],
		a;
	if (((a = ye.YYYY.exec(e) || n.exec(e)), a)) {
		var s = a[1];
		return { year: parseInt(s, 10), restDateString: e.slice(s.length) };
	}
	if (((a = ye.YY.exec(e) || r.exec(e)), a)) {
		var o = a[1];
		return { year: parseInt(o, 10) * 100, restDateString: e.slice(o.length) };
	}
	return { year: null };
}
function xg(e, t) {
	if (t === null) return null;
	var r, n, a, s;
	if (e.length === 0) return ((n = new Date(0)), n.setUTCFullYear(t), n);
	if (((r = ye.MM.exec(e)), r))
		return (
			(n = new Date(0)),
			(a = parseInt(r[1], 10) - 1),
			ws(t, a) ? (n.setUTCFullYear(t, a), n) : new Date(NaN)
		);
	if (((r = ye.DDD.exec(e)), r)) {
		n = new Date(0);
		var o = parseInt(r[1], 10);
		return Wg(t, o) ? (n.setUTCFullYear(t, 0, o), n) : new Date(NaN);
	}
	if (((r = ye.MMDD.exec(e)), r)) {
		((n = new Date(0)), (a = parseInt(r[1], 10) - 1));
		var i = parseInt(r[2], 10);
		return ws(t, a, i) ? (n.setUTCFullYear(t, a, i), n) : new Date(NaN);
	}
	if (((r = ye.Www.exec(e)), r))
		return ((s = parseInt(r[1], 10) - 1), $s(t, s) ? bs(t, s) : new Date(NaN));
	if (((r = ye.WwwD.exec(e)), r)) {
		s = parseInt(r[1], 10) - 1;
		var l = parseInt(r[2], 10) - 1;
		return $s(t, s, l) ? bs(t, s, l) : new Date(NaN);
	}
	return null;
}
function Fg(e) {
	var t, r, n;
	if (((t = ye.HH.exec(e)), t))
		return ((r = parseFloat(t[1].replace(",", "."))), mn(r) ? (r % 24) * hn : NaN);
	if (((t = ye.HHMM.exec(e)), t))
		return (
			(r = parseInt(t[1], 10)),
			(n = parseFloat(t[2].replace(",", "."))),
			mn(r, n) ? (r % 24) * hn + n * gs : NaN
		);
	if (((t = ye.HHMMSS.exec(e)), t)) {
		((r = parseInt(t[1], 10)), (n = parseInt(t[2], 10)));
		var a = parseFloat(t[3].replace(",", "."));
		return mn(r, n, a) ? (r % 24) * hn + n * gs + a * 1e3 : NaN;
	}
	return null;
}
function bs(e, t, r) {
	((t = t || 0), (r = r || 0));
	var n = new Date(0);
	n.setUTCFullYear(e, 0, 4);
	var a = n.getUTCDay() || 7,
		s = t * 7 + r + 1 - a;
	return (n.setUTCDate(n.getUTCDate() + s), n);
}
var Rg = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	Hg = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Ds(e) {
	return e % 400 == 0 || (e % 4 == 0 && e % 100 != 0);
}
function ws(e, t, r) {
	if (t < 0 || t > 11) return !1;
	if (r != null) {
		if (r < 1) return !1;
		var n = Ds(e);
		if ((n && r > Hg[t]) || (!n && r > Rg[t])) return !1;
	}
	return !0;
}
function Wg(e, t) {
	if (t < 1) return !1;
	var r = Ds(e);
	return !((r && t > 366) || (!r && t > 365));
}
function $s(e, t, r) {
	return !(t < 0 || t > 52 || (r != null && (r < 0 || r > 6)));
}
function mn(e, t, r) {
	return !(
		(e != null && (e < 0 || e >= 25)) ||
		(t != null && (t < 0 || t >= 60)) ||
		(r != null && (r < 0 || r >= 60))
	);
}
function ce(e, t) {
	if (t.length < e)
		throw new TypeError(
			e + " argument" + (e > 1 ? "s" : "") + " required, but only " + t.length + " present",
		);
}
function $r(e) {
	return (
		typeof Symbol == "function" && typeof Symbol.iterator == "symbol"
			? ($r = function (r) {
					return typeof r;
				})
			: ($r = function (r) {
					return r &&
						typeof Symbol == "function" &&
						r.constructor === Symbol &&
						r !== Symbol.prototype
						? "symbol"
						: typeof r;
				}),
		$r(e)
	);
}
function Be(e) {
	ce(1, arguments);
	var t = Object.prototype.toString.call(e);
	return e instanceof Date || ($r(e) === "object" && t === "[object Date]")
		? new Date(e.getTime())
		: typeof e == "number" || t === "[object Number]"
			? new Date(e)
			: ((typeof e == "string" || t === "[object String]") &&
					typeof console != "undefined" &&
					(console.warn(
						"Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments",
					),
					console.warn(new Error().stack)),
				new Date(NaN));
}
function gt(e) {
	if (e === null || e === !0 || e === !1) return NaN;
	var t = Number(e);
	return isNaN(t) ? t : t < 0 ? Math.ceil(t) : Math.floor(t);
}
var jg = {};
function pn() {
	return jg;
}
function at(e, t) {
	var r, n, a, s, o, i, l, u;
	ce(1, arguments);
	var d = pn(),
		f = gt(
			(r =
				(n =
					(a =
						(s = t == null ? void 0 : t.weekStartsOn) !== null && s !== void 0
							? s
							: t == null ||
								  (o = t.locale) === null ||
								  o === void 0 ||
								  (i = o.options) === null ||
								  i === void 0
								? void 0
								: i.weekStartsOn) !== null && a !== void 0
						? a
						: d.weekStartsOn) !== null && n !== void 0
					? n
					: (l = d.locale) === null ||
						  l === void 0 ||
						  (u = l.options) === null ||
						  u === void 0
						? void 0
						: u.weekStartsOn) !== null && r !== void 0
				? r
				: 0,
		);
	if (!(f >= 0 && f <= 6))
		throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
	var v = Be(e),
		h = v.getDay(),
		D = (h < f ? 7 : 0) + h - f;
	return (v.setDate(v.getDate() - D), v.setHours(0, 0, 0, 0), v);
}
function _s(e) {
	var t = new Date(
		Date.UTC(
			e.getFullYear(),
			e.getMonth(),
			e.getDate(),
			e.getHours(),
			e.getMinutes(),
			e.getSeconds(),
			e.getMilliseconds(),
		),
	);
	return (t.setUTCFullYear(e.getFullYear()), e.getTime() - t.getTime());
}
var Bg = 6048e5;
function zg(e, t, r) {
	ce(2, arguments);
	var n = at(e, r),
		a = at(t, r),
		s = n.getTime() - _s(n),
		o = a.getTime() - _s(a);
	return Math.round((s - o) / Bg);
}
function Ug(e) {
	ce(1, arguments);
	var t = Be(e),
		r = t.getMonth();
	return (t.setFullYear(t.getFullYear(), r + 1, 0), t.setHours(0, 0, 0, 0), t);
}
function Vg(e) {
	ce(1, arguments);
	var t = Be(e);
	return (t.setDate(1), t.setHours(0, 0, 0, 0), t);
}
function Kg(e, t) {
	return (ce(1, arguments), zg(Ug(e), Vg(e), t) + 1);
}
function Gg(e, t) {
	var r, n, a, s, o, i, l, u;
	ce(1, arguments);
	var d = Be(e),
		f = d.getFullYear(),
		v = pn(),
		h = gt(
			(r =
				(n =
					(a =
						(s = t == null ? void 0 : t.firstWeekContainsDate) !== null && s !== void 0
							? s
							: t == null ||
								  (o = t.locale) === null ||
								  o === void 0 ||
								  (i = o.options) === null ||
								  i === void 0
								? void 0
								: i.firstWeekContainsDate) !== null && a !== void 0
						? a
						: v.firstWeekContainsDate) !== null && n !== void 0
					? n
					: (l = v.locale) === null ||
						  l === void 0 ||
						  (u = l.options) === null ||
						  u === void 0
						? void 0
						: u.firstWeekContainsDate) !== null && r !== void 0
				? r
				: 1,
		);
	if (!(h >= 1 && h <= 7))
		throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
	var D = new Date(0);
	(D.setFullYear(f + 1, 0, h), D.setHours(0, 0, 0, 0));
	var T = at(D, t),
		M = new Date(0);
	(M.setFullYear(f, 0, h), M.setHours(0, 0, 0, 0));
	var b = at(M, t);
	return d.getTime() >= T.getTime() ? f + 1 : d.getTime() >= b.getTime() ? f : f - 1;
}
function Zg(e, t) {
	var r, n, a, s, o, i, l, u;
	ce(1, arguments);
	var d = pn(),
		f = gt(
			(r =
				(n =
					(a =
						(s = t == null ? void 0 : t.firstWeekContainsDate) !== null && s !== void 0
							? s
							: t == null ||
								  (o = t.locale) === null ||
								  o === void 0 ||
								  (i = o.options) === null ||
								  i === void 0
								? void 0
								: i.firstWeekContainsDate) !== null && a !== void 0
						? a
						: d.firstWeekContainsDate) !== null && n !== void 0
					? n
					: (l = d.locale) === null ||
						  l === void 0 ||
						  (u = l.options) === null ||
						  u === void 0
						? void 0
						: u.firstWeekContainsDate) !== null && r !== void 0
				? r
				: 1,
		),
		v = Gg(e, t),
		h = new Date(0);
	(h.setFullYear(v, 0, f), h.setHours(0, 0, 0, 0));
	var D = at(h, t);
	return D;
}
var qg = 6048e5;
function Xg(e, t) {
	ce(1, arguments);
	var r = Be(e),
		n = at(r, t).getTime() - Zg(r, t).getTime();
	return Math.round(n / qg) + 1;
}
function _r(e) {
	return (ce(1, arguments), at(e, { weekStartsOn: 1 }));
}
function Jg(e) {
	ce(1, arguments);
	var t = Be(e),
		r = t.getFullYear(),
		n = new Date(0);
	(n.setFullYear(r + 1, 0, 4), n.setHours(0, 0, 0, 0));
	var a = _r(n),
		s = new Date(0);
	(s.setFullYear(r, 0, 4), s.setHours(0, 0, 0, 0));
	var o = _r(s);
	return t.getTime() >= a.getTime() ? r + 1 : t.getTime() >= o.getTime() ? r : r - 1;
}
function Qg(e) {
	ce(1, arguments);
	var t = Jg(e),
		r = new Date(0);
	(r.setFullYear(t, 0, 4), r.setHours(0, 0, 0, 0));
	var n = _r(r);
	return n;
}
var e1 = 6048e5;
function t1(e) {
	ce(1, arguments);
	var t = Be(e),
		r = _r(t).getTime() - Qg(t).getTime();
	return Math.round(r / e1) + 1;
}
function ge(e, t) {
	ce(2, arguments);
	var r = Be(e),
		n = gt(t);
	return isNaN(n) ? new Date(NaN) : (n && r.setDate(r.getDate() + n), r);
}
function Mr(e, t) {
	ce(2, arguments);
	var r = Be(e),
		n = gt(t);
	if (isNaN(n)) return new Date(NaN);
	if (!n) return r;
	var a = r.getDate(),
		s = new Date(r.getTime());
	s.setMonth(r.getMonth() + n + 1, 0);
	var o = s.getDate();
	return a >= o ? s : (r.setFullYear(s.getFullYear(), s.getMonth(), a), r);
}
function Ms(e, t) {
	ce(2, arguments);
	var r = gt(t);
	return Mr(e, r * 12);
}
const r1 = {
	daily: ["year", "month", "day"],
	weekly: ["year", "month", "week"],
	monthly: ["year", "month"],
};
function n1({ monthComps: e, prevMonthComps: t, nextMonthComps: r }, n) {
	const a = [],
		{
			firstDayOfWeek: s,
			firstWeekday: o,
			isoWeeknumbers: i,
			weeknumbers: l,
			numDays: u,
			numWeeks: d,
		} = e,
		f = o + (o < s ? de : 0) - s;
	let v = !0,
		h = !1,
		D = !1,
		T = 0;
	const M = new Intl.DateTimeFormat(n.id, {
		weekday: "long",
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	let b = t.numDays - f + 1,
		L = t.numDays - b + 1,
		z = Math.floor((b - 1) / de + 1),
		E = 1,
		N = t.numWeeks,
		Q = 1,
		x = t.month,
		H = t.year;
	const ee = new Date(),
		se = ee.getDate(),
		te = ee.getMonth() + 1,
		I = ee.getFullYear();
	for (let j = 1; j <= Z1; j++) {
		for (let q = 1, A = s; q <= de; q++, A += A === de ? 1 - de : 1) {
			v &&
				A === o &&
				((b = 1),
				(L = e.numDays),
				(z = Math.floor((b - 1) / de + 1)),
				(E = Math.floor((u - b) / de + 1)),
				(N = 1),
				(Q = d),
				(x = e.month),
				(H = e.year),
				(v = !1),
				(h = !0));
			const ae = n.getDateFromParams(H, x, b, 0, 0, 0, 0),
				fe = n.getDateFromParams(H, x, b, 12, 0, 0, 0),
				be = n.getDateFromParams(H, x, b, 23, 59, 59, 999),
				ie = ae,
				$ = `${U(H, 4)}-${U(x, 2)}-${U(b, 2)}`,
				R = q,
				O = de - q,
				ve = l[j - 1],
				Z = i[j - 1],
				Te = b === se && x === te && H === I,
				Pe = h && b === 1,
				he = h && b === u,
				xe = j === 1,
				Fe = j === d,
				Ze = q === 1,
				qe = q === de,
				Ie = js(H, x, b);
			(a.push({
				locale: n,
				id: $,
				position: ++T,
				label: b.toString(),
				ariaLabel: M.format(new Date(H, x - 1, b)),
				day: b,
				dayFromEnd: L,
				weekday: A,
				weekdayPosition: R,
				weekdayPositionFromEnd: O,
				weekdayOrdinal: z,
				weekdayOrdinalFromEnd: E,
				week: N,
				weekFromEnd: Q,
				weekPosition: j,
				weeknumber: ve,
				isoWeeknumber: Z,
				month: x,
				year: H,
				date: ie,
				startDate: ae,
				endDate: be,
				noonDate: fe,
				dayIndex: Ie,
				isToday: Te,
				isFirstDay: Pe,
				isLastDay: he,
				isDisabled: !h,
				isFocusable: !h,
				isFocused: !1,
				inMonth: h,
				inPrevMonth: v,
				inNextMonth: D,
				onTop: xe,
				onBottom: Fe,
				onLeft: Ze,
				onRight: qe,
				classes: [
					`id-${$}`,
					`day-${b}`,
					`day-from-end-${L}`,
					`weekday-${A}`,
					`weekday-position-${R}`,
					`weekday-ordinal-${z}`,
					`weekday-ordinal-from-end-${E}`,
					`week-${N}`,
					`week-from-end-${Q}`,
					{
						"is-today": Te,
						"is-first-day": Pe,
						"is-last-day": he,
						"in-month": h,
						"in-prev-month": v,
						"in-next-month": D,
						"on-top": xe,
						"on-bottom": Fe,
						"on-left": Ze,
						"on-right": qe,
					},
				],
			}),
				h && he
					? ((h = !1),
						(D = !0),
						(b = 1),
						(L = u),
						(z = 1),
						(E = Math.floor((u - b) / de + 1)),
						(N = 1),
						(Q = r.numWeeks),
						(x = r.month),
						(H = r.year))
					: (b++,
						L--,
						(z = Math.floor((b - 1) / de + 1)),
						(E = Math.floor((u - b) / de + 1))));
		}
		(N++, Q--);
	}
	return a;
}
function a1(e, t, r, n) {
	const a = e.reduce(
		(s, o, i) => {
			const l = Math.floor(i / 7);
			let u = s[l];
			return (
				u ||
					((u = {
						id: `week-${l + 1}`,
						title: "",
						week: o.week,
						weekPosition: o.weekPosition,
						weeknumber: o.weeknumber,
						isoWeeknumber: o.isoWeeknumber,
						weeknumberDisplay: t ? o.weeknumber : r ? o.isoWeeknumber : void 0,
						days: [],
					}),
					(s[l] = u)),
				u.days.push(o),
				s
			);
		},
		Array(e.length / de),
	);
	return (
		a.forEach((s) => {
			const o = s.days[0],
				i = s.days[s.days.length - 1];
			o.month === i.month
				? (s.title = `${n.formatDate(o.date, "MMMM YYYY")}`)
				: o.year === i.year
					? (s.title = `${n.formatDate(o.date, "MMM")} - ${n.formatDate(i.date, "MMM YYYY")}`)
					: (s.title = `${n.formatDate(o.date, "MMM YYYY")} - ${n.formatDate(i.date, "MMM YYYY")}`);
		}),
		a
	);
}
function s1(e, t) {
	return e.days.map((r) => ({
		label: t.formatDate(r.date, t.masks.weekdays),
		weekday: r.weekday,
	}));
}
function o1(e, t) {
	return `${t}.${U(e, 2)}`;
}
function ks(e, t, r) {
	return fs(r.getDateParts(r.toDate(e)), r1[t]);
}
function Ys({ day: e, week: t, month: r, year: n }, a, s, o) {
	if (s === "daily" && e) {
		const i = new Date(n, r - 1, e),
			l = ge(i, a);
		return { day: l.getDate(), month: l.getMonth() + 1, year: l.getFullYear() };
	} else if (s === "weekly" && t) {
		const l = o.getMonthParts(r, n).firstDayOfMonth,
			u = ge(l, (t - 1 + a) * 7),
			d = o.getDateParts(u);
		return { week: d.week, month: d.month, year: d.year };
	} else {
		const i = new Date(n, r - 1, 1),
			l = Mr(i, a);
		return { month: l.getMonth() + 1, year: l.getFullYear() };
	}
}
function Le(e) {
	return e != null && e.month != null && e.year != null;
}
function yn(e, t) {
	return !Le(e) || !Le(t)
		? !1
		: ((e = e),
			(t = t),
			e.year !== t.year
				? e.year < t.year
				: e.month && t.month && e.month !== t.month
					? e.month < t.month
					: e.week && t.week && e.week !== t.week
						? e.week < t.week
						: e.day && t.day && e.day !== t.day
							? e.day < t.day
							: !1);
}
function kr(e, t) {
	return !Le(e) || !Le(t)
		? !1
		: ((e = e),
			(t = t),
			e.year !== t.year
				? e.year > t.year
				: e.month && t.month && e.month !== t.month
					? e.month > t.month
					: e.week && t.week && e.week !== t.week
						? e.week > t.week
						: e.day && t.day && e.day !== t.day
							? e.day > t.day
							: !1);
}
function i1(e, t, r) {
	return (e || !1) && !yn(e, t) && !kr(e, r);
}
function l1(e, t) {
	return (!e && t) || (e && !t)
		? !1
		: !e && !t
			? !0
			: ((e = e),
				(t = t),
				e.year === t.year && e.month === t.month && e.week === t.week && e.day === t.day);
}
function u1(e, t, r, n) {
	if (!Le(e) || !Le(t)) return [];
	const a = [];
	for (; !kr(e, t);) (a.push(e), (e = Ys(e, 1, r, n)));
	return a;
}
function Ts(e) {
	const { day: t, week: r, month: n, year: a } = e;
	let s = `${a}-${U(n, 2)}`;
	return (r && (s = `${s}-w${r}`), t && (s = `${s}-${U(t, 2)}`), s);
}
function c1(e, t) {
	const { month: r, year: n, showWeeknumbers: a, showIsoWeeknumbers: s } = e,
		o = new Date(n, r - 1, 15),
		i = t.getMonthParts(r, n),
		l = t.getPrevMonthParts(r, n),
		u = t.getNextMonthParts(r, n),
		d = n1({ monthComps: i, prevMonthComps: l, nextMonthComps: u }, t),
		f = a1(d, a, s, t),
		v = s1(f[0], t);
	return {
		id: Ts(e),
		month: r,
		year: n,
		monthTitle: t.formatDate(o, t.masks.title),
		shortMonthLabel: t.formatDate(o, "MMM"),
		monthLabel: t.formatDate(o, "MMMM"),
		shortYearLabel: n.toString().substring(2),
		yearLabel: n.toString(),
		monthComps: i,
		prevMonthComps: l,
		nextMonthComps: u,
		days: d,
		weeks: f,
		weekdays: v,
	};
}
function d1(e, t) {
	const { day: r, week: n, view: a, trimWeeks: s } = e,
		o = S(_(_({}, t), e), { title: "", viewDays: [], viewWeeks: [] });
	switch (a) {
		case "daily": {
			let i = o.days.find((u) => u.inMonth);
			r
				? (i = o.days.find((u) => u.day === r && u.inMonth) || i)
				: n && (i = o.days.find((u) => u.week === n && u.inMonth));
			const l = o.weeks[i.week - 1];
			((o.viewWeeks = [l]),
				(o.viewDays = [i]),
				(o.week = i.week),
				(o.weekTitle = l.title),
				(o.day = i.day),
				(o.dayTitle = i.ariaLabel),
				(o.title = o.dayTitle));
			break;
		}
		case "weekly": {
			o.week = n || 1;
			const i = o.weeks[o.week - 1];
			((o.viewWeeks = [i]),
				(o.viewDays = i.days),
				(o.weekTitle = i.title),
				(o.title = o.weekTitle));
			break;
		}
		default: {
			((o.title = o.monthTitle),
				(o.viewWeeks = o.weeks.slice(0, s ? o.monthComps.numWeeks : void 0)),
				(o.viewDays = o.days));
			break;
		}
	}
	return o;
}
class Ps {
	constructor(t, r, n) {
		(P(this, "keys", []),
			P(this, "store", {}),
			(this.size = t),
			(this.createKey = r),
			(this.createItem = n));
	}
	get(...t) {
		const r = this.createKey(...t);
		return this.store[r];
	}
	getOrSet(...t) {
		const r = this.createKey(...t);
		if (this.store[r]) return this.store[r];
		const n = this.createItem(...t);
		if (this.keys.length >= this.size) {
			const a = this.keys.shift();
			a != null && delete this.store[a];
		}
		return (this.keys.push(r), (this.store[r] = n), n);
	}
}
class bt {
	constructor(t, r = new Yr()) {
		(P(this, "order"),
			P(this, "locale"),
			P(this, "start", null),
			P(this, "end", null),
			P(this, "repeat", null));
		var n;
		this.locale = r;
		const { start: a, end: s, span: o, order: i, repeat: l } = t;
		(yt(a) && (this.start = r.getDateParts(a)),
			yt(s)
				? (this.end = r.getDateParts(s))
				: this.start != null &&
					o &&
					(this.end = r.getDateParts(ge(this.start.date, o - 1))),
			(this.order = i != null ? i : 0),
			l &&
				(this.repeat = new Tr(_({ from: (n = this.start) == null ? void 0 : n.date }, l), {
					locale: this.locale,
				})));
	}
	static fromMany(t, r) {
		return (ke(t) ? t : [t]).filter((n) => n).map((n) => bt.from(n, r));
	}
	static from(t, r) {
		var a, s;
		if (t instanceof bt) return t;
		const n = { start: null, end: null };
		return (
			t != null &&
				(ke(t)
					? ((n.start = (a = t[0]) != null ? a : null),
						(n.end = (s = t[1]) != null ? s : null))
					: We(t)
						? Object.assign(n, t)
						: ((n.start = t), (n.end = t))),
			n.start != null && (n.start = new Date(n.start)),
			n.end != null && (n.end = new Date(n.end)),
			new bt(n, r)
		);
	}
	get opts() {
		const { order: t, locale: r } = this;
		return { order: t, locale: r };
	}
	get hasRepeat() {
		return !!this.repeat;
	}
	get isSingleDay() {
		const { start: t, end: r } = this;
		return t && r && t.year === r.year && t.month === r.month && t.day === r.day;
	}
	get isMultiDay() {
		return !this.isSingleDay;
	}
	get daySpan() {
		return this.start == null || this.end == null
			? this.hasRepeat
				? 1
				: 1 / 0
			: this.end.dayIndex - this.start.dayIndex;
	}
	startsOnDay(t) {
		var r, n;
		return (
			((r = this.start) == null ? void 0 : r.dayIndex) === t.dayIndex ||
			!!((n = this.repeat) == null ? void 0 : n.passes(t))
		);
	}
	intersectsDay(t) {
		return this.intersectsDayRange(t, t);
	}
	intersectsRange(t) {
		var a, s;
		var r, n;
		return this.intersectsDayRange(
			(a = (r = t.start) == null ? void 0 : r.dayIndex) != null ? a : -1 / 0,
			(s = (n = t.end) == null ? void 0 : n.dayIndex) != null ? s : 1 / 0,
		);
	}
	intersectsDayRange(t, r) {
		return !((this.start && this.start.dayIndex > r) || (this.end && this.end.dayIndex < t));
	}
}
class f1 {
	constructor() {
		P(this, "records", {});
	}
	render(t, r, n) {
		var f, v, h, D;
		var a, s, o, i;
		let l = null;
		const u = n[0].dayIndex,
			d = n[n.length - 1].dayIndex;
		return (
			r.hasRepeat
				? n.forEach((T) => {
						var L, z;
						var M, b;
						if (r.startsOnDay(T)) {
							const E = r.daySpan < 1 / 0 ? r.daySpan : 1;
							((l = {
								startDay: T.dayIndex,
								startTime:
									(L = (M = r.start) == null ? void 0 : M.time) != null ? L : 0,
								endDay: T.dayIndex + E - 1,
								endTime:
									(z = (b = r.end) == null ? void 0 : b.time) != null ? z : Pr,
							}),
								this.getRangeRecords(t).push(l));
						}
					})
				: r.intersectsDayRange(u, d) &&
					((l = {
						startDay:
							(f = (a = r.start) == null ? void 0 : a.dayIndex) != null ? f : -1 / 0,
						startTime:
							(v = (s = r.start) == null ? void 0 : s.time) != null ? v : -1 / 0,
						endDay:
							(h = (o = r.end) == null ? void 0 : o.dayIndex) != null ? h : 1 / 0,
						endTime: (D = (i = r.end) == null ? void 0 : i.time) != null ? D : 1 / 0,
					}),
					this.getRangeRecords(t).push(l)),
			l
		);
	}
	getRangeRecords(t) {
		let r = this.records[t.key];
		return (r || ((r = { ranges: [], data: t }), (this.records[t.key] = r)), r.ranges);
	}
	getCell(t, r) {
		return this.getCells(r).find((s) => s.data.key === t);
	}
	cellExists(t, r) {
		const n = this.records[t];
		return n == null ? !1 : n.ranges.some((a) => a.startDay <= r && a.endDay >= r);
	}
	getCells(t) {
		const r = Object.values(this.records),
			n = [],
			{ dayIndex: a } = t;
		return (
			r.forEach(({ data: s, ranges: o }) => {
				o.filter((i) => i.startDay <= a && i.endDay >= a).forEach((i) => {
					const l = a === i.startDay,
						u = a === i.endDay,
						d = l ? i.startTime : 0,
						f = new Date(t.startDate.getTime() + d),
						v = u ? i.endTime : Pr,
						h = new Date(t.endDate.getTime() + v),
						D = d === 0 && v === Pr,
						T = s.order || 0;
					n.push(
						S(_({}, i), {
							data: s,
							onStart: l,
							onEnd: u,
							startTime: d,
							startDate: f,
							endTime: v,
							endDate: h,
							allDay: D,
							order: T,
						}),
					);
				});
			}),
			n.sort((s, o) => s.order - o.order),
			n
		);
	}
}
const ze = {
	ar: { dow: 7, L: "D/\u200FM/\u200FYYYY" },
	bg: { dow: 2, L: "D.MM.YYYY" },
	ca: { dow: 2, L: "DD/MM/YYYY" },
	"zh-CN": { dow: 2, L: "YYYY/MM/DD" },
	"zh-TW": { dow: 1, L: "YYYY/MM/DD" },
	hr: { dow: 2, L: "DD.MM.YYYY" },
	cs: { dow: 2, L: "DD.MM.YYYY" },
	da: { dow: 2, L: "DD.MM.YYYY" },
	nl: { dow: 2, L: "DD-MM-YYYY" },
	"en-US": { dow: 1, L: "MM/DD/YYYY" },
	"en-AU": { dow: 2, L: "DD/MM/YYYY" },
	"en-CA": { dow: 1, L: "YYYY-MM-DD" },
	"en-GB": { dow: 2, L: "DD/MM/YYYY" },
	"en-IE": { dow: 2, L: "DD-MM-YYYY" },
	"en-NZ": { dow: 2, L: "DD/MM/YYYY" },
	"en-ZA": { dow: 1, L: "YYYY/MM/DD" },
	eo: { dow: 2, L: "YYYY-MM-DD" },
	et: { dow: 2, L: "DD.MM.YYYY" },
	fi: { dow: 2, L: "DD.MM.YYYY" },
	fr: { dow: 2, L: "DD/MM/YYYY" },
	"fr-CA": { dow: 1, L: "YYYY-MM-DD" },
	"fr-CH": { dow: 2, L: "DD.MM.YYYY" },
	de: { dow: 2, L: "DD.MM.YYYY" },
	he: { dow: 1, L: "DD.MM.YYYY" },
	id: { dow: 2, L: "DD/MM/YYYY" },
	it: { dow: 2, L: "DD/MM/YYYY" },
	ja: { dow: 1, L: "YYYY\u5E74M\u6708D\u65E5" },
	ko: { dow: 1, L: "YYYY.MM.DD" },
	lv: { dow: 2, L: "DD.MM.YYYY" },
	lt: { dow: 2, L: "DD.MM.YYYY" },
	mk: { dow: 2, L: "D.MM.YYYY" },
	nb: { dow: 2, L: "D. MMMM YYYY" },
	nn: { dow: 2, L: "D. MMMM YYYY" },
	pl: { dow: 2, L: "DD.MM.YYYY" },
	pt: { dow: 2, L: "DD/MM/YYYY" },
	ro: { dow: 2, L: "DD.MM.YYYY" },
	ru: { dow: 2, L: "DD.MM.YYYY" },
	sk: { dow: 2, L: "DD.MM.YYYY" },
	"es-ES": { dow: 2, L: "DD/MM/YYYY" },
	"es-MX": { dow: 2, L: "DD/MM/YYYY" },
	sv: { dow: 2, L: "YYYY-MM-DD" },
	th: { dow: 1, L: "DD/MM/YYYY" },
	tr: { dow: 2, L: "DD.MM.YYYY" },
	uk: { dow: 2, L: "DD.MM.YYYY" },
	vi: { dow: 2, L: "DD/MM/YYYY" },
};
ze.en = ze["en-US"];
ze.es = ze["es-ES"];
ze.no = ze.nb;
ze.zh = ze["zh-CN"];
const v1 = Object.entries(ze).reduce(
		(e, [t, { dow: r, L: n }]) => ((e[t] = { id: t, firstDayOfWeek: r, masks: { L: n } }), e),
		{},
	),
	h1 = "MMMM YYYY",
	m1 = "W",
	p1 = "MMM",
	y1 = "h A",
	g1 = ["L", "YYYY-MM-DD", "YYYY/MM/DD"],
	b1 = ["L h:mm A", "YYYY-MM-DD h:mm A", "YYYY/MM/DD h:mm A"],
	D1 = ["L HH:mm", "YYYY-MM-DD HH:mm", "YYYY/MM/DD HH:mm"],
	w1 = ["h:mm A"],
	$1 = ["HH:mm"],
	_1 = "WWW, MMM D, YYYY",
	M1 = ["L", "YYYY-MM-DD", "YYYY/MM/DD"],
	k1 = "iso",
	Y1 = "YYYY-MM-DDTHH:mm:ss.SSSZ",
	T1 = {
		title: h1,
		weekdays: m1,
		navMonths: p1,
		hours: y1,
		input: g1,
		inputDateTime: b1,
		inputDateTime24hr: D1,
		inputTime: w1,
		inputTime24hr: $1,
		dayPopover: _1,
		data: M1,
		model: k1,
		iso: Y1,
	},
	P1 = 300,
	C1 = 60,
	O1 = 80,
	S1 = { maxSwipeTime: P1, minHorizontalSwipeDistance: C1, maxVerticalSwipeDistance: O1 },
	I1 = {
		componentPrefix: "V",
		color: "blue",
		isDark: !1,
		navVisibility: "click",
		titlePosition: "center",
		transition: "slide-h",
		touch: S1,
		masks: T1,
		locales: v1,
		datePicker: {
			updateOnInput: !0,
			inputDebounce: 1e3,
			popover: { visibility: "hover-focus", placement: "bottom-start", isInteractive: !0 },
		},
	},
	gn = xr(I1),
	A1 = m(() => ep(gn.locales, (e) => ((e.masks = Ht(e.masks, gn.masks)), e))),
	Ke = (e) =>
		typeof window != "undefined" && us(window.__vcalendar__, e)
			? nt(window.__vcalendar__, e)
			: nt(gn, e),
	E1 = 12,
	N1 = 5;
function L1(e, t) {
	const r = new Intl.DateTimeFormat().resolvedOptions().locale;
	let n;
	(Ne(e) ? (n = e) : us(e, "id") && (n = e.id), (n = (n || r).toLowerCase()));
	const a = Object.keys(t),
		s = (l) => a.find((u) => u.toLowerCase() === l);
	n = s(n) || s(n.substring(0, 2)) || r;
	const o = S(_(_({}, t["en-IE"]), t[n]), { id: n, monthCacheSize: E1, pageCacheSize: N1 });
	return We(e) ? Ht(e, o) : o;
}
class Yr {
	constructor(t = void 0, r) {
		(P(this, "id"),
			P(this, "daysInWeek"),
			P(this, "firstDayOfWeek"),
			P(this, "masks"),
			P(this, "timezone"),
			P(this, "hourLabels"),
			P(this, "dayNames"),
			P(this, "dayNamesShort"),
			P(this, "dayNamesShorter"),
			P(this, "dayNamesNarrow"),
			P(this, "monthNames"),
			P(this, "monthNamesShort"),
			P(this, "relativeTimeNames"),
			P(this, "amPm", ["am", "pm"]),
			P(this, "monthCache"),
			P(this, "pageCache"));
		const {
			id: n,
			firstDayOfWeek: a,
			masks: s,
			monthCacheSize: o,
			pageCacheSize: i,
		} = L1(t, A1.value);
		((this.monthCache = new Ps(o, ab, sb)),
			(this.pageCache = new Ps(i, Ts, c1)),
			(this.id = n),
			(this.daysInWeek = de),
			(this.firstDayOfWeek = yg(a, 1, de)),
			(this.masks = s),
			(this.timezone = r || void 0),
			(this.hourLabels = this.getHourLabels()),
			(this.dayNames = $n("long", this.id)),
			(this.dayNamesShort = $n("short", this.id)),
			(this.dayNamesShorter = this.dayNamesShort.map((l) => l.substring(0, 2))),
			(this.dayNamesNarrow = $n("narrow", this.id)),
			(this.monthNames = Vs("long", this.id)),
			(this.monthNamesShort = Vs("short", this.id)),
			(this.relativeTimeNames = lb(this.id)));
	}
	formatDate(t, r) {
		return vb(t, r, this);
	}
	parseDate(t, r) {
		return Ks(t, r, this);
	}
	toDate(t, r = {}) {
		const n = new Date(NaN);
		let a = n;
		const { fillDate: s, mask: o, patch: i, rules: l } = r;
		if (
			(Se(t)
				? ((r.type = "number"), (a = new Date(+t)))
				: Ne(t)
					? ((r.type = "string"), (a = t ? Ks(t, o || "iso", this) : n))
					: yt(t)
						? ((r.type = "date"), (a = new Date(t.getTime())))
						: Dn(t) && ((r.type = "object"), (a = this.getDateFromParts(t))),
			a && (i || l))
		) {
			let u = this.getDateParts(a);
			if (i && s != null) {
				const d = this.getDateParts(this.toDate(s));
				u = this.getDateParts(this.toDate(_(_({}, d), fs(u, G1[i]))));
			}
			(l && (u = fb(u, l)), (a = this.getDateFromParts(u)));
		}
		return a || n;
	}
	toDateOrNull(t, r = {}) {
		const n = this.toDate(t, r);
		return isNaN(n.getTime()) ? null : n;
	}
	fromDate(t, { type: r, mask: n } = {}) {
		switch (r) {
			case "number":
				return t ? t.getTime() : NaN;
			case "string":
				return t ? this.formatDate(t, n || "iso") : "";
			case "object":
				return t ? this.getDateParts(t) : null;
			default:
				return t ? new Date(t) : null;
		}
	}
	range(t) {
		return bt.from(t, this);
	}
	ranges(t) {
		return bt.fromMany(t, this);
	}
	getDateParts(t) {
		return nb(t, this);
	}
	getDateFromParts(t) {
		return zs(t, this.timezone);
	}
	getDateFromParams(t, r, n, a, s, o, i) {
		return this.getDateFromParts({
			year: t,
			month: r,
			day: n,
			hours: a,
			minutes: s,
			seconds: o,
			milliseconds: i,
		});
	}
	getPage(t) {
		const r = this.pageCache.getOrSet(t, this);
		return d1(t, r);
	}
	getMonthParts(t, r) {
		const { firstDayOfWeek: n } = this;
		return this.monthCache.getOrSet(t, r, n);
	}
	getThisMonthParts() {
		const t = new Date();
		return this.getMonthParts(t.getMonth() + 1, t.getFullYear());
	}
	getPrevMonthParts(t, r) {
		return t === 1 ? this.getMonthParts(12, r - 1) : this.getMonthParts(t - 1, r);
	}
	getNextMonthParts(t, r) {
		return t === 12 ? this.getMonthParts(1, r + 1) : this.getMonthParts(t + 1, r);
	}
	getHourLabels() {
		return ib().map((t) => this.formatDate(t, this.masks.hours));
	}
	getDayId(t) {
		return this.formatDate(t, "YYYY-MM-DD");
	}
}
var Dt = ((e) => ((e.Any = "any"), (e.All = "all"), e))(Dt || {}),
	Cs = ((e) => (
		(e.Days = "days"),
		(e.Weeks = "weeks"),
		(e.Months = "months"),
		(e.Years = "years"),
		e
	))(Cs || {}),
	Os = ((e) => (
		(e.Days = "days"),
		(e.Weekdays = "weekdays"),
		(e.Weeks = "weeks"),
		(e.Months = "months"),
		(e.Years = "years"),
		e
	))(Os || {}),
	Ss = ((e) => ((e.OrdinalWeekdays = "ordinalWeekdays"), e))(Ss || {});
class x1 {
	constructor(t, r, n) {
		(P(this, "validated", !0),
			(this.type = t),
			(this.interval = r),
			(this.from = n),
			this.from ||
				(console.error(
					'A valid "from" date is required for date interval rule. This rule will be skipped.',
				),
				(this.validated = !1)));
	}
	passes(t) {
		if (!this.validated) return !0;
		const { date: r } = t;
		switch (this.type) {
			case "days":
				return wn(this.from.date, r) % this.interval == 0;
			case "weeks":
				return tb(this.from.date, r) % this.interval == 0;
			case "months":
				return rb(this.from.date, r) % this.interval == 0;
			case "years":
				return Bs(this.from.date, r) % this.interval == 0;
			default:
				return !1;
		}
	}
}
class wt {
	constructor(t, r, n, a) {
		(P(this, "components", []),
			(this.type = t),
			(this.validator = n),
			(this.getter = a),
			(this.components = this.normalizeComponents(r)));
	}
	static create(t, r) {
		switch (t) {
			case "days":
				return new F1(r);
			case "weekdays":
				return new R1(r);
			case "weeks":
				return new H1(r);
			case "months":
				return new W1(r);
			case "years":
				return new j1(r);
		}
	}
	normalizeComponents(t) {
		if (this.validator(t)) return [t];
		if (!ke(t)) return [];
		const r = [];
		return (
			t.forEach((n) => {
				if (!this.validator(n)) {
					console.error(
						`Component value ${n} in invalid for "${this.type}" rule. This rule will be skipped.`,
					);
					return;
				}
				r.push(n);
			}),
			r
		);
	}
	passes(t) {
		return this.getter(t).some((a) => this.components.includes(a));
	}
}
class F1 extends wt {
	constructor(t) {
		super("days", t, U1, ({ day: r, dayFromEnd: n }) => [r, -n]);
	}
}
class R1 extends wt {
	constructor(t) {
		super("weekdays", t, bn, ({ weekday: r }) => [r]);
	}
}
class H1 extends wt {
	constructor(t) {
		super("weeks", t, V1, ({ week: r, weekFromEnd: n }) => [r, -n]);
	}
}
class W1 extends wt {
	constructor(t) {
		super("months", t, K1, ({ month: r }) => [r]);
	}
}
class j1 extends wt {
	constructor(t) {
		super("years", t, Se, ({ year: r }) => [r]);
	}
}
class B1 {
	constructor(t, r) {
		(P(this, "components"), (this.type = t), (this.components = this.normalizeComponents(r)));
	}
	normalizeArrayConfig(t) {
		const r = [];
		return (
			t.forEach((n, a) => {
				if (Se(n)) {
					if (a === 0) return;
					if (!Is(t[0])) {
						console.error(
							`Ordinal range for "${this.type}" rule is from -5 to -1 or 1 to 5. This rule will be skipped.`,
						);
						return;
					}
					if (!bn(n)) {
						console.error(
							`Acceptable range for "${this.type}" rule is from 1 to 5. This rule will be skipped`,
						);
						return;
					}
					r.push([t[0], n]);
				} else ke(n) && r.push(...this.normalizeArrayConfig(n));
			}),
			r
		);
	}
	normalizeComponents(t) {
		const r = [];
		return (
			t.forEach((n, a) => {
				if (Se(n)) {
					if (a === 0) return;
					if (!Is(t[0])) {
						console.error(
							`Ordinal range for "${this.type}" rule is from -5 to -1 or 1 to 5. This rule will be skipped.`,
						);
						return;
					}
					if (!bn(n)) {
						console.error(
							`Acceptable range for "${this.type}" rule is from 1 to 5. This rule will be skipped`,
						);
						return;
					}
					r.push([t[0], n]);
				} else ke(n) && r.push(...this.normalizeArrayConfig(n));
			}),
			r
		);
	}
	passes(t) {
		const { weekday: r, weekdayOrdinal: n, weekdayOrdinalFromEnd: a } = t;
		return this.components.some(([s, o]) => (s === n || s === -a) && r === o);
	}
}
class z1 {
	constructor(t) {
		(P(this, "type", "function"),
			P(this, "validated", !0),
			(this.fn = t),
			et(t) ||
				(console.error(
					"The function rule requires a valid function. This rule will be skipped.",
				),
				(this.validated = !1)));
	}
	passes(t) {
		return this.validated ? this.fn(t) : !0;
	}
}
class Tr {
	constructor(t, r = {}, n) {
		(P(this, "validated", !0),
			P(this, "config"),
			P(this, "type", Dt.Any),
			P(this, "from"),
			P(this, "until"),
			P(this, "rules", []),
			P(this, "locale", new Yr()),
			(this.parent = n),
			r.locale && (this.locale = r.locale),
			(this.config = t),
			et(t)
				? ((this.type = Dt.All), (this.rules = [new z1(t)]))
				: ke(t)
					? ((this.type = Dt.Any), (this.rules = t.map((a) => new Tr(a, r, this))))
					: We(t)
						? ((this.type = Dt.All),
							(this.from = t.from
								? this.locale.getDateParts(t.from)
								: n == null
									? void 0
									: n.from),
							(this.until = t.until
								? this.locale.getDateParts(t.until)
								: n == null
									? void 0
									: n.until),
							(this.rules = this.getObjectRules(t)))
						: (console.error(
								"Rule group configuration must be an object or an array.",
							),
							(this.validated = !1)));
	}
	getObjectRules(t) {
		const r = [];
		if (t.every && (Ne(t.every) && (t.every = [1, `${t.every}s`]), ke(t.every))) {
			const [n = 1, a = Cs.Days] = t.every;
			r.push(new x1(a, n, this.from));
		}
		return (
			Object.values(Os).forEach((n) => {
				n in t && r.push(wt.create(n, t[n]));
			}),
			Object.values(Ss).forEach((n) => {
				n in t && r.push(new B1(n, t[n]));
			}),
			t.on != null &&
				(ke(t.on) || (t.on = [t.on]),
				r.push(new Tr(t.on, { locale: this.locale }, this.parent))),
			r
		);
	}
	passes(t) {
		return this.validated
			? (this.from && t.dayIndex <= this.from.dayIndex) ||
				(this.until && t.dayIndex >= this.until.dayIndex)
				? !1
				: this.type === Dt.Any
					? this.rules.some((r) => r.passes(t))
					: this.rules.every((r) => r.passes(t))
			: !0;
	}
}
function U1(e) {
	return Se(e) ? e >= 1 && e <= 31 : !1;
}
function bn(e) {
	return Se(e) ? e >= 1 && e <= 7 : !1;
}
function V1(e) {
	return Se(e) ? (e >= -6 && e <= -1) || (e >= 1 && e <= 6) : !1;
}
function K1(e) {
	return Se(e) ? e >= 1 && e <= 12 : !1;
}
function Is(e) {
	return !(!Se(e) || e < -5 || e > 5 || e === 0);
}
const G1 = {
		dateTime: ["year", "month", "day", "hours", "minutes", "seconds", "milliseconds"],
		date: ["year", "month", "day"],
		time: ["hours", "minutes", "seconds", "milliseconds"],
	},
	de = 7,
	Z1 = 6,
	As = 1e3,
	Es = As * 60,
	Ns = Es * 60,
	Pr = Ns * 24,
	q1 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	X1 = ["L", "iso"],
	Wt = {
		milliseconds: [0, 999, 3],
		seconds: [0, 59, 2],
		minutes: [0, 59, 2],
		hours: [0, 23, 2],
	},
	Ls = /d{1,2}|W{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|Z{1,4}|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,
	J1 = /\[([^]*?)\]/gm,
	xs = {
		D(e) {
			return e.day;
		},
		DD(e) {
			return U(e.day, 2);
		},
		d(e) {
			return e.weekday - 1;
		},
		dd(e) {
			return U(e.weekday - 1, 2);
		},
		W(e, t) {
			return t.dayNamesNarrow[e.weekday - 1];
		},
		WW(e, t) {
			return t.dayNamesShorter[e.weekday - 1];
		},
		WWW(e, t) {
			return t.dayNamesShort[e.weekday - 1];
		},
		WWWW(e, t) {
			return t.dayNames[e.weekday - 1];
		},
		M(e) {
			return e.month;
		},
		MM(e) {
			return U(e.month, 2);
		},
		MMM(e, t) {
			return t.monthNamesShort[e.month - 1];
		},
		MMMM(e, t) {
			return t.monthNames[e.month - 1];
		},
		YY(e) {
			return String(e.year).substr(2);
		},
		YYYY(e) {
			return U(e.year, 4);
		},
		h(e) {
			return e.hours % 12 || 12;
		},
		hh(e) {
			return U(e.hours % 12 || 12, 2);
		},
		H(e) {
			return e.hours;
		},
		HH(e) {
			return U(e.hours, 2);
		},
		m(e) {
			return e.minutes;
		},
		mm(e) {
			return U(e.minutes, 2);
		},
		s(e) {
			return e.seconds;
		},
		ss(e) {
			return U(e.seconds, 2);
		},
		S(e) {
			return Math.round(e.milliseconds / 100);
		},
		SS(e) {
			return U(Math.round(e.milliseconds / 10), 2);
		},
		SSS(e) {
			return U(e.milliseconds, 3);
		},
		a(e, t) {
			return e.hours < 12 ? t.amPm[0] : t.amPm[1];
		},
		A(e, t) {
			return e.hours < 12 ? t.amPm[0].toUpperCase() : t.amPm[1].toUpperCase();
		},
		Z() {
			return "Z";
		},
		ZZ(e) {
			const t = e.timezoneOffset;
			return `${t > 0 ? "-" : "+"}${U(Math.floor(Math.abs(t) / 60), 2)}`;
		},
		ZZZ(e) {
			const t = e.timezoneOffset;
			return `${t > 0 ? "-" : "+"}${U(Math.floor(Math.abs(t) / 60) * 100 + (Math.abs(t) % 60), 4)}`;
		},
		ZZZZ(e) {
			const t = e.timezoneOffset;
			return `${t > 0 ? "-" : "+"}${U(Math.floor(Math.abs(t) / 60), 2)}:${U(Math.abs(t) % 60, 2)}`;
		},
	},
	Ge = /\d\d?/,
	Q1 = /\d{3}/,
	eb = /\d{4}/,
	jt =
		/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
	Fs = () => {},
	Rs = (e) => (t, r, n) => {
		const a = n[e].indexOf(r.charAt(0).toUpperCase() + r.substr(1).toLowerCase());
		~a && (t.month = a);
	},
	V = {
		D: [
			Ge,
			(e, t) => {
				e.day = t;
			},
		],
		Do: [
			new RegExp(Ge.source + jt.source),
			(e, t) => {
				e.day = parseInt(t, 10);
			},
		],
		d: [Ge, Fs],
		W: [jt, Fs],
		M: [
			Ge,
			(e, t) => {
				e.month = t - 1;
			},
		],
		MMM: [jt, Rs("monthNamesShort")],
		MMMM: [jt, Rs("monthNames")],
		YY: [
			Ge,
			(e, t) => {
				const n = +new Date().getFullYear().toString().substr(0, 2);
				e.year = +`${t > 68 ? n - 1 : n}${t}`;
			},
		],
		YYYY: [
			eb,
			(e, t) => {
				e.year = t;
			},
		],
		S: [
			/\d/,
			(e, t) => {
				e.milliseconds = t * 100;
			},
		],
		SS: [
			/\d{2}/,
			(e, t) => {
				e.milliseconds = t * 10;
			},
		],
		SSS: [
			Q1,
			(e, t) => {
				e.milliseconds = t;
			},
		],
		h: [
			Ge,
			(e, t) => {
				e.hours = t;
			},
		],
		m: [
			Ge,
			(e, t) => {
				e.minutes = t;
			},
		],
		s: [
			Ge,
			(e, t) => {
				e.seconds = t;
			},
		],
		a: [
			jt,
			(e, t, r) => {
				const n = t.toLowerCase();
				n === r.amPm[0] ? (e.isPm = !1) : n === r.amPm[1] && (e.isPm = !0);
			},
		],
		Z: [
			/[^\s]*?[+-]\d\d:?\d\d|[^\s]*?Z?/,
			(e, t) => {
				t === "Z" && (t = "+00:00");
				const r = `${t}`.match(/([+-]|\d\d)/gi);
				if (r) {
					const n = +r[1] * 60 + parseInt(r[2], 10);
					e.timezoneOffset = r[0] === "+" ? n : -n;
				}
			},
		],
	};
V.DD = V.D;
V.dd = V.d;
V.WWWW = V.WWW = V.WW = V.W;
V.MM = V.M;
V.mm = V.m;
V.hh = V.H = V.HH = V.h;
V.ss = V.s;
V.A = V.a;
V.ZZZZ = V.ZZZ = V.ZZ = V.Z;
function Hs(e, t) {
	return ((je(e) && e) || [(Ne(e) && e) || "YYYY-MM-DD"]).map((r) =>
		X1.reduce((n, a) => n.replace(a, t.masks[a] || ""), r),
	);
}
function Dn(e) {
	return We(e) && "year" in e && "month" in e && "day" in e;
}
function Ws(e, t = 1) {
	const r = e.getDay() + 1,
		n = r >= t ? t - r : -(7 - (t - r));
	return ge(e, n);
}
function js(e, t, r) {
	const n = Date.UTC(e, t - 1, r);
	return wn(new Date(0), new Date(n));
}
function wn(e, t) {
	return Math.round((t.getTime() - e.getTime()) / Pr);
}
function tb(e, t) {
	return Math.ceil(wn(Ws(e), Ws(t)) / 7);
}
function Bs(e, t) {
	return t.getUTCFullYear() - e.getUTCFullYear();
}
function rb(e, t) {
	return Bs(e, t) * 12 + (t.getMonth() - e.getMonth());
}
function zs(e, t = "") {
	const r = new Date(),
		{
			year: n = r.getFullYear(),
			month: a = r.getMonth() + 1,
			day: s = r.getDate(),
			hours: o = 0,
			minutes: i = 0,
			seconds: l = 0,
			milliseconds: u = 0,
		} = e;
	if (t) {
		const d = `${U(n, 4)}-${U(a, 2)}-${U(s, 2)}T${U(o, 2)}:${U(i, 2)}:${U(l, 2)}.${U(u, 3)}`;
		return Eg(d, { timeZone: t });
	}
	return new Date(n, a - 1, s, o, i, l, u);
}
function nb(e, t) {
	let r = new Date(e.getTime());
	t.timezone &&
		((r = new Date(e.toLocaleString("en-US", { timeZone: t.timezone }))),
		r.setMilliseconds(e.getMilliseconds()));
	const n = r.getMilliseconds(),
		a = r.getSeconds(),
		s = r.getMinutes(),
		o = r.getHours(),
		i = n + a * As + s * Es + o * Ns,
		l = r.getMonth() + 1,
		u = r.getFullYear(),
		d = t.getMonthParts(l, u),
		f = r.getDate(),
		v = d.numDays - f + 1,
		h = r.getDay() + 1,
		D = Math.floor((f - 1) / 7 + 1),
		T = Math.floor((d.numDays - f) / 7 + 1),
		M = Math.ceil((f + Math.abs(d.firstWeekday - d.firstDayOfWeek)) / 7),
		b = d.numWeeks - M + 1,
		L = d.weeknumbers[M],
		z = js(u, l, f);
	return {
		milliseconds: n,
		seconds: a,
		minutes: s,
		hours: o,
		time: i,
		day: f,
		dayFromEnd: v,
		weekday: h,
		weekdayOrdinal: D,
		weekdayOrdinalFromEnd: T,
		week: M,
		weekFromEnd: b,
		weeknumber: L,
		month: l,
		year: u,
		date: r,
		dateTime: r.getTime(),
		dayIndex: z,
		timezoneOffset: 0,
		isValid: !0,
	};
}
function ab(e, t, r) {
	return `${t}-${e}-${r}`;
}
function sb(e, t, r) {
	const n = (t % 4 == 0 && t % 100 != 0) || t % 400 == 0,
		a = new Date(t, e - 1, 1),
		s = a.getDay() + 1,
		o = e === 2 && n ? 29 : q1[e - 1],
		i = r - 1,
		l = Kg(a, { weekStartsOn: i }),
		u = [],
		d = [];
	for (let f = 0; f < l; f++) {
		const v = ge(a, f * 7);
		(u.push(Xg(v, { weekStartsOn: i })), d.push(t1(v)));
	}
	return {
		firstDayOfWeek: r,
		firstDayOfMonth: a,
		inLeapYear: n,
		firstWeekday: s,
		numDays: o,
		numWeeks: l,
		month: e,
		year: t,
		weeknumbers: u,
		isoWeeknumbers: d,
	};
}
function ob() {
	const e = [],
		t = 2020,
		r = 1,
		n = 5;
	for (let a = 0; a < de; a++) e.push(zs({ year: t, month: r, day: n + a, hours: 12 }));
	return e;
}
function $n(e, t = void 0) {
	const r = new Intl.DateTimeFormat(t, { weekday: e });
	return ob().map((n) => r.format(n));
}
function ib() {
	const e = [];
	for (let t = 0; t <= 24; t++) e.push(new Date(2e3, 0, 1, t));
	return e;
}
function lb(e = void 0) {
	const t = ["second", "minute", "hour", "day", "week", "month", "quarter", "year"],
		r = new Intl.RelativeTimeFormat(e);
	return t.reduce((n, a) => {
		const s = r.formatToParts(100, a);
		return ((n[a] = s[1].unit), n);
	}, {});
}
function Us() {
	const e = [];
	for (let t = 0; t < 12; t++) e.push(new Date(2e3, t, 15));
	return e;
}
function Vs(e, t = void 0) {
	const r = new Intl.DateTimeFormat(t, { month: e, timeZone: "UTC" });
	return Us().map((n) => r.format(n));
}
function ub(e, t, r) {
	return Se(t)
		? t === e
		: ke(t)
			? t.includes(e)
			: et(t)
				? t(e, r)
				: !(
						(t.min != null && t.min > e) ||
						(t.max != null && t.max < e) ||
						(t.interval != null && e % t.interval != 0)
					);
}
function Bt(e, t, r) {
	const n = [],
		[a, s, o] = t;
	for (let i = a; i <= s; i++)
		(r == null || ub(i, r, e)) && n.push({ value: i, label: U(i, o) });
	return n;
}
function cb(e, t) {
	return {
		milliseconds: Bt(e, Wt.milliseconds, t.milliseconds),
		seconds: Bt(e, Wt.seconds, t.seconds),
		minutes: Bt(e, Wt.minutes, t.minutes),
		hours: Bt(e, Wt.hours, t.hours),
	};
}
function db(e, t, r, n) {
	const s = Bt(e, t, n).reduce((o, i) => {
		if (i.disabled) return o;
		if (isNaN(o)) return i.value;
		const l = Math.abs(o - r);
		return Math.abs(i.value - r) < l ? i.value : o;
	}, NaN);
	return isNaN(s) ? r : s;
}
function fb(e, t) {
	const r = _({}, e);
	return (
		Object.entries(t).forEach(([n, a]) => {
			const s = Wt[n],
				o = e[n];
			r[n] = db(e, s, o, a);
		}),
		r
	);
}
function Ks(e, t, r) {
	return (
		Hs(t, r)
			.map((a) => {
				if (typeof a != "string") throw new Error("Invalid mask");
				let s = e;
				if (s.length > 1e3) return !1;
				let o = !0;
				const i = {};
				if (
					(a.replace(Ls, (d) => {
						if (V[d]) {
							const f = V[d],
								v = s.search(f[0]);
							~v
								? s.replace(
										f[0],
										(h) => (f[1](i, h, r), (s = s.substr(v + h.length)), h),
									)
								: (o = !1);
						}
						return V[d] ? "" : d.slice(1, d.length - 1);
					}),
					!o)
				)
					return !1;
				const l = new Date();
				i.hours != null &&
					(i.isPm === !0 && +i.hours != 12
						? (i.hours = +i.hours + 12)
						: i.isPm === !1 && +i.hours == 12 && (i.hours = 0));
				let u;
				return (
					i.timezoneOffset != null
						? ((i.minutes = +(i.minutes || 0) - +i.timezoneOffset),
							(u = new Date(
								Date.UTC(
									i.year || l.getFullYear(),
									i.month || 0,
									i.day || 1,
									i.hours || 0,
									i.minutes || 0,
									i.seconds || 0,
									i.milliseconds || 0,
								),
							)))
						: (u = r.getDateFromParts({
								year: i.year || l.getFullYear(),
								month: (i.month || 0) + 1,
								day: i.day || 1,
								hours: i.hours || 0,
								minutes: i.minutes || 0,
								seconds: i.seconds || 0,
								milliseconds: i.milliseconds || 0,
							})),
					u
				);
			})
			.find((a) => a) || new Date(e)
	);
}
function vb(e, t, r) {
	if (e == null) return "";
	let n = Hs(t, r)[0];
	/Z$/.test(n) && (r.timezone = "utc");
	const a = [];
	n = n.replace(J1, (o, i) => (a.push(i), "??"));
	const s = r.getDateParts(e);
	return (
		(n = n.replace(Ls, (o) => (o in xs ? xs[o](s, r) : o.slice(1, o.length - 1)))),
		n.replace(/\?\?/g, () => a.shift())
	);
}
let hb = 0;
class Gs {
	constructor(t, r, n) {
		(P(this, "key", ""),
			P(this, "hashcode", ""),
			P(this, "highlight", null),
			P(this, "content", null),
			P(this, "dot", null),
			P(this, "bar", null),
			P(this, "event", null),
			P(this, "popover", null),
			P(this, "customData", null),
			P(this, "ranges"),
			P(this, "hasRanges", !1),
			P(this, "order", 0),
			P(this, "pinPage", !1),
			P(this, "maxRepeatSpan", 0),
			P(this, "locale"));
		const { dates: a } = Object.assign(this, { hashcode: "", order: 0, pinPage: !1 }, t);
		(this.key || (this.key = ++hb),
			(this.locale = n),
			r.normalizeGlyphs(this),
			(this.ranges = n.ranges(a != null ? a : [])),
			(this.hasRanges = !!je(this.ranges)),
			(this.maxRepeatSpan = this.ranges
				.filter((s) => s.hasRepeat)
				.map((s) => s.daySpan)
				.reduce((s, o) => Math.max(s, o), 0)));
	}
	intersectsRange({ start: t, end: r }) {
		if (t == null || r == null) return !1;
		const n = this.ranges.filter((o) => !o.hasRepeat);
		for (const o of n) if (o.intersectsDayRange(t.dayIndex, r.dayIndex)) return !0;
		const a = this.ranges.filter((o) => o.hasRepeat);
		if (!a.length) return !1;
		let s = t;
		for (
			this.maxRepeatSpan > 1 &&
			(s = this.locale.getDateParts(ge(s.date, -this.maxRepeatSpan)));
			s.dayIndex <= r.dayIndex;
		) {
			for (const o of a) if (o.startsOnDay(s)) return !0;
			s = this.locale.getDateParts(ge(s.date, 1));
		}
		return !1;
	}
}
function _n(e) {
	document && document.dispatchEvent(new CustomEvent("show-popover", { detail: e }));
}
function zt(e) {
	document && document.dispatchEvent(new CustomEvent("hide-popover", { detail: e }));
}
function Zs(e) {
	document && document.dispatchEvent(new CustomEvent("toggle-popover", { detail: e }));
}
function qs(e) {
	const { visibility: t } = e,
		r = t === "click",
		n = t === "hover",
		a = t === "hover-focus",
		s = t === "focus";
	e.autoHide = !r;
	let o = !1,
		i = !1;
	const l = (D) => {
			r && (Zs(S(_({}, e), { target: e.target || D.currentTarget })), D.stopPropagation());
		},
		u = (D) => {
			o || ((o = !0), (n || a) && _n(S(_({}, e), { target: e.target || D.currentTarget })));
		},
		d = () => {
			o && ((o = !1), (n || (a && !i)) && zt(e));
		},
		f = (D) => {
			i || ((i = !0), (s || a) && _n(S(_({}, e), { target: e.target || D.currentTarget })));
		},
		v = (D) => {
			i && !gr(D.currentTarget, D.relatedTarget) && ((i = !1), (s || (a && !o)) && zt(e));
		},
		h = {};
	switch (e.visibility) {
		case "click":
			h.click = l;
			break;
		case "hover":
			((h.mousemove = u), (h.mouseleave = d));
			break;
		case "focus":
			((h.focusin = f), (h.focusout = v));
			break;
		case "hover-focus":
			((h.mousemove = u), (h.mouseleave = d), (h.focusin = f), (h.focusout = v));
			break;
	}
	return h;
}
const Xs = (e) => {
		const t = yr(e);
		if (t == null) return;
		const r = t.popoverHandlers;
		!r || !r.length || (r.forEach((n) => n()), delete t.popoverHandlers);
	},
	Js = (e, t) => {
		const r = yr(e);
		if (r == null) return;
		const n = [],
			a = qs(t);
		(Object.entries(a).forEach(([s, o]) => {
			n.push(Ve(r, s, o));
		}),
			(r.popoverHandlers = n));
	},
	Qs = {
		mounted(e, t) {
			const { value: r } = t;
			!r || Js(e, r);
		},
		updated(e, t) {
			const { oldValue: r, value: n } = t,
				a = r == null ? void 0 : r.visibility,
				s = n == null ? void 0 : n.visibility;
			a !== s && (a && (Xs(e), s || zt(r)), s && Js(e, n));
		},
		unmounted(e) {
			Xs(e);
		},
	},
	mb = (
		e,
		t,
		{ maxSwipeTime: r, minHorizontalSwipeDistance: n, maxVerticalSwipeDistance: a },
	) => {
		if (!e || !e.addEventListener || !et(t)) return null;
		let s = 0,
			o = 0,
			i = null,
			l = !1;
		function u(f) {
			const v = f.changedTouches[0];
			((s = v.screenX), (o = v.screenY), (i = new Date().getTime()), (l = !0));
		}
		function d(f) {
			if (!l || !i) return;
			l = !1;
			const v = f.changedTouches[0],
				h = v.screenX - s,
				D = v.screenY - o;
			if (new Date().getTime() - i < r && Math.abs(h) >= n && Math.abs(D) <= a) {
				const M = { toLeft: !1, toRight: !1 };
				(h < 0 ? (M.toLeft = !0) : (M.toRight = !0), t(M));
			}
		}
		return (
			Ve(e, "touchstart", u, { passive: !0 }),
			Ve(e, "touchend", d, { passive: !0 }),
			() => {
				(Ue(e, "touchstart", u), Ue(e, "touchend", d));
			}
		);
	},
	Cr = {},
	pb = (e, t = 10) => {
		Cr[e] = Date.now() + t;
	},
	yb = (e, t) => {
		if (e in Cr) {
			const r = Cr[e];
			if (Date.now() < r) return;
			delete Cr[e];
		}
		t();
	};
function eo() {
	return typeof window != "undefined";
}
function gb(e) {
	return eo() && e in window;
}
function bb(e) {
	const t = X(!1),
		r = m(() => (t.value ? "dark" : "light"));
	let n, a;
	function s(h) {
		t.value = h.matches;
	}
	function o() {
		gb("matchMedia") &&
			((n = window.matchMedia("(prefers-color-scheme: dark)")),
			n.addEventListener("change", s),
			(t.value = n.matches));
	}
	function i() {
		const { selector: h = ":root", darkClass: D = "dark" } = e.value,
			T = document.querySelector(h);
		t.value = T.classList.contains(D);
	}
	function l(h) {
		const { selector: D = ":root", darkClass: T = "dark" } = h;
		if (eo() && D && T) {
			const M = document.querySelector(D);
			M &&
				((a = new MutationObserver(i)),
				a.observe(M, { attributes: !0, attributeFilter: ["class"] }),
				(t.value = M.classList.contains(T)));
		}
	}
	function u() {
		f();
		const h = typeof e.value;
		h === "string" && e.value.toLowerCase() === "system"
			? o()
			: h === "object"
				? l(e.value)
				: (t.value = !!e.value);
	}
	const d = me(
		() => e.value,
		() => u(),
		{ immediate: !0 },
	);
	function f() {
		(n && (n.removeEventListener("change", s), (n = void 0)),
			a && (a.disconnect(), (a = void 0)));
	}
	function v() {
		(f(), d());
	}
	return (Fr(() => v()), { isDark: t, displayMode: r, cleanup: v });
}
const Db = ["base", "start", "end", "startEnd"],
	wb = ["class", "wrapperClass", "contentClass", "style", "contentStyle", "color", "fillMode"],
	$b = { base: {}, start: {}, end: {} };
function Mn(e, t, r = $b) {
	let n = e,
		a = {};
	t === !0 || Ne(t)
		? ((n = Ne(t) ? t : n), (a = _({}, r)))
		: We(t) &&
			(cs(t, Db)
				? (a = _({}, t))
				: (a = { base: _({}, t), start: _({}, t), end: _({}, t) }));
	const s = Ht(a, { start: a.startEnd, end: a.startEnd }, r);
	return (
		Object.entries(s).forEach(([o, i]) => {
			let l = n;
			(i === !0 || Ne(i)
				? ((l = Ne(i) ? i : l), (s[o] = { color: l }))
				: We(i) && (cs(i, wb) ? (s[o] = _({}, i)) : (s[o] = {})),
				Ht(s[o], { color: l }));
		}),
		s
	);
}
class _b {
	constructor() {
		P(this, "type", "highlight");
	}
	normalizeConfig(t, r) {
		return Mn(t, r, {
			base: { fillMode: "light" },
			start: { fillMode: "solid" },
			end: { fillMode: "solid" },
		});
	}
	prepareRender(t) {
		((t.highlights = []), t.content || (t.content = []));
	}
	render({ data: t, onStart: r, onEnd: n }, a) {
		const { key: s, highlight: o } = t;
		if (!o) return;
		const { highlights: i } = a,
			{ base: l, start: u, end: d } = o;
		r && n
			? i.push(
					S(_({}, u), {
						key: s,
						wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${u.color}`,
						class: [`vc-highlight vc-highlight-bg-${u.fillMode}`, u.class],
						contentClass: [
							`vc-attr vc-highlight-content-${u.fillMode} vc-${u.color}`,
							u.contentClass,
						],
					}),
				)
			: r
				? (i.push(
						S(_({}, l), {
							key: `${s}-base`,
							wrapperClass: `vc-day-layer vc-day-box-right-center vc-attr vc-${l.color}`,
							class: [
								`vc-highlight vc-highlight-base-start vc-highlight-bg-${l.fillMode}`,
								l.class,
							],
						}),
					),
					i.push(
						S(_({}, u), {
							key: s,
							wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${u.color}`,
							class: [`vc-highlight vc-highlight-bg-${u.fillMode}`, u.class],
							contentClass: [
								`vc-attr vc-highlight-content-${u.fillMode} vc-${u.color}`,
								u.contentClass,
							],
						}),
					))
				: n
					? (i.push(
							S(_({}, l), {
								key: `${s}-base`,
								wrapperClass: `vc-day-layer vc-day-box-left-center vc-attr vc-${l.color}`,
								class: [
									`vc-highlight vc-highlight-base-end vc-highlight-bg-${l.fillMode}`,
									l.class,
								],
							}),
						),
						i.push(
							S(_({}, d), {
								key: s,
								wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${d.color}`,
								class: [`vc-highlight vc-highlight-bg-${d.fillMode}`, d.class],
								contentClass: [
									`vc-attr vc-highlight-content-${d.fillMode} vc-${d.color}`,
									d.contentClass,
								],
							}),
						))
					: i.push(
							S(_({}, l), {
								key: `${s}-middle`,
								wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${l.color}`,
								class: [
									`vc-highlight vc-highlight-base-middle vc-highlight-bg-${l.fillMode}`,
									l.class,
								],
								contentClass: [
									`vc-attr vc-highlight-content-${l.fillMode} vc-${l.color}`,
									l.contentClass,
								],
							}),
						);
	}
}
class kn {
	constructor(t, r) {
		(P(this, "type", ""),
			P(this, "collectionType", ""),
			(this.type = t),
			(this.collectionType = r));
	}
	normalizeConfig(t, r) {
		return Mn(t, r);
	}
	prepareRender(t) {
		t[this.collectionType] = [];
	}
	render({ data: t, onStart: r, onEnd: n }, a) {
		const { key: s } = t,
			o = t[this.type];
		if (!s || !o) return;
		const i = a[this.collectionType],
			{ base: l, start: u, end: d } = o;
		r
			? i.push(
					S(_({}, u), {
						key: s,
						class: [
							`vc-${this.type} vc-${this.type}-start vc-${u.color} vc-attr`,
							u.class,
						],
					}),
				)
			: n
				? i.push(
						S(_({}, d), {
							key: s,
							class: [
								`vc-${this.type} vc-${this.type}-end vc-${d.color} vc-attr`,
								d.class,
							],
						}),
					)
				: i.push(
						S(_({}, l), {
							key: s,
							class: [
								`vc-${this.type} vc-${this.type}-base vc-${l.color} vc-attr`,
								l.class,
							],
						}),
					);
	}
}
class Mb extends kn {
	constructor() {
		super("content", "content");
	}
	normalizeConfig(t, r) {
		return Mn("base", r);
	}
}
class kb extends kn {
	constructor() {
		super("dot", "dots");
	}
}
class Yb extends kn {
	constructor() {
		super("bar", "bars");
	}
}
class Tb {
	constructor(t) {
		(P(this, "color"),
			P(this, "renderers", [new Mb(), new _b(), new kb(), new Yb()]),
			(this.color = t));
	}
	normalizeGlyphs(t) {
		this.renderers.forEach((r) => {
			const n = r.type;
			t[n] != null && (t[n] = r.normalizeConfig(this.color, t[n]));
		});
	}
	prepareRender(t = {}) {
		return (
			this.renderers.forEach((r) => {
				r.prepareRender(t);
			}),
			t
		);
	}
	render(t, r) {
		this.renderers.forEach((n) => {
			n.render(t, r);
		});
	}
}
const to = Symbol("__vc_base_context__"),
	ro = {
		color: { type: String, default: () => Ke("color") },
		isDark: { type: [Boolean, String, Object], default: () => Ke("isDark") },
		firstDayOfWeek: Number,
		masks: Object,
		locale: [String, Object],
		timezone: String,
		minDate: null,
		maxDate: null,
		disabledDates: null,
	};
function no(e) {
	const t = m(() => {
			var v;
			return (v = e.color) != null ? v : "";
		}),
		r = m(() => {
			var v;
			return (v = e.isDark) != null ? v : !1;
		}),
		{ displayMode: n } = bb(r),
		a = m(() => new Tb(t.value)),
		s = m(() => {
			if (e.locale instanceof Yr) return e.locale;
			const v = We(e.locale)
				? e.locale
				: { id: e.locale, firstDayOfWeek: e.firstDayOfWeek, masks: e.masks };
			return new Yr(v, e.timezone);
		}),
		o = m(() => s.value.masks),
		i = m(() => e.minDate),
		l = m(() => e.maxDate),
		u = m(() => {
			const v = e.disabledDates ? [...e.disabledDates] : [];
			return (
				i.value != null && v.push({ start: null, end: ge(s.value.toDate(i.value), -1) }),
				l.value != null && v.push({ start: ge(s.value.toDate(l.value), 1), end: null }),
				s.value.ranges(v)
			);
		}),
		d = m(() => new Gs({ key: "disabled", dates: u.value, order: 100 }, a.value, s.value)),
		f = {
			color: t,
			isDark: r,
			displayMode: n,
			theme: a,
			locale: s,
			masks: o,
			minDate: i,
			maxDate: l,
			disabledDates: u,
			disabledAttribute: d,
		};
	return (It(to, f), f);
}
function Pb(e) {
	return St(to, () => no(e), !0);
}
function ao(e) {
	return `__vc_slot_${e}__`;
}
function so(e, t = {}) {
	Object.keys(e).forEach((r) => {
		var n;
		It(ao((n = t[r]) != null ? n : r), e[r]);
	});
}
function oo(e) {
	return St(ao(e), null);
}
const Cb = S(_({}, ro), {
		view: {
			type: String,
			default: "monthly",
			validator(e) {
				return ["daily", "weekly", "monthly"].includes(e);
			},
		},
		rows: { type: Number, default: 1 },
		columns: { type: Number, default: 1 },
		step: Number,
		titlePosition: { type: String, default: () => Ke("titlePosition") },
		navVisibility: { type: String, default: () => Ke("navVisibility") },
		showWeeknumbers: [Boolean, String],
		showIsoWeeknumbers: [Boolean, String],
		expanded: Boolean,
		borderless: Boolean,
		transparent: Boolean,
		initialPage: Object,
		initialPagePosition: { type: Number, default: 1 },
		minPage: Object,
		maxPage: Object,
		transition: String,
		attributes: Array,
		trimWeeks: Boolean,
		disablePageSwipe: Boolean,
	}),
	Ob = [
		"dayclick",
		"daymouseenter",
		"daymouseleave",
		"dayfocusin",
		"dayfocusout",
		"daykeydown",
		"weeknumberclick",
		"transition-start",
		"transition-end",
		"did-move",
		"update:view",
		"update:pages",
	],
	io = Symbol("__vc_calendar_context__");
function Sb(e, { slots: t, emit: r }) {
	const n = X(null),
		a = X(null),
		s = X(new Date().getDate()),
		o = X(!1),
		i = X(Symbol()),
		l = X(Symbol()),
		u = X(e.view),
		d = X([]),
		f = X("");
	let v = null,
		h = null;
	so(t);
	const {
			theme: D,
			color: T,
			displayMode: M,
			locale: b,
			masks: L,
			minDate: z,
			maxDate: E,
			disabledAttribute: N,
			disabledDates: Q,
		} = Pb(e),
		x = m(() => e.rows * e.columns),
		H = m(() => e.step || x.value),
		ee = m(() => {
			var p;
			return (p = ls(d.value)) != null ? p : null;
		}),
		se = m(() => {
			var p;
			return (p = pt(d.value)) != null ? p : null;
		}),
		te = m(() => e.minPage || (z.value ? O(z.value) : null)),
		I = m(() => e.maxPage || (E.value ? O(E.value) : null)),
		j = m(() => e.navVisibility),
		q = m(() => !!e.showWeeknumbers),
		A = m(() => !!e.showIsoWeeknumbers),
		ae = m(() => u.value === "monthly"),
		fe = m(() => u.value === "weekly"),
		be = m(() => u.value === "daily"),
		ie = () => {
			((o.value = !0), r("transition-start"));
		},
		$ = () => {
			((o.value = !1), r("transition-end"), v && (v.resolve(!0), (v = null)));
		},
		R = (p, w, c = u.value) => Ys(p, w, c, b.value),
		O = (p) => ks(p, u.value, b.value),
		ve = (p) => {
			!N.value || !Fe.value || (p.isDisabled = Fe.value.cellExists(N.value.key, p.dayIndex));
		},
		Z = (p) => {
			p.isFocusable = p.inMonth && p.day === s.value;
		},
		Te = (p, w) => {
			for (const c of p) for (const g of c.days) if (w(g) === !1) return;
		},
		Pe = m(() => d.value.reduce((p, w) => (p.push(...w.viewDays), p), [])),
		he = m(() => {
			const p = [];
			return (
				(e.attributes || []).forEach((w, c) => {
					!w ||
						!w.dates ||
						p.push(new Gs(S(_({}, w), { order: w.order || 0 }), D.value, b.value));
				}),
				N.value && p.push(N.value),
				p
			);
		}),
		xe = m(() => je(he.value)),
		Fe = m(() => {
			const p = new f1();
			return (
				he.value.forEach((w) => {
					w.ranges.forEach((c) => {
						p.render(w, c, Pe.value);
					});
				}),
				p
			);
		}),
		Ze = m(() =>
			Pe.value.reduce(
				(p, w) => (
					(p[w.dayIndex] = { day: w, cells: [] }),
					p[w.dayIndex].cells.push(...Fe.value.getCells(w)),
					p
				),
				{},
			),
		),
		qe = (p, w) => {
			const c = e.showWeeknumbers || e.showIsoWeeknumbers;
			return c == null
				? ""
				: Lm(c)
					? c
						? "left"
						: ""
					: c.startsWith("right")
						? w > 1
							? "right"
							: c
						: p > 1
							? "left"
							: c;
		},
		Ie = () => {
			var p, w;
			if (!xe.value) return null;
			const c = he.value.find((F) => F.pinPage) || he.value[0];
			if (!c || !c.hasRanges) return null;
			const [g] = c.ranges,
				k =
					((p = g.start) == null ? void 0 : p.date) ||
					((w = g.end) == null ? void 0 : w.date);
			return k ? O(k) : null;
		},
		Re = () => {
			if (Le(ee.value)) return ee.value;
			const p = Ie();
			return Le(p) ? p : O(new Date());
		},
		it = (p, w = {}) => {
			const { view: c = u.value, position: g = 1, force: k } = w,
				F = g > 0 ? 1 - g : -(x.value + g);
			let K = R(p, F, c),
				le = R(K, x.value - 1, c);
			return (
				k ||
					(yn(K, te.value)
						? (K = te.value)
						: kr(le, I.value) && (K = R(I.value, 1 - x.value)),
					(le = R(K, x.value - 1))),
				{ fromPage: K, toPage: le }
			);
		},
		Vt = (p, w, c = "") => {
			if (c === "none" || c === "fade") return c;
			if ((p == null ? void 0 : p.view) !== (w == null ? void 0 : w.view)) return "fade";
			const g = kr(w, p),
				k = yn(w, p);
			return !g && !k
				? "fade"
				: c === "slide-v"
					? k
						? "slide-down"
						: "slide-up"
					: k
						? "slide-right"
						: "slide-left";
		},
		Xe = (p = {}) =>
			new Promise((w, c) => {
				const { position: g = 1, force: k = !1, transition: F } = p,
					K = Le(p.page) ? p.page : Re(),
					{ fromPage: le } = it(K, { position: g, force: k }),
					we = [];
				for (let $e = 0; $e < x.value; $e++) {
					const Lr = R(le, $e),
						Ot = $e + 1,
						_e = Math.ceil(Ot / e.columns),
						Pn = e.rows - _e + 1,
						lt = Ot % e.columns || e.columns,
						er = e.columns - lt + 1,
						tr = qe(lt, er);
					we.push(
						b.value.getPage(
							S(_({}, Lr), {
								view: u.value,
								titlePosition: e.titlePosition,
								trimWeeks: e.trimWeeks,
								position: Ot,
								row: _e,
								rowFromEnd: Pn,
								column: lt,
								columnFromEnd: er,
								showWeeknumbers: q.value,
								showIsoWeeknumbers: A.value,
								weeknumberPosition: tr,
							}),
						),
					);
				}
				((f.value = Vt(d.value[0], we[0], F)),
					(d.value = we),
					f.value && f.value !== "none" ? (v = { resolve: w, reject: c }) : w(!0));
			}),
		Kt = (p) => {
			var c;
			const w = (c = ee.value) != null ? c : O(new Date());
			return R(w, p);
		},
		_t = (p, w = {}) => {
			const c = Le(p) ? p : O(p);
			return (
				Object.assign(w, it(c, S(_({}, w), { force: !0 }))),
				u1(w.fromPage, w.toPage, u.value, b.value)
					.map((k) => i1(k, te.value, I.value))
					.some((k) => k)
			);
		},
		Mt = (p, w = {}) => _t(Kt(p), w),
		Or = m(() => Mt(-H.value)),
		Sr = m(() => Mt(H.value)),
		kt = (c, ...g) =>
			Je(this, [c, ...g], function* (p, w = {}) {
				return !w.force && !_t(p, w)
					? !1
					: (w.fromPage &&
							!l1(w.fromPage, ee.value) &&
							(zt({ id: i.value, hideDelay: 0 }),
							w.view && (pb("view", 10), (u.value = w.view)),
							yield Xe(S(_({}, w), { page: w.fromPage, position: 1, force: !0 })),
							r("did-move", d.value)),
						!0);
			}),
		Yt = (p, w = {}) => kt(Kt(p), w),
		Gt = () => Yt(-H.value),
		Tt = () => Yt(H.value),
		Pt = (p) => {
			const w = ae.value ? ".in-month" : "",
				c = `.id-${b.value.getDayId(p)}${w}`,
				g = `${c}.vc-focusable, ${c} .vc-focusable`,
				k = n.value;
			if (k) {
				const F = k.querySelector(g);
				if (F) return (F.focus(), !0);
			}
			return !1;
		},
		Zt = (c, ...g) =>
			Je(this, [c, ...g], function* (p, w = {}) {
				return Pt(p) ? !0 : (yield kt(p, w), Pt(p));
			}),
		Ir = (p, w) => {
			((s.value = p.day), r("dayclick", p, w));
		},
		Ar = (p, w) => {
			r("daymouseenter", p, w);
		},
		Ct = (p, w) => {
			r("daymouseleave", p, w);
		},
		Er = (p, w) => {
			((s.value = p.day), (a.value = p), (p.isFocused = !0), r("dayfocusin", p, w));
		},
		qt = (p, w) => {
			((a.value = null), (p.isFocused = !1), r("dayfocusout", p, w));
		},
		Xt = (p, w) => {
			r("daykeydown", p, w);
			const c = p.noonDate;
			let g = null;
			switch (w.key) {
				case "ArrowLeft": {
					g = ge(c, -1);
					break;
				}
				case "ArrowRight": {
					g = ge(c, 1);
					break;
				}
				case "ArrowUp": {
					g = ge(c, -7);
					break;
				}
				case "ArrowDown": {
					g = ge(c, 7);
					break;
				}
				case "Home": {
					g = ge(c, -p.weekdayPosition + 1);
					break;
				}
				case "End": {
					g = ge(c, p.weekdayPositionFromEnd);
					break;
				}
				case "PageUp": {
					w.altKey ? (g = Ms(c, -1)) : (g = Mr(c, -1));
					break;
				}
				case "PageDown": {
					w.altKey ? (g = Ms(c, 1)) : (g = Mr(c, 1));
					break;
				}
			}
			g && (w.preventDefault(), Zt(g).catch());
		},
		Nr = (p) => {
			const w = a.value;
			w != null && Xt(w, p);
		},
		Jt = (p, w) => {
			r("weeknumberclick", p, w);
		};
	(Xe({ page: e.initialPage, position: e.initialPagePosition }),
		nr(() => {
			!e.disablePageSwipe &&
				n.value &&
				(h = mb(
					n.value,
					({ toLeft: p = !1, toRight: w = !1 }) => {
						p ? Tt() : w && Gt();
					},
					Ke("touch"),
				));
		}),
		Fr(() => {
			((d.value = []), h && h());
		}),
		me(
			() => b.value,
			() => {
				Xe();
			},
		),
		me(
			() => x.value,
			() => Xe(),
		),
		me(
			() => e.view,
			() => (u.value = e.view),
		),
		me(
			() => u.value,
			() => {
				(yb("view", () => {
					Xe();
				}),
					r("update:view", u.value));
			},
		),
		me(
			() => s.value,
			() => {
				Te(d.value, (p) => Z(p));
			},
		),
		An(() => {
			(r("update:pages", d.value),
				Te(d.value, (p) => {
					(ve(p), Z(p));
				}));
		}));
	const Qt = {
		emit: r,
		containerRef: n,
		focusedDay: a,
		inTransition: o,
		navPopoverId: i,
		dayPopoverId: l,
		view: u,
		pages: d,
		transitionName: f,
		theme: D,
		color: T,
		displayMode: M,
		locale: b,
		masks: L,
		attributes: he,
		disabledAttribute: N,
		disabledDates: Q,
		attributeContext: Fe,
		days: Pe,
		dayCells: Ze,
		count: x,
		step: H,
		firstPage: ee,
		lastPage: se,
		canMovePrev: Or,
		canMoveNext: Sr,
		minPage: te,
		maxPage: I,
		isMonthly: ae,
		isWeekly: fe,
		isDaily: be,
		navVisibility: j,
		showWeeknumbers: q,
		showIsoWeeknumbers: A,
		getDateAddress: O,
		canMove: _t,
		canMoveBy: Mt,
		move: kt,
		moveBy: Yt,
		movePrev: Gt,
		moveNext: Tt,
		onTransitionBeforeEnter: ie,
		onTransitionAfterEnter: $,
		tryFocusDate: Pt,
		focusDate: Zt,
		onKeydown: Nr,
		onDayKeydown: Xt,
		onDayClick: Ir,
		onDayMouseenter: Ar,
		onDayMouseleave: Ct,
		onDayFocusin: Er,
		onDayFocusout: qt,
		onWeeknumberClick: Jt,
	};
	return (It(io, Qt), Qt);
}
function st() {
	const e = St(io);
	if (e) return e;
	throw new Error(
		"Calendar context missing. Please verify this component is nested within a valid context provider.",
	);
}
const Ib = oe({
		inheritAttrs: !1,
		emits: ["before-show", "after-show", "before-hide", "after-hide"],
		props: {
			id: { type: [Number, String, Symbol], required: !0 },
			showDelay: { type: Number, default: 0 },
			hideDelay: { type: Number, default: 110 },
			boundarySelector: { type: String },
		},
		setup(e, { emit: t }) {
			let r;
			const n = X();
			let a = null,
				s = null;
			const o = xr({
				isVisible: !1,
				target: null,
				data: null,
				transition: "slide-fade",
				placement: "bottom",
				direction: "",
				positionFixed: !1,
				modifiers: [],
				isInteractive: !0,
				visibility: "click",
				isHovered: !1,
				isFocused: !1,
				autoHide: !1,
				force: !1,
			});
			function i($) {
				$ && (o.direction = $.split("-")[0]);
			}
			function l({ placement: $, options: R }) {
				i($ || (R == null ? void 0 : R.placement));
			}
			const u = m(() => ({
					placement: o.placement,
					strategy: o.positionFixed ? "fixed" : "absolute",
					boundary: "",
					modifiers: [
						{ name: "onUpdate", enabled: !0, phase: "afterWrite", fn: l },
						...(o.modifiers || []),
					],
					onFirstUpdate: l,
				})),
				d = m(() => {
					const $ = o.direction === "left" || o.direction === "right";
					let R = "";
					if (o.placement) {
						const O = o.placement.split("-");
						O.length > 1 && (R = O[1]);
					}
					return ["start", "top", "left"].includes(R)
						? $
							? "top"
							: "left"
						: ["end", "bottom", "right"].includes(R)
							? $
								? "bottom"
								: "right"
							: $
								? "middle"
								: "center";
				});
			function f() {
				s && (s.destroy(), (s = null));
			}
			function v() {
				At(() => {
					const $ = yr(o.target);
					!$ ||
						!n.value ||
						(s && s.state.elements.reference !== $ && f(),
						s ? s.update() : (s = Do($, n.value, u.value)));
				});
			}
			function h($) {
				Object.assign(o, ds($, "force"));
			}
			function D($, R) {
				(clearTimeout(r), $ > 0 ? (r = setTimeout(R, $)) : R());
			}
			function T($) {
				return !$ || !s ? !1 : yr($) === s.state.elements.reference;
			}
			function M() {
				return Je(this, arguments, function* ($ = {}) {
					var R;
					o.force ||
						($.force && (o.force = !0),
						D((R = $.showDelay) != null ? R : e.showDelay, () => {
							(o.isVisible && (o.force = !1),
								h(S(_({}, $), { isVisible: !0 })),
								v());
						}));
				});
			}
			function b($ = {}) {
				var R;
				!s ||
					($.target && !T($.target)) ||
					o.force ||
					($.force && (o.force = !0),
					D((R = $.hideDelay) != null ? R : e.hideDelay, () => {
						(o.isVisible || (o.force = !1), (o.isVisible = !1));
					}));
			}
			function L($ = {}) {
				$.target != null && (o.isVisible && T($.target) ? b($) : M($));
			}
			function z($) {
				if (!s) return;
				const R = s.state.elements.reference;
				if (!n.value || !R) return;
				const O = $.target;
				gr(n.value, O) || gr(R, O) || b({ force: !0 });
			}
			function E($) {
				($.key === "Esc" || $.key === "Escape") && b();
			}
			function N({ detail: $ }) {
				!$.id || $.id !== e.id || M($);
			}
			function Q({ detail: $ }) {
				!$.id || $.id !== e.id || b($);
			}
			function x({ detail: $ }) {
				!$.id || $.id !== e.id || L($);
			}
			function H() {
				(Ve(document, "keydown", E),
					Ve(document, "click", z),
					Ve(document, "show-popover", N),
					Ve(document, "hide-popover", Q),
					Ve(document, "toggle-popover", x));
			}
			function ee() {
				(Ue(document, "keydown", E),
					Ue(document, "click", z),
					Ue(document, "show-popover", N),
					Ue(document, "hide-popover", Q),
					Ue(document, "toggle-popover", x));
			}
			function se($) {
				t("before-show", $);
			}
			function te($) {
				((o.force = !1), t("after-show", $));
			}
			function I($) {
				t("before-hide", $);
			}
			function j($) {
				((o.force = !1), f(), t("after-hide", $));
			}
			function q($) {
				$.stopPropagation();
			}
			function A() {
				((o.isHovered = !0),
					o.isInteractive && ["hover", "hover-focus"].includes(o.visibility) && M());
			}
			function ae() {
				if (((o.isHovered = !1), !s)) return;
				const $ = s.state.elements.reference;
				o.autoHide &&
					!o.isFocused &&
					(!$ || $ !== document.activeElement) &&
					["hover", "hover-focus"].includes(o.visibility) &&
					b();
			}
			function fe() {
				((o.isFocused = !0),
					o.isInteractive && ["focus", "hover-focus"].includes(o.visibility) && M());
			}
			function be($) {
				["focus", "hover-focus"].includes(o.visibility) &&
					(!$.relatedTarget || !gr(n.value, $.relatedTarget)) &&
					((o.isFocused = !1), !o.isHovered && o.autoHide && b());
			}
			function ie() {
				a != null && (a.disconnect(), (a = null));
			}
			return (
				me(
					() => n.value,
					($) => {
						(ie(),
							!!$ &&
								((a = new ResizeObserver(() => {
									s && s.update();
								})),
								a.observe($)));
					},
				),
				me(() => o.placement, i, { immediate: !0 }),
				nr(() => {
					H();
				}),
				Fr(() => {
					(f(), ie(), ee());
				}),
				S(_({}, bo(o)), {
					popoverRef: n,
					alignment: d,
					hide: b,
					setupPopper: v,
					beforeEnter: se,
					afterEnter: te,
					beforeLeave: I,
					afterLeave: j,
					onClick: q,
					onMouseOver: A,
					onMouseLeave: ae,
					onFocusIn: fe,
					onFocusOut: be,
				})
			);
		},
	}),
	ot = (e, t) => {
		const r = e.__vccOpts || e;
		for (const [n, a] of t) r[n] = a;
		return r;
	};
function Ab(e, t, r, n, a, s) {
	return (
		Y(),
		C(
			"div",
			{
				class: J(["vc-popover-content-wrapper", { "is-interactive": e.isInteractive }]),
				ref: "popoverRef",
				onClick: t[0] || (t[0] = (...o) => e.onClick && e.onClick(...o)),
				onMouseover: t[1] || (t[1] = (...o) => e.onMouseOver && e.onMouseOver(...o)),
				onMouseleave: t[2] || (t[2] = (...o) => e.onMouseLeave && e.onMouseLeave(...o)),
				onFocusin: t[3] || (t[3] = (...o) => e.onFocusIn && e.onFocusIn(...o)),
				onFocusout: t[4] || (t[4] = (...o) => e.onFocusOut && e.onFocusOut(...o)),
			},
			[
				B(
					Fn,
					{
						name: `vc-${e.transition}`,
						appear: "",
						onBeforeEnter: e.beforeEnter,
						onAfterEnter: e.afterEnter,
						onBeforeLeave: e.beforeLeave,
						onAfterLeave: e.afterLeave,
					},
					{
						default: re(() => [
							e.isVisible
								? (Y(),
									C(
										"div",
										Et(
											{
												key: 0,
												tabindex: "-1",
												class: `vc-popover-content direction-${e.direction}`,
											},
											e.$attrs,
										),
										[
											ar(
												e.$slots,
												"default",
												{
													direction: e.direction,
													alignment: e.alignment,
													data: e.data,
													hide: e.hide,
												},
												() => [Rr(pe(e.data), 1)],
											),
											W(
												"span",
												{
													class: J([
														"vc-popover-caret",
														`direction-${e.direction}`,
														`align-${e.alignment}`,
													]),
												},
												null,
												2,
											),
										],
										16,
									))
								: ne("", !0),
						]),
						_: 3,
					},
					8,
					["name", "onBeforeEnter", "onAfterEnter", "onBeforeLeave", "onAfterLeave"],
				),
			],
			34,
		)
	);
}
const Yn = ot(Ib, [["render", Ab]]),
	Eb = { class: "vc-day-popover-row" },
	Nb = { key: 0, class: "vc-day-popover-row-indicator" },
	Lb = { class: "vc-day-popover-row-label" },
	xb = oe({
		__name: "PopoverRow",
		props: { attribute: null },
		setup(e) {
			const t = e,
				r = m(() => {
					const { content: n, highlight: a, dot: s, bar: o, popover: i } = t.attribute;
					return i && i.hideIndicator
						? null
						: n
							? { class: `vc-bar vc-day-popover-row-bar vc-attr vc-${n.base.color}` }
							: a
								? {
										class: `vc-highlight-bg-solid vc-day-popover-row-highlight vc-attr vc-${a.base.color}`,
									}
								: s
									? { class: `vc-dot vc-attr vc-${s.base.color}` }
									: o
										? {
												class: `vc-bar vc-day-popover-row-bar vc-attr vc-${o.base.color}`,
											}
										: null;
				});
			return (n, a) => (
				Y(),
				C("div", Eb, [
					y(r)
						? (Y(), C("div", Nb, [W("span", { class: J(y(r).class) }, null, 2)]))
						: ne("", !0),
					W("div", Lb, [
						ar(n.$slots, "default", {}, () => [
							Rr(
								pe(
									e.attribute.popover
										? e.attribute.popover.label
										: "No content provided",
								),
								1,
							),
						]),
					]),
				])
			);
		},
	}),
	Fb = { inheritAttrs: !1 },
	Ye = oe(
		S(_({}, Fb), {
			__name: "CalendarSlot",
			props: { name: null },
			setup(e) {
				const r = oo(e.name);
				return (n, a) =>
					y(r)
						? (Y(), De(Nn(y(r)), En(Et({ key: 0 }, n.$attrs)), null, 16))
						: ar(n.$slots, "default", { key: 1 });
			},
		}),
	),
	Rb = { class: "vc-day-popover-container" },
	Hb = { key: 0, class: "vc-day-popover-header" },
	Wb = oe({
		__name: "CalendarDayPopover",
		setup(e) {
			const { dayPopoverId: t, displayMode: r, color: n, masks: a, locale: s } = st();
			function o(l, u) {
				return s.value.formatDate(l, u);
			}
			function i(l) {
				return s.value.formatDate(l.date, a.value.dayPopover);
			}
			return (l, u) => (
				Y(),
				De(
					Yn,
					{ id: y(t), class: J([`vc-${y(n)}`, `vc-${y(r)}`]) },
					{
						default: re(({ data: { day: d, attributes: f }, hide: v }) => [
							B(
								Ye,
								{
									name: "day-popover",
									day: d,
									"day-title": i(d),
									attributes: f,
									format: o,
									masks: y(a),
									hide: v,
								},
								{
									default: re(() => [
										W("div", Rb, [
											y(a).dayPopover
												? (Y(), C("div", Hb, pe(i(d)), 1))
												: ne("", !0),
											(Y(!0),
											C(
												ue,
												null,
												Me(
													f,
													(h) => (
														Y(),
														De(
															xb,
															{ key: h.key, attribute: h },
															null,
															8,
															["attribute"],
														)
													),
												),
												128,
											)),
										]),
									]),
									_: 2,
								},
								1032,
								["day", "day-title", "attributes", "masks", "hide"],
							),
						]),
						_: 1,
					},
					8,
					["id", "class"],
				)
			);
		},
	}),
	jb = {},
	Bb = { "stroke-linecap": "round", "stroke-linejoin": "round", viewBox: "0 0 24 24" },
	zb = W("polyline", { points: "9 18 15 12 9 6" }, null, -1),
	Ub = [zb];
function Vb(e, t) {
	return (Y(), C("svg", Bb, Ub));
}
const Kb = ot(jb, [["render", Vb]]),
	Gb = {},
	Zb = { "stroke-linecap": "round", "stroke-linejoin": "round", viewBox: "0 0 24 24" },
	qb = W("polyline", { points: "15 18 9 12 15 6" }, null, -1),
	Xb = [qb];
function Jb(e, t) {
	return (Y(), C("svg", Zb, Xb));
}
const Qb = ot(Gb, [["render", Jb]]),
	eD = {},
	tD = { "stroke-linecap": "round", "stroke-linejoin": "round", viewBox: "0 0 24 24" },
	rD = W("polyline", { points: "6 9 12 15 18 9" }, null, -1),
	nD = [rD];
function aD(e, t) {
	return (Y(), C("svg", tD, nD));
}
const sD = ot(eD, [["render", aD]]),
	oD = {},
	iD = {
		fill: "none",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"stroke-width": "2",
		viewBox: "0 0 24 24",
	},
	lD = W("path", { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }, null, -1),
	uD = [lD];
function cD(e, t) {
	return (Y(), C("svg", iD, uD));
}
const dD = ot(oD, [["render", cD]]),
	fD = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				IconChevronDown: sD,
				IconChevronLeft: Qb,
				IconChevronRight: Kb,
				IconClock: dD,
			},
			Symbol.toStringTag,
			{ value: "Module" },
		),
	),
	$t = oe({
		__name: "BaseIcon",
		props: {
			name: { type: String, required: !0 },
			width: { type: String },
			height: { type: String },
			size: { type: String, default: "26" },
			viewBox: { type: String },
		},
		setup(e) {
			const t = e,
				r = m(() => t.width || t.size),
				n = m(() => t.height || t.size),
				a = m(() => fD[`Icon${t.name}`]);
			return (s, o) => (
				Y(),
				De(Nn(y(a)), { width: y(r), height: y(n), class: "vc-base-icon" }, null, 8, [
					"width",
					"height",
				])
			);
		},
	}),
	vD = ["disabled"],
	hD = { key: 1, class: "vc-title-wrapper" },
	mD = { type: "button", class: "vc-title" },
	pD = ["disabled"],
	lo = oe({
		__name: "CalendarHeader",
		props: {
			page: null,
			layout: null,
			isLg: { type: Boolean },
			isXl: { type: Boolean },
			is2xl: { type: Boolean },
			hideTitle: { type: Boolean },
			hideArrows: { type: Boolean },
		},
		setup(e) {
			const t = e,
				{
					navPopoverId: r,
					navVisibility: n,
					canMovePrev: a,
					movePrev: s,
					canMoveNext: o,
					moveNext: i,
				} = st(),
				l = m(() => {
					switch (t.page.titlePosition) {
						case "left":
							return "bottom-start";
						case "right":
							return "bottom-end";
						default:
							return "bottom";
					}
				}),
				u = m(() => {
					const { page: T } = t;
					return {
						id: r.value,
						visibility: n.value,
						placement: l.value,
						modifiers: [{ name: "flip", options: { fallbackPlacements: ["bottom"] } }],
						data: { page: T },
						isInteractive: !0,
					};
				}),
				d = m(() => t.page.titlePosition.includes("left")),
				f = m(() => t.page.titlePosition.includes("right")),
				v = m(() =>
					t.layout ? t.layout : d.value ? "tu-pn" : f.value ? "pn-tu" : "p-tu-n;",
				),
				h = m(() => ({
					prev: v.value.includes("p") && !t.hideArrows,
					title: v.value.includes("t") && !t.hideTitle,
					next: v.value.includes("n") && !t.hideArrows,
				})),
				D = m(() => ({
					gridTemplateColumns: v.value
						.split("")
						.map((M) => {
							switch (M) {
								case "p":
									return "[prev] auto";
								case "n":
									return "[next] auto";
								case "t":
									return "[title] auto";
								case "-":
									return "1fr";
								default:
									return "";
							}
						})
						.join(" "),
				}));
			return (T, M) => (
				Y(),
				C(
					"div",
					{
						class: J([
							"vc-header",
							{ "is-lg": e.isLg, "is-xl": e.isXl, "is-2xl": e.is2xl },
						]),
						style: Nt(y(D)),
					},
					[
						y(h).prev
							? (Y(),
								C(
									"button",
									{
										key: 0,
										type: "button",
										class: "vc-arrow vc-prev vc-focus",
										disabled: !y(a),
										onClick: M[0] || (M[0] = (...b) => y(s) && y(s)(...b)),
										onKeydown:
											M[1] ||
											(M[1] = Ln(
												(...b) => y(s) && y(s)(...b),
												["space", "enter"],
											)),
									},
									[
										B(
											Ye,
											{ name: "header-prev-button", disabled: !y(a) },
											{
												default: re(() => [
													B($t, { name: "ChevronLeft", size: "24" }),
												]),
												_: 1,
											},
											8,
											["disabled"],
										),
									],
									40,
									vD,
								))
							: ne("", !0),
						y(h).title
							? (Y(),
								C("div", hD, [
									B(
										Ye,
										{ name: "header-title-wrapper" },
										{
											default: re(() => [
												xn(
													(Y(),
													C("button", mD, [
														B(
															Ye,
															{
																name: "header-title",
																title: e.page.title,
															},
															{
																default: re(() => [
																	W(
																		"span",
																		null,
																		pe(e.page.title),
																		1,
																	),
																]),
																_: 1,
															},
															8,
															["title"],
														),
													])),
													[[y(Qs), y(u)]],
												),
											]),
											_: 1,
										},
									),
								]))
							: ne("", !0),
						y(h).next
							? (Y(),
								C(
									"button",
									{
										key: 2,
										type: "button",
										class: "vc-arrow vc-next vc-focus",
										disabled: !y(o),
										onClick: M[2] || (M[2] = (...b) => y(i) && y(i)(...b)),
										onKeydown:
											M[3] ||
											(M[3] = Ln(
												(...b) => y(i) && y(i)(...b),
												["space", "enter"],
											)),
									},
									[
										B(
											Ye,
											{ name: "header-next-button", disabled: !y(o) },
											{
												default: re(() => [
													B($t, { name: "ChevronRight", size: "24" }),
												]),
												_: 1,
											},
											8,
											["disabled"],
										),
									],
									40,
									pD,
								))
							: ne("", !0),
					],
					6,
				)
			);
		},
	}),
	uo = Symbol("__vc_page_context__");
function yD(e) {
	const { locale: t, getDateAddress: r, canMove: n } = st();
	function a(i, l) {
		const { month: u, year: d } = r(new Date());
		return Us().map((f, v) => {
			const h = v + 1;
			return {
				month: h,
				year: i,
				id: o1(h, i),
				label: t.value.formatDate(f, l),
				ariaLabel: t.value.formatDate(f, "MMMM"),
				isActive: h === e.value.month && i === e.value.year,
				isCurrent: h === u && i === d,
				isDisabled: !n({ month: h, year: i }, { position: e.value.position }),
			};
		});
	}
	function s(i, l) {
		const { year: u } = r(new Date()),
			{ position: d } = e.value,
			f = [];
		for (let v = i; v <= l; v += 1) {
			const h = [...Array(12).keys()].some((D) =>
				n({ month: D + 1, year: v }, { position: d }),
			);
			f.push({
				year: v,
				id: v.toString(),
				label: v.toString(),
				ariaLabel: v.toString(),
				isActive: v === e.value.year,
				isCurrent: v === u,
				isDisabled: !h,
			});
		}
		return f;
	}
	const o = { page: e, getMonthItems: a, getYearItems: s };
	return (It(uo, o), o);
}
function co() {
	const e = St(uo);
	if (e) return e;
	throw new Error(
		"Page context missing. Please verify this component is nested within a valid context provider.",
	);
}
const gD = { class: "vc-nav-header" },
	bD = ["disabled"],
	DD = ["disabled"],
	wD = { class: "vc-nav-items" },
	$D = ["data-id", "aria-label", "disabled", "onClick", "onKeydown"],
	_D = oe({
		__name: "CalendarNav",
		setup(e) {
			const { masks: t, move: r } = st(),
				{ page: n, getMonthItems: a, getYearItems: s } = co(),
				o = X(!0),
				i = 12,
				l = X(n.value.year),
				u = X(v(n.value.year)),
				d = X(null);
			function f() {
				setTimeout(() => {
					if (d.value == null) return;
					const O = d.value.querySelector(".vc-nav-item:not(:disabled)");
					O && O.focus();
				}, 10);
			}
			function v(O) {
				return Math.floor(O / i);
			}
			function h() {
				o.value = !o.value;
			}
			function D(O) {
				return O * i;
			}
			function T(O) {
				return i * (O + 1) - 1;
			}
			function M() {
				!fe.value || (o.value && L(), E());
			}
			function b() {
				!be.value || (o.value && z(), N());
			}
			function L() {
				l.value--;
			}
			function z() {
				l.value++;
			}
			function E() {
				u.value--;
			}
			function N() {
				u.value++;
			}
			const Q = m(() =>
					a(l.value, t.value.navMonths).map((O) =>
						S(_({}, O), {
							click: () =>
								r(
									{ month: O.month, year: O.year },
									{ position: n.value.position },
								),
						}),
					),
				),
				x = m(() => a(l.value - 1, t.value.navMonths)),
				H = m(() => x.value.some((O) => !O.isDisabled)),
				ee = m(() => a(l.value + 1, t.value.navMonths)),
				se = m(() => ee.value.some((O) => !O.isDisabled)),
				te = m(() =>
					s(D(u.value), T(u.value)).map((O) =>
						S(_({}, O), {
							click: () => {
								((l.value = O.year), (o.value = !0), f());
							},
						}),
					),
				),
				I = m(() => s(D(u.value - 1), T(u.value - 1))),
				j = m(() => I.value.some((O) => !O.isDisabled)),
				q = m(() => s(D(u.value + 1), T(u.value + 1))),
				A = m(() => q.value.some((O) => !O.isDisabled)),
				ae = m(() => (o.value ? Q.value : te.value)),
				fe = m(() => (o.value ? H.value : j.value)),
				be = m(() => (o.value ? se.value : A.value)),
				ie = m(() => ls(te.value.map((O) => O.year))),
				$ = m(() => pt(te.value.map((O) => O.year))),
				R = m(() => (o.value ? l.value : `${ie.value} - ${$.value}`));
			return (
				An(() => {
					((l.value = n.value.year), f());
				}),
				me(
					() => l.value,
					(O) => (u.value = v(O)),
				),
				nr(() => f()),
				(O, ve) => (
					Y(),
					C(
						"div",
						{ class: "vc-nav-container", ref_key: "navContainer", ref: d },
						[
							W("div", gD, [
								W(
									"button",
									{
										type: "button",
										class: "vc-nav-arrow is-left vc-focus",
										disabled: !y(fe),
										onClick: M,
										onKeydown: ve[0] || (ve[0] = (Z) => y(br)(Z, M)),
									},
									[
										B(
											Ye,
											{ name: "nav-prev-button", move: M, disabled: !y(fe) },
											{
												default: re(() => [
													B($t, {
														name: "ChevronLeft",
														width: "22px",
														height: "24px",
													}),
												]),
												_: 1,
											},
											8,
											["disabled"],
										),
									],
									40,
									bD,
								),
								W(
									"button",
									{
										type: "button",
										class: "vc-nav-title vc-focus",
										onClick: h,
										onKeydown: ve[1] || (ve[1] = (Z) => y(br)(Z, h)),
									},
									pe(y(R)),
									33,
								),
								W(
									"button",
									{
										type: "button",
										class: "vc-nav-arrow is-right vc-focus",
										disabled: !y(be),
										onClick: b,
										onKeydown: ve[2] || (ve[2] = (Z) => y(br)(Z, b)),
									},
									[
										B(
											Ye,
											{ name: "nav-next-button", move: b, disabled: !y(be) },
											{
												default: re(() => [
													B($t, {
														name: "ChevronRight",
														width: "22px",
														height: "24px",
													}),
												]),
												_: 1,
											},
											8,
											["disabled"],
										),
									],
									40,
									DD,
								),
							]),
							W("div", wD, [
								(Y(!0),
								C(
									ue,
									null,
									Me(
										y(ae),
										(Z) => (
											Y(),
											C(
												"button",
												{
													key: Z.label,
													type: "button",
													"data-id": Z.id,
													"aria-label": Z.ariaLabel,
													class: J([
														"vc-nav-item vc-focus",
														[
															Z.isActive
																? "is-active"
																: Z.isCurrent
																	? "is-current"
																	: "",
														],
													]),
													disabled: Z.isDisabled,
													onClick: Z.click,
													onKeydown: (Te) => y(br)(Te, Z.click),
												},
												pe(Z.label),
												43,
												$D,
											)
										),
									),
									128,
								)),
							]),
						],
						512,
					)
				)
			);
		},
	}),
	fo = oe({
		__name: "CalendarPageProvider",
		props: { page: null },
		setup(e) {
			return (yD(sr(e, "page")), (r, n) => ar(r.$slots, "default"));
		},
	}),
	MD = oe({
		__name: "CalendarNavPopover",
		setup(e) {
			const { navPopoverId: t, color: r, displayMode: n } = st();
			return (a, s) => (
				Y(),
				De(
					Yn,
					{
						id: y(t),
						class: J(["vc-nav-popover-container", `vc-${y(r)}`, `vc-${y(n)}`]),
					},
					{
						default: re(({ data: o }) => [
							B(
								fo,
								{ page: o.page },
								{
									default: re(() => [
										B(
											Ye,
											{ name: "nav" },
											{ default: re(() => [B(_D)]), _: 1 },
										),
									]),
									_: 2,
								},
								1032,
								["page"],
							),
						]),
						_: 1,
					},
					8,
					["id", "class"],
				)
			);
		},
	}),
	kD = oe({
		directives: { popover: Qs },
		components: { CalendarSlot: Ye },
		props: { day: { type: Object, required: !0 } },
		setup(e) {
			const {
					locale: t,
					theme: r,
					attributeContext: n,
					dayPopoverId: a,
					onDayClick: s,
					onDayMouseenter: o,
					onDayMouseleave: i,
					onDayFocusin: l,
					onDayFocusout: u,
					onDayKeydown: d,
				} = st(),
				f = m(() => e.day),
				v = m(() => n.value.getCells(f.value)),
				h = m(() => v.value.map((A) => A.data)),
				D = m(() => S(_({}, f.value), { attributes: h.value, attributeCells: v.value }));
			function T({ data: A }, { popovers: ae }) {
				const { key: fe, customData: be, popover: ie } = A;
				if (!ie) return;
				const $ = Ka({ key: fe, customData: be, attribute: A }, _({}, ie), {
					visibility: ie.label ? "hover" : "click",
					placement: "bottom",
					isInteractive: !ie.label,
				});
				ae.splice(0, 0, $);
			}
			const M = m(() => {
					const A = S(_({}, r.value.prepareRender({})), { popovers: [] });
					return (
						v.value.forEach((ae) => {
							(r.value.render(ae, A), T(ae, A));
						}),
						A
					);
				}),
				b = m(() => M.value.highlights),
				L = m(() => !!je(b.value)),
				z = m(() => M.value.content),
				E = m(() => M.value.dots),
				N = m(() => !!je(E.value)),
				Q = m(() => M.value.bars),
				x = m(() => !!je(Q.value)),
				H = m(() => M.value.popovers),
				ee = m(() => H.value.map((A) => A.attribute)),
				se = oo("day-content"),
				te = m(() => [
					"vc-day",
					...f.value.classes,
					{ "vc-day-box-center-center": !se },
					{ "is-not-in-month": !e.day.inMonth },
				]),
				I = m(() => {
					let A;
					f.value.isFocusable ? (A = "0") : (A = "-1");
					const ae = [
							"vc-day-content vc-focusable vc-focus vc-attr",
							{ "vc-disabled": f.value.isDisabled },
							nt(pt(b.value), "contentClass"),
							nt(pt(z.value), "class") || "",
						],
						fe = _(_({}, nt(pt(b.value), "contentStyle")), nt(pt(z.value), "style"));
					return {
						class: ae,
						style: fe,
						tabindex: A,
						"aria-label": f.value.ariaLabel,
						"aria-disabled": !!f.value.isDisabled,
						role: "button",
					};
				}),
				j = m(() => ({
					click(A) {
						s(D.value, A);
					},
					mouseenter(A) {
						o(D.value, A);
					},
					mouseleave(A) {
						i(D.value, A);
					},
					focusin(A) {
						l(D.value, A);
					},
					focusout(A) {
						u(D.value, A);
					},
					keydown(A) {
						d(D.value, A);
					},
				})),
				q = m(() =>
					je(H.value)
						? Ka({ id: a.value, data: { day: f, attributes: ee.value } }, ...H.value)
						: null,
				);
			return {
				attributes: h,
				attributeCells: v,
				bars: Q,
				dayClasses: te,
				dayContentProps: I,
				dayContentEvents: j,
				dayPopover: q,
				glyphs: M,
				dots: E,
				hasDots: N,
				hasBars: x,
				highlights: b,
				hasHighlights: L,
				locale: t,
				popovers: H,
			};
		},
	}),
	YD = { key: 0, class: "vc-highlights vc-day-layer" },
	TD = { key: 1, class: "vc-day-layer vc-day-box-center-bottom" },
	PD = { class: "vc-dots" },
	CD = { key: 2, class: "vc-day-layer vc-day-box-center-bottom" },
	OD = { class: "vc-bars" };
function SD(e, t, r, n, a, s) {
	const o = Qe("CalendarSlot"),
		i = $o("popover");
	return (
		Y(),
		C(
			"div",
			{ class: J(e.dayClasses) },
			[
				e.hasHighlights
					? (Y(),
						C("div", YD, [
							(Y(!0),
							C(
								ue,
								null,
								Me(
									e.highlights,
									({ key: l, wrapperClass: u, class: d, style: f }) => (
										Y(),
										C(
											"div",
											{ key: l, class: J(u) },
											[W("div", { class: J(d), style: Nt(f) }, null, 6)],
											2,
										)
									),
								),
								128,
							)),
						]))
					: ne("", !0),
				B(
					o,
					{
						name: "day-content",
						day: e.day,
						attributes: e.attributes,
						"attribute-cells": e.attributeCells,
						dayProps: e.dayContentProps,
						dayEvents: e.dayContentEvents,
						locale: e.locale,
					},
					{
						default: re(() => [
							xn(
								(Y(),
								C(
									"div",
									Et(e.dayContentProps, _o(e.dayContentEvents)),
									[Rr(pe(e.day.label), 1)],
									16,
								)),
								[[i, e.dayPopover]],
							),
						]),
						_: 1,
					},
					8,
					["day", "attributes", "attribute-cells", "dayProps", "dayEvents", "locale"],
				),
				e.hasDots
					? (Y(),
						C("div", TD, [
							W("div", PD, [
								(Y(!0),
								C(
									ue,
									null,
									Me(
										e.dots,
										({ key: l, class: u, style: d }) => (
											Y(),
											C(
												"span",
												{ key: l, class: J(u), style: Nt(d) },
												null,
												6,
											)
										),
									),
									128,
								)),
							]),
						]))
					: ne("", !0),
				e.hasBars
					? (Y(),
						C("div", CD, [
							W("div", OD, [
								(Y(!0),
								C(
									ue,
									null,
									Me(
										e.bars,
										({ key: l, class: u, style: d }) => (
											Y(),
											C(
												"span",
												{ key: l, class: J(u), style: Nt(d) },
												null,
												6,
											)
										),
									),
									128,
								)),
							]),
						]))
					: ne("", !0),
			],
			2,
		)
	);
}
const ID = ot(kD, [["render", SD]]),
	AD = { class: "vc-weekdays" },
	ED = ["onClick"],
	ND = { inheritAttrs: !1 },
	LD = oe(
		S(_({}, ND), {
			__name: "CalendarPage",
			setup(e) {
				const { page: t } = co(),
					{ onWeeknumberClick: r } = st();
				return (n, a) => (
					Y(),
					C(
						"div",
						{
							class: J([
								"vc-pane",
								`row-${y(t).row}`,
								`row-from-end-${y(t).rowFromEnd}`,
								`column-${y(t).column}`,
								`column-from-end-${y(t).columnFromEnd}`,
							]),
							ref: "pane",
						},
						[
							B(lo, { page: y(t), "is-lg": "", "hide-arrows": "" }, null, 8, [
								"page",
							]),
							W(
								"div",
								{
									class: J([
										"vc-weeks",
										{
											[`vc-show-weeknumbers-${y(t).weeknumberPosition}`]:
												y(t).weeknumberPosition,
										},
									]),
								},
								[
									W("div", AD, [
										(Y(!0),
										C(
											ue,
											null,
											Me(
												y(t).weekdays,
												({ weekday: s, label: o }, i) => (
													Y(),
													C(
														"div",
														{
															key: i,
															class: J(`vc-weekday vc-weekday-${s}`),
														},
														pe(o),
														3,
													)
												),
											),
											128,
										)),
									]),
									(Y(!0),
									C(
										ue,
										null,
										Me(
											y(t).viewWeeks,
											(s) => (
												Y(),
												C(
													"div",
													{
														key: `weeknumber-${s.weeknumber}`,
														class: "vc-week",
													},
													[
														y(t).weeknumberPosition
															? (Y(),
																C(
																	"div",
																	{
																		key: 0,
																		class: J([
																			"vc-weeknumber",
																			`is-${y(t).weeknumberPosition}`,
																		]),
																	},
																	[
																		W(
																			"span",
																			{
																				class: J([
																					"vc-weeknumber-content",
																				]),
																				onClick: (o) =>
																					y(r)(s, o),
																			},
																			pe(
																				s.weeknumberDisplay,
																			),
																			9,
																			ED,
																		),
																	],
																	2,
																))
															: ne("", !0),
														(Y(!0),
														C(
															ue,
															null,
															Me(
																s.days,
																(o) => (
																	Y(),
																	De(
																		ID,
																		{ key: o.id, day: o },
																		null,
																		8,
																		["day"],
																	)
																),
															),
															128,
														)),
													],
												)
											),
										),
										128,
									)),
								],
								2,
							),
						],
						2,
					)
				);
			},
		}),
	),
	xD = oe({
		components: {
			CalendarHeader: lo,
			CalendarPage: LD,
			CalendarNavPopover: MD,
			CalendarDayPopover: Wb,
			CalendarPageProvider: fo,
			CalendarSlot: Ye,
		},
		props: Cb,
		emit: Ob,
		setup(e, { emit: t, slots: r }) {
			return Sb(e, { emit: t, slots: r });
		},
	}),
	FD = { class: "vc-pane-header-wrapper" };
function RD(e, t, r, n, a, s) {
	const o = Qe("CalendarHeader"),
		i = Qe("CalendarPage"),
		l = Qe("CalendarSlot"),
		u = Qe("CalendarPageProvider"),
		d = Qe("CalendarDayPopover"),
		f = Qe("CalendarNavPopover");
	return (
		Y(),
		C(
			ue,
			null,
			[
				W(
					"div",
					Et(
						{
							"data-helptext":
								"Press the arrow keys to navigate by day, Home and End to navigate to week ends, PageUp and PageDown to navigate by month, Alt+PageUp and Alt+PageDown to navigate by year",
						},
						e.$attrs,
						{
							class: [
								"vc-container",
								`vc-${e.view}`,
								`vc-${e.color}`,
								`vc-${e.displayMode}`,
								{
									"vc-expanded": e.expanded,
									"vc-bordered": !e.borderless,
									"vc-transparent": e.transparent,
								},
							],
							onMouseup: t[0] || (t[0] = Mo(() => {}, ["prevent"])),
							ref: "containerRef",
						},
					),
					[
						W(
							"div",
							{
								class: J([
									"vc-pane-container",
									{ "in-transition": e.inTransition },
								]),
							},
							[
								W("div", FD, [
									e.firstPage
										? (Y(),
											De(
												o,
												{
													key: 0,
													page: e.firstPage,
													"is-lg": "",
													"hide-title": "",
												},
												null,
												8,
												["page"],
											))
										: ne("", !0),
								]),
								B(
									Fn,
									{
										name: `vc-${e.transitionName}`,
										onBeforeEnter: e.onTransitionBeforeEnter,
										onAfterEnter: e.onTransitionAfterEnter,
									},
									{
										default: re(() => [
											(Y(),
											C(
												"div",
												{
													key: e.pages[0].id,
													class: "vc-pane-layout",
													style: Nt({
														gridTemplateColumns: `repeat(${e.columns}, 1fr)`,
													}),
												},
												[
													(Y(!0),
													C(
														ue,
														null,
														Me(
															e.pages,
															(v) => (
																Y(),
																De(
																	u,
																	{ key: v.id, page: v },
																	{
																		default: re(() => [
																			B(
																				l,
																				{
																					name: "page",
																					page: v,
																				},
																				{
																					default: re(
																						() => [
																							B(i),
																						],
																					),
																					_: 2,
																				},
																				1032,
																				["page"],
																			),
																		]),
																		_: 2,
																	},
																	1032,
																	["page"],
																)
															),
														),
														128,
													)),
												],
												4,
											)),
										]),
										_: 1,
									},
									8,
									["name", "onBeforeEnter", "onAfterEnter"],
								),
								B(l, { name: "footer" }),
							],
							2,
						),
					],
					16,
				),
				B(d),
				B(f),
			],
			64,
		)
	);
}
const HD = ot(xD, [["render", RD]]),
	vo = Symbol("__vc_date_picker_context__"),
	WD = S(_({}, ro), {
		mode: { type: String, default: "date" },
		modelValue: { type: [Number, String, Date, Object] },
		modelModifiers: { type: Object, default: () => ({}) },
		rules: [String, Object],
		is24hr: Boolean,
		hideTimeHeader: Boolean,
		timeAccuracy: { type: Number, default: 2 },
		isRequired: Boolean,
		isRange: Boolean,
		updateOnInput: { type: Boolean, default: () => Ke("datePicker.updateOnInput") },
		inputDebounce: { type: Number, default: () => Ke("datePicker.inputDebounce") },
		popover: { type: [Boolean, Object], default: !0 },
		dragAttribute: Object,
		selectAttribute: Object,
		attributes: [Object, Array],
	}),
	jD = [
		"update:modelValue",
		"drag",
		"dayclick",
		"daykeydown",
		"popover-will-show",
		"popover-did-show",
		"popover-will-hide",
		"popover-did-hide",
	];
function BD(e, { emit: t, slots: r }) {
	var w;
	so(r, { footer: "dp-footer" });
	const n = no(e),
		{ locale: a, masks: s, disabledAttribute: o } = n,
		i = X(!1),
		l = X(Symbol()),
		u = X(null),
		d = X(null),
		f = X(["", ""]),
		v = X(null),
		h = X(null);
	let D,
		T,
		M = !0;
	const b = m(() => e.isRange || e.modelModifiers.range === !0),
		L = m(() => (b.value && u.value != null ? u.value.start : null)),
		z = m(() => (b.value && u.value != null ? u.value.end : null)),
		E = m(() => e.mode.toLowerCase() === "date"),
		N = m(() => e.mode.toLowerCase() === "datetime"),
		Q = m(() => e.mode.toLowerCase() === "time"),
		x = m(() => !!d.value),
		H = m(() => {
			let c = "date";
			(e.modelModifiers.number && (c = "number"), e.modelModifiers.string && (c = "string"));
			const g = s.value.modelValue || "iso";
			return ve({ type: c, mask: g });
		}),
		ee = m(() => {
			var c;
			return Mt((c = d.value) != null ? c : u.value);
		}),
		se = m(() =>
			Q.value
				? e.is24hr
					? s.value.inputTime24hr
					: s.value.inputTime
				: N.value
					? e.is24hr
						? s.value.inputDateTime24hr
						: s.value.inputDateTime
					: s.value.input,
		),
		te = m(() => /[Hh]/g.test(se.value)),
		I = m(() => /[dD]{1,2}|Do|W{1,4}|M{1,4}|YY(?:YY)?/g.test(se.value)),
		j = m(() => {
			if (te.value && I.value) return "dateTime";
			if (I.value) return "date";
			if (te.value) return "time";
		}),
		q = m(() => {
			var k;
			var c;
			const g =
				(k = (c = v.value) == null ? void 0 : c.$el.previousElementSibling) != null
					? k
					: void 0;
			return Ht({}, e.popover, Ke("datePicker.popover"), { target: g });
		}),
		A = m(() => qs(S(_({}, q.value), { id: l.value }))),
		ae = m(() => (b.value ? { start: f.value[0], end: f.value[1] } : f.value[0])),
		fe = m(() => {
			const c = ["start", "end"].map((g) =>
				_({ input: Xe(g), change: Kt(g), keyup: _t }, e.popover && A.value),
			);
			return b.value ? { start: c[0], end: c[1] } : c[0];
		}),
		be = m(() => {
			if (!he(u.value)) return null;
			const c = S(_({ key: "select-drag" }, e.selectAttribute), {
					dates: u.value,
					pinPage: !0,
				}),
				{ dot: g, bar: k, highlight: F, content: K } = c;
			return (!g && !k && !F && !K && (c.highlight = !0), c);
		}),
		ie = m(() => {
			if (!b.value || !he(d.value)) return null;
			const c = S(_({ key: "select-drag" }, e.dragAttribute), { dates: d.value }),
				{ dot: g, bar: k, highlight: F, content: K } = c;
			return (
				!g && !k && !F && !K && (c.highlight = { startEnd: { fillMode: "outline" } }),
				c
			);
		}),
		$ = m(() => {
			const c = ke(e.attributes) ? [...e.attributes] : [];
			return (ie.value ? c.unshift(ie.value) : be.value && c.unshift(be.value), c);
		}),
		R = m(() => {
			var c;
			return ve(e.rules === "auto" ? O() : (c = e.rules) != null ? c : {});
		});
	function O() {
		const c = { ms: [0, 999], sec: [0, 59], min: [0, 59], hr: [0, 23] },
			g = E.value ? 0 : e.timeAccuracy;
		return [0, 1].map((k) => {
			switch (g) {
				case 0:
					return {
						hours: c.hr[k],
						minutes: c.min[k],
						seconds: c.sec[k],
						milliseconds: c.ms[k],
					};
				case 1:
					return { minutes: c.min[k], seconds: c.sec[k], milliseconds: c.ms[k] };
				case 3:
					return { milliseconds: c.ms[k] };
				case 4:
					return {};
				default:
					return { seconds: c.sec[k], milliseconds: c.ms[k] };
			}
		});
	}
	function ve(c) {
		return ke(c) ? (c.length === 1 ? [c[0], c[0]] : c) : [c, c];
	}
	function Z(c) {
		return ve(c).map((g, k) => S(_({}, g), { rules: R.value[k] }));
	}
	function Te(c) {
		return c == null
			? !1
			: Se(c)
				? !isNaN(c)
				: yt(c)
					? !isNaN(c.getTime())
					: Ne(c)
						? c !== ""
						: Dn(c);
	}
	function Pe(c) {
		var g, k;
		return (
			We(c) &&
			"start" in c &&
			"end" in c &&
			Te((g = c.start) != null ? g : null) &&
			Te((k = c.end) != null ? k : null)
		);
	}
	function he(c) {
		return Pe(c) || Te(c);
	}
	function xe(c, g) {
		if (c == null && g == null) return !0;
		if (c == null || g == null) return !1;
		const k = yt(c),
			F = yt(g);
		return k && F
			? c.getTime() === g.getTime()
			: k || F
				? !1
				: xe(c.start, g.start) && xe(c.end, g.end);
	}
	function Fe(c) {
		return !he(c) || !o.value ? !1 : o.value.intersectsRange(a.value.range(c));
	}
	function Ze(c, g, k, F) {
		var K, le;
		if (!he(c)) return null;
		if (Pe(c)) {
			const we = a.value.toDate(
					c.start,
					S(_({}, g[0]), { fillDate: (K = L.value) != null ? K : void 0, patch: k }),
				),
				$e = a.value.toDate(
					c.end,
					S(_({}, g[1]), { fillDate: (le = z.value) != null ? le : void 0, patch: k }),
				);
			return qt({ start: we, end: $e }, F);
		}
		return a.value.toDateOrNull(c, S(_({}, g[0]), { fillDate: u.value, patch: k }));
	}
	function qe(c, g) {
		return Pe(c)
			? { start: a.value.fromDate(c.start, g[0]), end: a.value.fromDate(c.end, g[1]) }
			: b.value
				? null
				: a.value.fromDate(c, g[0]);
	}
	function Ie(c, g = {}) {
		return (
			clearTimeout(D),
			new Promise((k) => {
				const le = g,
					{ debounce: F = 0 } = le,
					K = In(le, ["debounce"]);
				F > 0
					? (D = window.setTimeout(() => {
							k(Re(c, K));
						}, F))
					: k(Re(c, K));
			})
		);
	}
	function Re(
		c,
		{
			config: g = H.value,
			patch: k = "dateTime",
			clearIfEqual: F = !1,
			formatInput: K = !0,
			hidePopover: le = !1,
			dragging: we = x.value,
			targetPriority: $e,
			moveToValue: Lr = !1,
		} = {},
	) {
		const Ot = Z(g);
		let _e = Ze(c, Ot, k, $e);
		if (Fe(_e)) {
			if (we) return null;
			((_e = u.value), (le = !1));
		} else
			_e == null && e.isRequired
				? (_e = u.value)
				: _e != null && xe(u.value, _e) && F && (_e = null);
		const lt = we ? d : u,
			er = !xe(lt.value, _e);
		((lt.value = _e), we || (d.value = null));
		const tr = qe(_e, H.value);
		return (
			er && ((M = !1), t(we ? "drag" : "update:modelValue", tr), At(() => (M = !0))),
			le && !we && Ct(),
			K && it(),
			Lr && At(() => Jt($e != null ? $e : "start")),
			tr
		);
	}
	function it() {
		At(() => {
			var k;
			const c = Z({ type: "string", mask: se.value }),
				g = qe((k = d.value) != null ? k : u.value, c);
			b.value ? (f.value = [g && g.start, g && g.end]) : (f.value = [g, ""]);
		});
	}
	function Vt(c, g, k) {
		f.value.splice(g === "start" ? 0 : 1, 1, c);
		const F = b.value ? { start: f.value[0], end: f.value[1] || f.value[0] } : c,
			K = { type: "string", mask: se.value };
		Ie(F, S(_({}, k), { config: K, patch: j.value, targetPriority: g, moveToValue: !0 }));
	}
	function Xe(c) {
		return (g) => {
			!e.updateOnInput ||
				Vt(g.currentTarget.value, c, {
					formatInput: !1,
					hidePopover: !1,
					debounce: e.inputDebounce,
				});
		};
	}
	function Kt(c) {
		return (g) => {
			Vt(g.currentTarget.value, c, { formatInput: !0, hidePopover: !1 });
		};
	}
	function _t(c) {
		c.key === "Escape" && Ie(u.value, { formatInput: !0, hidePopover: !0 });
	}
	function Mt(c) {
		return b.value
			? [
					c && c.start ? a.value.getDateParts(c.start) : null,
					c && c.end ? a.value.getDateParts(c.end) : null,
				]
			: [c ? a.value.getDateParts(c) : null];
	}
	function Or() {
		((d.value = null), it());
	}
	function Sr(c) {
		t("popover-will-show", c);
	}
	function kt(c) {
		t("popover-did-show", c);
	}
	function Yt(c) {
		(Or(), t("popover-will-hide", c));
	}
	function Gt(c) {
		t("popover-did-hide", c);
	}
	function Tt(c) {
		const g = { patch: "date", formatInput: !0, hidePopover: !0 };
		if (b.value) {
			const k = !x.value;
			(k ? (T = { start: c.startDate, end: c.endDate }) : T != null && (T.end = c.date),
				Ie(T, S(_({}, g), { dragging: k })));
		} else Ie(c.date, S(_({}, g), { clearIfEqual: !e.isRequired }));
	}
	function Pt(c, g) {
		(Tt(c), t("dayclick", c, g));
	}
	function Zt(c, g) {
		switch (g.key) {
			case " ":
			case "Enter": {
				(Tt(c), g.preventDefault());
				break;
			}
			case "Escape":
				Ct();
		}
		t("daykeydown", c, g);
	}
	function Ir(c, g) {
		!x.value || T == null || ((T.end = c.date), Ie(qt(T), { patch: "date", formatInput: !0 }));
	}
	function Ar(c = {}) {
		_n(S(_(_({}, q.value), c), { isInteractive: !0, id: l.value }));
	}
	function Ct(c = {}) {
		zt(S(_(_({ hideDelay: 10, force: !0 }, q.value), c), { id: l.value }));
	}
	function Er(c) {
		Zs(S(_(_({}, q.value), c), { isInteractive: !0, id: l.value }));
	}
	function qt(c, g) {
		const { start: k, end: F } = c;
		if (k > F)
			switch (g) {
				case "start":
					return { start: k, end: k };
				case "end":
					return { start: F, end: F };
				default:
					return { start: F, end: k };
			}
		return { start: k, end: F };
	}
	function Xt(k) {
		return Je(this, arguments, function* (c, g = {}) {
			return h.value == null ? !1 : h.value.move(c, g);
		});
	}
	function Nr(k) {
		return Je(this, arguments, function* (c, g = {}) {
			return h.value == null ? !1 : h.value.moveBy(c, g);
		});
	}
	function Jt(k) {
		return Je(this, arguments, function* (c, g = {}) {
			const F = u.value;
			if (h.value == null || !he(F)) return !1;
			const K = c !== "end",
				le = K ? 1 : -1,
				we = Pe(F) ? (K ? F.start : F.end) : F,
				$e = ks(we, "monthly", a.value);
			return h.value.move($e, _({ position: le }, g));
		});
	}
	(me(
		() => e.isRange,
		(c) => {
			c &&
				console.warn(
					"The `is-range` prop will be deprecated in future releases. Please use the `range` modifier.",
				);
		},
		{ immediate: !0 },
	),
		me(
			() => b.value,
			() => {
				Re(null, { formatInput: !0 });
			},
		),
		me(
			() => se.value,
			() => it(),
		),
		me(
			() => e.modelValue,
			(c) => {
				!M || Re(c, { formatInput: !0, hidePopover: !1 });
			},
		),
		me(
			() => R.value,
			() => {
				We(e.rules) && Re(e.modelValue, { formatInput: !0, hidePopover: !1 });
			},
		),
		me(
			() => e.timezone,
			() => {
				Re(u.value, { formatInput: !0 });
			},
		));
	const Qt = ve(H.value);
	((u.value = Ze((w = e.modelValue) != null ? w : null, Qt, "dateTime")),
		nr(() => {
			Re(e.modelValue, { formatInput: !0, hidePopover: !1 });
		}),
		At(() => (i.value = !0)));
	const p = S(_({}, n), {
		showCalendar: i,
		datePickerPopoverId: l,
		popoverRef: v,
		popoverEvents: A,
		calendarRef: h,
		isRange: b,
		isTimeMode: Q,
		isDateTimeMode: N,
		is24hr: sr(e, "is24hr"),
		hideTimeHeader: sr(e, "hideTimeHeader"),
		timeAccuracy: sr(e, "timeAccuracy"),
		isDragging: x,
		inputValue: ae,
		inputEvents: fe,
		dateParts: ee,
		attributes: $,
		rules: R,
		move: Xt,
		moveBy: Nr,
		moveToValue: Jt,
		updateValue: Ie,
		showPopover: Ar,
		hidePopover: Ct,
		togglePopover: Er,
		onDayClick: Pt,
		onDayKeydown: Zt,
		onDayMouseEnter: Ir,
		onPopoverBeforeShow: Sr,
		onPopoverAfterShow: kt,
		onPopoverBeforeHide: Yt,
		onPopoverAfterHide: Gt,
	});
	return (It(vo, p), p);
}
function Tn() {
	const e = St(vo);
	if (e) return e;
	throw new Error(
		"DatePicker context missing. Please verify this component is nested within a valid context provider.",
	);
}
const zD = [
		{ value: 0, label: "12" },
		{ value: 1, label: "1" },
		{ value: 2, label: "2" },
		{ value: 3, label: "3" },
		{ value: 4, label: "4" },
		{ value: 5, label: "5" },
		{ value: 6, label: "6" },
		{ value: 7, label: "7" },
		{ value: 8, label: "8" },
		{ value: 9, label: "9" },
		{ value: 10, label: "10" },
		{ value: 11, label: "11" },
	],
	UD = [
		{ value: 12, label: "12" },
		{ value: 13, label: "1" },
		{ value: 14, label: "2" },
		{ value: 15, label: "3" },
		{ value: 16, label: "4" },
		{ value: 17, label: "5" },
		{ value: 18, label: "6" },
		{ value: 19, label: "7" },
		{ value: 20, label: "8" },
		{ value: 21, label: "9" },
		{ value: 22, label: "10" },
		{ value: 23, label: "11" },
	];
function VD(e) {
	const t = Tn(),
		{
			locale: r,
			isRange: n,
			isTimeMode: a,
			dateParts: s,
			rules: o,
			is24hr: i,
			hideTimeHeader: l,
			timeAccuracy: u,
			updateValue: d,
		} = t;
	function f(I) {
		I = Object.assign(h.value, I);
		let j = null;
		if (n.value) {
			const q = v.value ? I : s.value[0],
				A = v.value ? s.value[1] : I;
			j = { start: q, end: A };
		} else j = I;
		d(j, { patch: "time", targetPriority: v.value ? "start" : "end", moveToValue: !0 });
	}
	const v = m(() => e.position === 0),
		h = m(() => s.value[e.position] || { isValid: !1 }),
		D = m(() => Dn(h.value)),
		T = m(() => !!h.value.isValid),
		M = m(() => !l.value && T.value),
		b = m(() => {
			if (!D.value) return null;
			let I = r.value.toDate(h.value);
			return (h.value.hours === 24 && (I = new Date(I.getTime() - 1)), I);
		}),
		L = m({
			get() {
				return h.value.hours;
			},
			set(I) {
				f({ hours: I });
			},
		}),
		z = m({
			get() {
				return h.value.minutes;
			},
			set(I) {
				f({ minutes: I });
			},
		}),
		E = m({
			get() {
				return h.value.seconds;
			},
			set(I) {
				f({ seconds: I });
			},
		}),
		N = m({
			get() {
				return h.value.milliseconds;
			},
			set(I) {
				f({ milliseconds: I });
			},
		}),
		Q = m({
			get() {
				return h.value.hours < 12;
			},
			set(I) {
				I = String(I).toLowerCase() == "true";
				let j = L.value;
				(I && j >= 12 ? (j -= 12) : !I && j < 12 && (j += 12), f({ hours: j }));
			},
		}),
		x = m(() => cb(h.value, o.value[e.position])),
		H = m(() => zD.filter((I) => x.value.hours.some((j) => j.value === I.value))),
		ee = m(() => UD.filter((I) => x.value.hours.some((j) => j.value === I.value))),
		se = m(() => (i.value ? x.value.hours : Q.value ? H.value : ee.value)),
		te = m(() => {
			const I = [];
			return (
				je(H.value) && I.push({ value: !0, label: "AM" }),
				je(ee.value) && I.push({ value: !1, label: "PM" }),
				I
			);
		});
	return S(_({}, t), {
		showHeader: M,
		timeAccuracy: u,
		parts: h,
		isValid: T,
		date: b,
		hours: L,
		minutes: z,
		seconds: E,
		milliseconds: N,
		options: x,
		hourOptions: se,
		isAM: Q,
		isAMOptions: te,
		is24hr: i,
	});
}
const KD = ["value"],
	GD = ["value", "disabled"],
	ZD = { key: 1, class: "vc-base-sizer", "aria-hidden": "true" },
	qD = { inheritAttrs: !1 },
	Ut = oe(
		S(_({}, qD), {
			__name: "BaseSelect",
			props: {
				options: null,
				modelValue: null,
				alignRight: { type: Boolean },
				alignLeft: { type: Boolean },
				showIcon: { type: Boolean },
				fitContent: { type: Boolean },
			},
			emits: ["update:modelValue"],
			setup(e) {
				const t = e,
					r = m(() => {
						const n = t.options.find((a) => a.value === t.modelValue);
						return n == null ? void 0 : n.label;
					});
				return (n, a) => (
					Y(),
					C(
						"div",
						{
							class: J([
								"vc-base-select",
								{ "vc-fit-content": e.fitContent, "vc-has-icon": e.showIcon },
							]),
						},
						[
							W(
								"select",
								Et(n.$attrs, {
									value: e.modelValue,
									class: [
										"vc-focus",
										{
											"vc-align-right": e.alignRight,
											"vc-align-left": e.alignLeft,
										},
									],
									onChange:
										a[0] ||
										(a[0] = (s) =>
											n.$emit("update:modelValue", s.target.value)),
								}),
								[
									(Y(!0),
									C(
										ue,
										null,
										Me(
											e.options,
											(s) => (
												Y(),
												C(
													"option",
													{
														key: s.value,
														value: s.value,
														disabled: s.disabled,
													},
													pe(s.label),
													9,
													GD,
												)
											),
										),
										128,
									)),
								],
								16,
								KD,
							),
							e.showIcon
								? (Y(), De($t, { key: 0, name: "ChevronDown", size: "18" }))
								: ne("", !0),
							e.fitContent ? (Y(), C("div", ZD, pe(y(r)), 1)) : ne("", !0),
						],
						2,
					)
				);
			},
		}),
	),
	XD = { key: 0, class: "vc-time-header" },
	JD = { class: "vc-time-weekday" },
	QD = { class: "vc-time-month" },
	ew = { class: "vc-time-day" },
	tw = { class: "vc-time-year" },
	rw = { class: "vc-time-select-group" },
	nw = W("span", { class: "vc-time-colon" }, ":", -1),
	aw = W("span", { class: "vc-time-colon" }, ":", -1),
	sw = W("span", { class: "vc-time-decimal" }, ".", -1),
	ho = oe({
		__name: "TimePicker",
		props: { position: null },
		setup(e, { expose: t }) {
			const n = VD(e);
			t(n);
			const {
				locale: a,
				isValid: s,
				date: o,
				hours: i,
				minutes: l,
				seconds: u,
				milliseconds: d,
				options: f,
				hourOptions: v,
				isTimeMode: h,
				isAM: D,
				isAMOptions: T,
				is24hr: M,
				showHeader: b,
				timeAccuracy: L,
			} = n;
			return (z, E) => (
				Y(),
				C(
					"div",
					{
						class: J([
							"vc-time-picker",
							[{ "vc-invalid": !y(s), "vc-attached": !y(h) }],
						]),
					},
					[
						B(
							Ye,
							{ name: "time-header" },
							{
								default: re(() => [
									y(b) && y(o)
										? (Y(),
											C("div", XD, [
												W("span", JD, pe(y(a).formatDate(y(o), "WWW")), 1),
												W("span", QD, pe(y(a).formatDate(y(o), "MMM")), 1),
												W("span", ew, pe(y(a).formatDate(y(o), "D")), 1),
												W(
													"span",
													tw,
													pe(y(a).formatDate(y(o), "YYYY")),
													1,
												),
											]))
										: ne("", !0),
								]),
								_: 1,
							},
						),
						W("div", rw, [
							B($t, { name: "Clock", size: "17" }),
							B(
								Ut,
								{
									modelValue: y(i),
									"onUpdate:modelValue":
										E[0] || (E[0] = (N) => (Lt(i) ? (i.value = N) : null)),
									modelModifiers: { number: !0 },
									options: y(v),
									class: "vc-time-select-hours",
									"align-right": "",
								},
								null,
								8,
								["modelValue", "options"],
							),
							y(L) > 1
								? (Y(),
									C(
										ue,
										{ key: 0 },
										[
											nw,
											B(
												Ut,
												{
													modelValue: y(l),
													"onUpdate:modelValue":
														E[1] ||
														(E[1] = (N) =>
															Lt(l) ? (l.value = N) : null),
													modelModifiers: { number: !0 },
													options: y(f).minutes,
													class: "vc-time-select-minutes",
													"align-left": y(L) === 2,
												},
												null,
												8,
												["modelValue", "options", "align-left"],
											),
										],
										64,
									))
								: ne("", !0),
							y(L) > 2
								? (Y(),
									C(
										ue,
										{ key: 1 },
										[
											aw,
											B(
												Ut,
												{
													modelValue: y(u),
													"onUpdate:modelValue":
														E[2] ||
														(E[2] = (N) =>
															Lt(u) ? (u.value = N) : null),
													modelModifiers: { number: !0 },
													options: y(f).seconds,
													class: "vc-time-select-seconds",
													"align-left": y(L) === 3,
												},
												null,
												8,
												["modelValue", "options", "align-left"],
											),
										],
										64,
									))
								: ne("", !0),
							y(L) > 3
								? (Y(),
									C(
										ue,
										{ key: 2 },
										[
											sw,
											B(
												Ut,
												{
													modelValue: y(d),
													"onUpdate:modelValue":
														E[3] ||
														(E[3] = (N) =>
															Lt(d) ? (d.value = N) : null),
													modelModifiers: { number: !0 },
													options: y(f).milliseconds,
													class: "vc-time-select-milliseconds",
													"align-left": "",
												},
												null,
												8,
												["modelValue", "options"],
											),
										],
										64,
									))
								: ne("", !0),
							y(M)
								? ne("", !0)
								: (Y(),
									De(
										Ut,
										{
											key: 3,
											modelValue: y(D),
											"onUpdate:modelValue":
												E[4] ||
												(E[4] = (N) => (Lt(D) ? (D.value = N) : null)),
											options: y(T),
										},
										null,
										8,
										["modelValue", "options"],
									)),
						]),
					],
					2,
				)
			);
		},
	}),
	mo = oe({
		__name: "DatePickerBase",
		setup(e) {
			const {
					attributes: t,
					calendarRef: r,
					color: n,
					displayMode: a,
					isDateTimeMode: s,
					isTimeMode: o,
					isRange: i,
					onDayClick: l,
					onDayMouseEnter: u,
					onDayKeydown: d,
				} = Tn(),
				f = i.value ? [0, 1] : [0];
			return (v, h) =>
				y(o)
					? (Y(),
						C(
							"div",
							{ key: 0, class: J(`vc-container vc-bordered vc-${y(n)} vc-${y(a)}`) },
							[
								(Y(!0),
								C(
									ue,
									null,
									Me(
										y(f),
										(D) => (
											Y(),
											De(ho, { key: D, position: D }, null, 8, ["position"])
										),
									),
									128,
								)),
							],
							2,
						))
					: (Y(),
						De(
							HD,
							{
								key: 1,
								attributes: y(t),
								ref_key: "calendarRef",
								ref: r,
								onDayclick: y(l),
								onDaymouseenter: y(u),
								onDaykeydown: y(d),
							},
							{
								footer: re(() => [
									y(s)
										? (Y(!0),
											C(
												ue,
												{ key: 0 },
												Me(
													y(f),
													(D) => (
														Y(),
														De(ho, { key: D, position: D }, null, 8, [
															"position",
														])
													),
												),
												128,
											))
										: ne("", !0),
									B(Ye, { name: "dp-footer" }),
								]),
								_: 1,
							},
							8,
							["attributes", "onDayclick", "onDaymouseenter", "onDaykeydown"],
						));
		},
	}),
	ow = { inheritAttrs: !1 },
	iw = oe(
		S(_({}, ow), {
			__name: "DatePickerPopover",
			setup(e) {
				const {
					datePickerPopoverId: t,
					color: r,
					displayMode: n,
					popoverRef: a,
					onPopoverBeforeShow: s,
					onPopoverAfterShow: o,
					onPopoverBeforeHide: i,
					onPopoverAfterHide: l,
				} = Tn();
				return (u, d) => (
					Y(),
					De(
						Yn,
						{
							id: y(t),
							placement: "bottom-start",
							class: J(`vc-date-picker-content vc-${y(r)} vc-${y(n)}`),
							ref_key: "popoverRef",
							ref: a,
							onBeforeShow: y(s),
							onAfterShow: y(o),
							onBeforeHide: y(i),
							onAfterHide: y(l),
						},
						{ default: re(() => [B(mo, En(wo(u.$attrs)), null, 16)]), _: 1 },
						8,
						[
							"id",
							"class",
							"onBeforeShow",
							"onAfterShow",
							"onBeforeHide",
							"onAfterHide",
						],
					)
				);
			},
		}),
	);
oe({
	inheritAttrs: !1,
	emits: jD,
	props: WD,
	components: { DatePickerBase: mo, DatePickerPopover: iw },
	setup(e, t) {
		const r = BD(e, t),
			n = xr(ds(r, "calendarRef", "popoverRef"));
		return S(_({}, r), { slotCtx: n });
	},
});
export { HD as C };
