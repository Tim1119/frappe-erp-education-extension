import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, Check, LogOut, Menu, Moon, Search, Settings, Sun, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Avatar, Logo } from '../ui/Primitives';
import { cx } from '../../utils/format';
import { getNavigation, pathFor, roleMeta, displayScope } from '../../config/appConfig';

const END_MATCH_KEYS = [
  'dashboard', 'students', 'student-groups', 'attendance', 'assessments',
  'results', 'schedule', 'teachers', 'guardians', 'fees', 'hr', 'reports', 'settings',
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useUI();
  const [sideOpen, setSideOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();
  const userRef = useRef(null);
  const meta = roleMeta.STAFF;
  const menu = getNavigation();
  const fullName = user?.full_name || meta.label;

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSideOpen(false); }, [navigate]);

  async function signOut() {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  }

  return (
    <div className="sync-root" data-theme={theme}>
      <div className="shell">
        {/* Mobile scrim */}
        {sideOpen && <div className="scrim" onClick={() => setSideOpen(false)} />}

        {/* Sidebar */}
        <aside className={cx('sidebar', sideOpen && 'open')}>
          <div className="side-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo />
            <button
              className="iconbtn"
              style={{ display: 'none' }}
              onClick={() => setSideOpen(false)}
              id="side-close-btn"
            >
              <X size={16} />
            </button>
          </div>

          <div className="side-scroll">
            {menu.map((grp) => (
              <div key={grp.g}>
                <div className="nav-label">{grp.g}</div>
                {grp.items.map(([key, label, Ic]) => (
                  <NavLink
                    key={key}
                    to={pathFor(key)}
                    end={END_MATCH_KEYS.includes(key)}
                    onClick={() => setSideOpen(false)}
                    className={({ isActive }) => cx('nav-item', isActive && 'active')}
                  >
                    <Ic />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          <div className="side-foot">
            <div className="card" style={{ padding: 12, background: 'var(--brand-soft)', border: 'none', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--brand)', fontWeight: 700 }}>✦</span>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--brand)' }}>Frappe Education</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 5, color: 'var(--brand)', opacity: 0.85 }}>
                Connected to your Frappe site.
              </div>
            </div>
            <button
              type="button"
              className="nav-item"
              onClick={signOut}
              style={{ width: '100%', border: 0, background: 'transparent' }}
            >
              <LogOut /><span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="appbg" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Topbar */}
          <div className="topbar">
            <button className="iconbtn menu-btn" onClick={() => setSideOpen(true)}>
              <Menu />
            </button>
            <button className="searchbtn" onClick={() => {}}>
              <Search size={16} />
              <span style={{ flex: 1, textAlign: 'left' }}>Search or jump to…</span>
              <span className="kbd">⌘K</span>
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="iconbtn hide-sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>

            <div style={{ position: 'relative' }} ref={userRef}>
              <div className="userchip" onClick={() => setUserOpen(!userOpen)}>
                <Avatar name={fullName} color={meta.color} size={32} round src={user?.photo_url} />
                <div className="hide-sm" style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{fullName}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{displayScope()}</div>
                </div>
                <ChevronDown size={15} style={{ color: 'var(--ink-3)' }} className="hide-sm" />
              </div>
              {userOpen && (
                <div className="rowmenu" style={{ right: 0, top: 46, minWidth: 240 }}>
                  <div className="cmdk-sec">Signed in as</div>
                  <button style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    <Avatar name={fullName} color={meta.color} size={22} round src={user?.photo_url} />
                    <span>{meta.label}</span>
                    <Check size={15} style={{ marginLeft: 'auto' }} />
                  </button>
                  <div className="divider" style={{ margin: '5px 0' }} />
                  <button onClick={() => { setUserOpen(false); navigate('/dashboard/settings'); }}>
                    <Settings />Account settings
                  </button>
                  <button className="danger" onClick={signOut}>
                    <LogOut />Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div className="content">
            <div className="wrap">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #side-close-btn { display: grid !important; }
        }
      `}</style>
    </div>
  );
}
