import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

function useThemeColors() {
  const { mode, colorKey } = useTheme();
  const [colors, setColors] = useState(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    // Layer 2 (legacy bridge) tokens are already fully-resolved hsl(...)
    // strings from applyPreset() -- do NOT wrap in hsl() again (see
    // CLAUDE.md section 7's --success/--warning collision writeup).
    const layer2 = (name) => styles.getPropertyValue(name).trim();
    setColors({
      submitted: layer2("--success"),
      saved: layer2("--warning"),
      remaining: layer2("--ink-3"),
      border: `hsl(${styles.getPropertyValue("--border").trim()})`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, colorKey]);

  return colors;
}

function ChartTooltip({ active, payload, colors }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg"
      style={{ borderColor: colors?.border }}
    >
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 font-semibold">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

function Legend({ saved, submitted, remaining, colors }) {
  const total = saved + submitted + remaining;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const items = [
    { label: "Submitted", value: submitted, color: colors.submitted },
    { label: "Saved", value: saved, color: colors.saved },
    { label: "Remaining", value: remaining, color: colors.remaining },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-6">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          <span className="font-medium">{i.label}</span>
          <span className="text-muted-foreground">
            {i.value} ({pct(i.value)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Horizontal stacked progress bar -- mirrors Desk's own "percentage"
 * chart type for Assessment Plan Status: one bar split into
 * Saved/Submitted/Remaining segments, with a legend showing real counts.
 *
 * @param {number} saved
 * @param {number} submitted
 * @param {number} remaining
 */
export function AssessmentStatusBar({ saved = 0, submitted = 0, remaining = 0 }) {
  const colors = useThemeColors();
  const data = [{ name: "Status", saved, submitted, remaining }];
  const total = saved + submitted + remaining;

  return (
    <Card className="no-print">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Assessment Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {!total || !colors ? (
          <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : (
          <>
            <div style={{ height: 56 }}>
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={data}
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap={0}
                >
                  <XAxis type="number" hide domain={[0, total]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip content={<ChartTooltip colors={colors} />} cursor={false} />
                  <Bar dataKey="submitted" name="Submitted" stackId="status" fill={colors.submitted} radius={[4, 0, 0, 4]} />
                  <Bar dataKey="saved" name="Saved" stackId="status" fill={colors.saved} />
                  <Bar dataKey="remaining" name="Remaining" stackId="status" fill={colors.remaining} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Legend saved={saved} submitted={submitted} remaining={remaining} colors={colors} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
