import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

function useThemeColors() {
  const { mode, colorKey } = useTheme();
  const [colors, setColors] = useState(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    // Layer 1 (shadcn) tokens are raw HSL triples -- must be wrapped.
    const layer1 = (name) => `hsl(${styles.getPropertyValue(name).trim()})`;
    // Layer 2 (legacy bridge) tokens are already fully-resolved hsl(...)
    // strings from applyPreset() -- wrapping these again double-wraps into
    // invalid CSS (the exact --success/--warning collision documented in
    // CLAUDE.md section 7). Read directly, no extra hsl() wrap.
    const layer2 = (name) => styles.getPropertyValue(name).trim();
    setColors({
      primary: layer1("--primary"),
      border: layer1("--border"),
      mutedFg: layer1("--muted-foreground"),
      warning: layer2("--warning"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, colorKey]);

  return colors;
}

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg"
      style={{ borderColor: colors?.border }}
    >
      <div className="mb-1 font-medium text-muted-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 font-semibold">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          {p.name}: ₦{Number(p.value || 0).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

/**
 * Grouped bar chart: two series (collected vs outstanding) per category.
 *
 * @param {string} title
 * @param {Array<{label: string, paid: number, outstanding: number}>} data
 */
export function FeeCollectionBarChart({ title, data = [] }) {
  const colors = useThemeColors();

  return (
    <Card className="no-print">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-4">
        {!data.length || !colors ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : (
          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: colors.mutedFg, fontSize: 11 }}
                  axisLine={{ stroke: colors.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: colors.mutedFg, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<ChartTooltip colors={colors} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="paid" name="Fees Collected" fill={colors.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="outstanding" name="Outstanding Amount" fill={colors.warning} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
