import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/**
 * Toolbar with a search input and optional filter dropdowns.
 *
 * @param {{ search: string, onSearch: (v: string) => void,
 *           filters?: Array<{ key: string, label: string, value: string,
 *                             onChange: (v: string) => void,
 *                             options: string[] }> }} props
 */
export default function Toolbar({ search, onSearch, filters = [] }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8 pr-8"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.map((f) => (
        <Select
          key={f.key}
          value={f.value || "__all__"}
          onValueChange={(v) => f.onChange(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All {f.label}</SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
