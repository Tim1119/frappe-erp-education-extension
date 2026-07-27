import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Row-level actions dropdown for list/table pages.
 *
 * Built on Radix DropdownMenu (via shadcn), which renders through a Portal
 * to document.body — so it always floats above table/card overflow
 * boundaries instead of being clipped inside them.
 *
 * @param {function} [onView]
 * @param {function} [onEdit]
 * @param {function} [onDelete]
 * @param {Array<{label: string, icon?: Component, onClick: function, danger?: boolean}>} [extra]
 *   Additional menu items rendered between Edit and the delete separator.
 */
export default function RowActionsMenu({ onView, onEdit, onDelete, extra = [] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        )}
        {extra.map((item, i) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={i} onClick={item.onClick}>
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
