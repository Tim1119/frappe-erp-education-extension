import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

/**
 * SearchableSelect
 *
 * A text-input-driven dropdown for long option lists (faculties,
 * departments, academic levels, etc.) where a plain <select> becomes
 * unusable past a couple dozen items. Filters client-side against
 * whatever `options` are currently loaded — pass a fully-loaded list
 * (see the page_size bump for dropdown fetches) for it to search
 * the whole set, not just the current page.
 *
 * The option list renders through a portal into document.body and is
 * positioned using the trigger's live bounding rect, so it always
 * floats above modal content instead of being clipped by a scrollable
 * ancestor (e.g. a modal body with overflow-y: auto).
 *
 * Props:
 *  - value: currently selected id (string) or '' for none
 *  - onChange: (id: string) => void
 *  - options: [{ id, name }]
 *  - placeholder: string shown when nothing is selected
 *  - allLabel: label for the "clear selection" option, e.g. "All faculties"
 *  - disabled: bool
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Search…',
  allLabel = 'All',
  disabled = false,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value)) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.name || '').toLowerCase().includes(q));
  }, [options, query]);

  // Recompute the trigger's position whenever the dropdown opens, and
  // keep it pinned while scrolling/resizing anywhere on the page.
  useLayoutEffect(() => {
    if (!open) return;

    const updateRect = () => {
      if (wrapRef.current) {
        setRect(wrapRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      const clickedTrigger = wrapRef.current && wrapRef.current.contains(e.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!clickedTrigger && !clickedDropdown) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handlePick = (id) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const dropdown = open && rect && createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 100000,
        background: 'var(--surface)',
        border: '1px solid var(--border-2)',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        maxHeight: 260,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={() => handlePick('')}
        style={{
          padding: '9px 12px',
          fontSize: 13.5,
          cursor: 'pointer',
          color: 'var(--ink-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: '1px solid var(--border)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <X size={13} />
        {allLabel}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '12px', fontSize: 13, color: 'var(--ink-4)', textAlign: 'center' }}>
          No matches
        </div>
      )}

      {filtered.map((o) => (
        <div
          key={o.id}
          onClick={() => handlePick(o.id)}
          style={{
            padding: '9px 12px',
            fontSize: 13.5,
            cursor: 'pointer',
            fontWeight: String(o.id) === String(value) ? 600 : 400,
            background: String(o.id) === String(value) ? 'var(--brand-soft)' : 'transparent',
          }}
          onMouseEnter={(e) => { if (String(o.id) !== String(value)) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={(e) => { if (String(o.id) !== String(value)) e.currentTarget.style.background = 'transparent'; }}
        >
          {o.name}
        </div>
      ))}
    </div>,
    document.body
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      {!open ? (
        <button
          type="button"
          className="select"
          disabled={disabled}
          onClick={handleOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <span style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected ? selected.name : allLabel}
          </span>
          <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--ink-4)' }} />
        </button>
      ) : (
        <div className="input-ico">
          <Search />
          <input
            ref={inputRef}
            className="input"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setOpen(false); setQuery(''); }
              if (e.key === 'Enter' && filtered.length === 1) handlePick(filtered[0].id);
            }}
          />
        </div>
      )}

      {dropdown}
    </div>
  );
}