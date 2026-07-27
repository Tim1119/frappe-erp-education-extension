import { Palette, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { COLOR_PRESETS } from "@/config/themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function ThemePicker() {
  const { colorKey, setColorKey } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel className="mb-2 px-0 text-xs font-medium text-muted-foreground">
          Accent colour
        </DropdownMenuLabel>
        <div className="grid grid-cols-8 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setColorKey(preset.key)}
              title={preset.label}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
                colorKey === preset.key
                  ? "border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: preset.swatch }}
            >
              {colorKey === preset.key && (
                <Check className="h-3.5 w-3.5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
