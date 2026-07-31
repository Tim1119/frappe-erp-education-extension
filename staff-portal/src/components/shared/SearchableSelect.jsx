import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A searchable dropdown select (combobox) built for the portal.
 *
 * @param {string}   value       — currently selected option name/id
 * @param {function} onChange    — called with the option's `name` field
 * @param {Array}    options     — array of { name, ...rest }
 * @param {string}   [displayField] — which field to show (defaults to "name")
 * @param {string}   [placeholder]
 * @param {string}   [label]     — label shown in the search placeholder
 * @param {boolean}  [disabled]
 * @param {boolean}  [showId]    — when the doctype's docname is an
 *   independent naming series (not derived from the displayed field, e.g.
 *   Course Schedule's "title" or Assessment Plan's "assessment_name"),
 *   different real records can show identical text. Set this to also
 *   render the real docname (opt.name) -- stacked above the label in the
 *   open dropdown, "ID — Label" in the closed button -- so they stay
 *   distinguishable. Leave false for doctypes whose docname IS the
 *   displayed field (e.g. field:student_group_name), where this would
 *   just be redundant.
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  displayField,
  placeholder = "Select...",
  label = "item",
  disabled = false,
  showId = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 260, openUpward: false });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const getDisplay = (opt) => {
    if (!opt) return "";
    if (displayField && opt[displayField]) return opt[displayField];
    return opt.course_name || opt.guardian_name || opt.instructor_name || opt.name || "";
  };

  const selected = options.find((o) => o.name === value);

  const filtered = options.filter((o) => {
    const s = search.toLowerCase();
    return (
      (o.name || "").toLowerCase().includes(s) ||
      getDisplay(o).toLowerCase().includes(s)
    );
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const DESIRED = 260;
      const GAP = 4;
      const spaceBelow = window.innerHeight - rect.bottom - GAP;
      const spaceAbove = rect.top - GAP;
      // Anchor below by default; only flip above when there isn't enough
      // room below AND there's more usable room above -- otherwise a
      // fixed-height dropdown anchored at rect.bottom can render mostly
      // past the bottom of the viewport (not clipped by any ancestor,
      // just off-screen), which is what happened for rows added near the
      // bottom of a long form.
      const openUpward = spaceBelow < DESIRED && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(DESIRED, openUpward ? spaceAbove : spaceBelow));
      setPosition({
        top: openUpward ? rect.top - GAP : rect.bottom + GAP,
        left: rect.left,
        width: rect.width,
        maxHeight,
        openUpward,
      });
    }
  }, [isOpen]);

  const dropdownContent =
    isOpen && !disabled
      ? createPortal(
          <div
            ref={dropdownRef}
            className="overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg"
            style={{
              position: "fixed",
              ...(position.openUpward
                ? { bottom: window.innerHeight - position.top }
                : { top: position.top }),
              left: position.left,
              width: position.width,
              zIndex: 999999,
              maxHeight: position.maxHeight,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Find ${label}...`}
                className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSelected = value === opt.name;
                  return (
                    <div
                      key={opt.name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(opt.name);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "cursor-pointer rounded-sm px-3 py-1.5 text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "hover:bg-accent",
                      )}
                    >
                      {showId ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-semibold">{opt.name}</span>
                          <span className={isSelected ? "" : "text-muted-foreground"}>
                            {getDisplay(opt)}
                          </span>
                        </div>
                      ) : (
                        getDisplay(opt)
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearch("");
          }
        }}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
          {selected
            ? (showId ? `${selected.name} — ${getDisplay(selected)}` : getDisplay(selected))
            : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </button>
      {dropdownContent}
    </div>
  );
}
