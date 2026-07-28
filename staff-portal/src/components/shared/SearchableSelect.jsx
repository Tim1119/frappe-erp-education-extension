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
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  displayField,
  placeholder = "Select...",
  label = "item",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
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
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
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
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 999999,
              maxHeight: 260,
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
                      {getDisplay(opt)}
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
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {selected ? getDisplay(selected) : placeholder}
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
