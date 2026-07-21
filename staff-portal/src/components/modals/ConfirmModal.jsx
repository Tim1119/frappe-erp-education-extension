import Modal from './Modal';

/**
 * Reusable confirmation modal — replaces window.confirm everywhere.
 *
 * Usage:
 *   <ConfirmModal
 *     open={confirmOpen}
 *     onClose={() => setConfirmOpen(false)}
 *     onConfirm={handleConfirmedAction}
 *     title="Deactivate template?"
 *     message="This will prevent new cards from using this template."
 *     confirmLabel="Deactivate"
 *     variant="danger"   // "danger" | "warning" | "primary" (default)
 *     busy={isBusy}
 *   />
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title      = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant    = 'primary',
  busy       = false,
}) {
  const btnClass =
    variant === 'danger'  ? 'btn btn-danger' :
    variant === 'warning' ? 'btn btn-warning' :
                            'btn btn-primary';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 24 }}>
          {message}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onClose} disabled={busy}>
          {cancelLabel}
        </button>
        <button className={btnClass} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}