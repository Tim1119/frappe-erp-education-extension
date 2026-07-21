import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, size, children, footer }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'xl' ? 960 : size === 'lg' ? 720 : 540;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        fontFamily: 'var(--font, "Inter", system-ui, sans-serif)',
        animation: 'mFadeIn .15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface, #0f1117)',
          border: '1px solid var(--border-2, #282d3b)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05)',
          width: '100%',
          maxWidth: maxW,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'mSlideIn .18s ease',
          color: 'var(--ink, #f1f3f7)',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px 16px',
            borderBottom: '1px solid var(--border, #1f2330)',
            flexShrink: 0,
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.02em', color: 'var(--ink, #f1f3f7)' }}>
              {title}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 9,
                border: '1px solid var(--border, #1f2330)',
                background: 'var(--surface-3, #191d27)',
                display: 'grid', placeItems: 'center',
                cursor: 'pointer',
                color: 'var(--ink-3, #7b8290)',
                flexShrink: 0,
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-4, #212634)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-3, #191d27)'; }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div style={{ overflowY: 'auto', padding: 22, flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border, #1f2330)',
            flexShrink: 0,
            display: 'flex', justifyContent: 'flex-end', gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mFadeIn  { from { opacity:0 }              to { opacity:1 } }
        @keyframes mSlideIn { from { opacity:0; transform:translateY(12px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>
    </div>,
    document.body
  );
}
