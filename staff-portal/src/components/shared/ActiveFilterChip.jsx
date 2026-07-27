import { X } from "lucide-react";

/**
 * Shows the filter a list page was deep-linked to (e.g. from a profile
 * page's Connections section) so the user can see it's active and clear
 * it back to an unfiltered view.
 */
export default function ActiveFilterChip({ label, value, onClear }) {
  if (!value) return null;

  return (
    <div className="mb-4 flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm">
      <span className="text-muted-foreground">Filtered by {label}:</span>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-muted-foreground hover:text-foreground"
        aria-label={`Clear ${label} filter`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
