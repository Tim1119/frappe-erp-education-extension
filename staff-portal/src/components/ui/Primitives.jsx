import { Sparkles, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { cx, initials, badgeClass } from '../../utils/format';

export function Avatar({ name, color = '#2563eb', size = 30, round, src }) {
  if (src) {
    return (
      <div className={cx('av', round && 'av-ring')} style={{ width: size, height: size, borderRadius: round ? '50%' : undefined, overflow: 'hidden', flexShrink: 0 }}>
        <img src={src} alt={name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return <div className={cx('av', round && 'av-ring')} style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>{initials(name)}</div>;
}

export function StatusBadge({ s }) {
  return <span className={cx('badge', badgeClass(s))}><span className="bdot" style={{ background: 'currentColor' }} />{s || 'Unknown'}</span>;
}

// export function PageHeader({ eyebrow, title, sub, actions }) {
//   return <div className="ph"><div>{eyebrow && <div className="eyebrow"><Sparkles size={13} />{eyebrow}</div>}<h1>{title}</h1>{sub && <p>{sub}</p>}</div>{actions && <div style={{ display: 'flex', gap: 9, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{actions}</div>}</div>;
// }

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
  button,
}) {
  return (
    <div className="ph">
      <div>
        {eyebrow && (
          <div className="eyebrow">
            <Sparkles size={13} />
            {eyebrow}
          </div>
        )}

        <h1>{title}</h1>

        {sub && <p>{sub}</p>}
      </div>

      {(actions || button) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            marginLeft: "auto",
          }}
        >
          {actions}

          {button}
        </div>
      )}
    </div>
  );
}

export function StatCard({ ico: Ico, tone, value, label, delta, dir }) {
  const tones = {
    brand: ['var(--brand-soft)', 'var(--brand)'], green: ['var(--success-soft)', 'var(--success-ink)'],
    amber: ['var(--warning-soft)', 'var(--warning-ink)'], purple: ['var(--purple-soft)', 'var(--purple)'],
    red: ['var(--danger-soft)', 'var(--danger-ink)'], cyan: ['var(--brand-soft)', 'var(--brand-2)'],
  }[tone] || ['var(--surface-3)', 'var(--ink-2)'];
  return <div className="stat"><div className="stat-top"><div className="stat-ico" style={{ background: tones[0], color: tones[1] }}><Ico /></div>{delta && <span className={cx('delta', dir)}>{dir === 'up' ? <ArrowUp /> : dir === 'down' ? <ArrowDown /> : null}{delta}</span>}</div><div className="stat-val tnum">{value}</div><div className="stat-lab">{label}</div></div>;
}

export function EmptyState({ icon: Ico = CheckCircle2, title = 'Nothing here yet', sub = 'When records are available, they will appear here.' }) {
  return <div className="empty"><div className="eic"><Ico /></div><div style={{ fontWeight: 600 }}>{title}</div><p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{sub}</p></div>;
}

/** Monogram mark used across the login screen and sidebar — no external image asset required. */
export function LogoMark({ size = 26, mono }) {
  const id = 'lg' + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={id} x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor={mono ? '#fff' : '#2563EB'} />
          <stop offset="1" stopColor={mono ? '#dbeafe' : '#06B6D4'} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8.5" fill={`url(#${id})`} />
      <path d="M8 13.5L16 9l8 4.5-8 4.5-8-4.5Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M11.5 15.3v4.4c0 1.4 2 2.6 4.5 2.6s4.5-1.2 4.5-2.6v-4.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="brand">
      <LogoMark size={28} />
      <span className="brand-name">School Staff</span>
      <span className="brand-badge">Portal</span>
    </div>
  );
}
