import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarCheck, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LogoMark } from '../components/ui/Primitives';

export default function Login() {
  const { login } = useAuth();
  const { theme } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password, remember);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sync-root" data-theme={theme} style={{ minHeight: '100vh' }}>
      <div className="login">
        {/* Left art panel */}
        <div className="login-art">
          <div className="grid-tex" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <LogoMark size={34} mono />
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em' }}>School Staff Portal</span>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.1, maxWidth: 440 }}>
              Everything your school runs on, in one workspace.
            </div>
            <p style={{ opacity: .78, marginTop: 16, fontSize: 15, maxWidth: 420, lineHeight: 1.55 }}>
              Manage students, attendance, assessments, fees and staff — built for teachers and administrators on Frappe Education.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34, maxWidth: 420 }}>
              {[
                [GraduationCap, 'Full student lifecycle', 'From admission to school term results, in one place.'],
                [CalendarCheck, 'Fast daily attendance', 'Bulk mark a class in seconds, with a clean history.'],
                [BarChart3, 'Real-time insights', 'Attendance, performance and fee dashboards, always current.'],
              ].map(([Ic, t, d]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Ic size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t}</div>
                    <div style={{ opacity: .72, fontSize: 13, marginTop: 2 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, opacity: .5, fontSize: 12 }}>
            © {new Date().getFullYear()} School Staff Portal · Built for Frappe Education
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-form">
          <form className="login-card" onSubmit={submit}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20 }}>
                <LogoMark size={28} />
                <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.03em' }}>School Staff Portal</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.03em', margin: 0 }}>School Staff Portal</h1>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                Sign in to continue to your school administration workspace.
              </p>
            </div>

            <div className="field">
              <label className="label">Email</label>
              <div className="input-ico">
                <Mail />
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <div className="input-ico">
                  <Lock />
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: 44 }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-4)', padding: 4, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)', marginTop: -4, cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 15, height: 15 }} />
              Remember me
            </label>

            <button disabled={busy} className="btn btn-primary" style={{ width: '100%', height: 44, marginTop: 6 }}>
              {busy ? 'Signing in…' : 'Sign In'}
              {!busy && <ArrowRight size={16} />}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', marginTop: 22 }}>
              Sign in with your Frappe user account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
