// A small confirmation used before any destructive write, so nothing
// irreversible happens on a single stray click.
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="dialog">
        <p className="dialog__title">{title}</p>
        <p className="dialog__body">{body}</p>
        <div className="dialog__actions">
          <button type="button" className="btn-quiet" onClick={onCancel}>
            Keep it
          </button>
          <button type="button" className="btn-ink btn-ink--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
