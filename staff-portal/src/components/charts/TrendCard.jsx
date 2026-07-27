import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

/** Read a CSS custom property as a resolved color string ("hsl(...)"). */
function useThemeColors() {
  const { mode, colorKey } = useTheme();
  const [colors, setColors] = useState(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const get = (name) => `hsl(${styles.getPropertyValue(name).trim()})`;
    setColors({
      primary: get("--primary"),
      border: get("--border"),
      mutedFg: get("--muted-foreground"),
      card: get("--card"),
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
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: p.color }}
          />
          {p.value?.toLocaleString?.() ?? p.value}
        </div>
      ))}
    </div>
  );
}

/**
 * A single-series area chart card, themed to the active accent colour.
 *
 * @param {string} title
 * @param {string} [sub]
 * @param {Array<{label: string, value: number}>} data
 */
export function TrendCard({ title, sub, data = [] }) {
  const colors = useThemeColors();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </CardHeader>
      <CardContent className="pl-0 pr-4">
        {!data.length || !colors ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : (
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  width={36}
                />
                <Tooltip content={<ChartTooltip colors={colors} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
