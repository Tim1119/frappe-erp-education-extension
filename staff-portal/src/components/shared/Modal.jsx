import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  size,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "xl" ? 960 : size === "lg" ? 720 : 540;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "mFadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col rounded-2xl border bg-card text-card-foreground shadow-2xl"
        style={{
          maxWidth: maxW,
          maxHeight: "calc(100vh - 40px)",
          animation: "mSlideIn .18s ease",
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
            <div className="text-base font-bold tracking-tight">{title}</div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-secondary text-muted-foreground transition-colors hover:bg-accent"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 justify-end gap-2.5 border-t px-5 py-3">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mFadeIn  { from { opacity:0 }              to { opacity:1 } }
        @keyframes mSlideIn { from { opacity:0; transform:translateY(12px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>
    </div>,
    document.body,
  );
}
