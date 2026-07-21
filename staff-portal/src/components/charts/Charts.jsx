import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

function ChartTip(tk) {
  return ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: tk.tipBg,
          border: `1px solid ${tk.tipBd}`,
          borderRadius: 11,
          padding: "9px 12px",
          boxShadow: "0 12px 30px -12px rgba(0,0,0,.4)",
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            color: tk.axis,
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        {payload.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12.5,
              color: tk.tipInk,
              marginTop: 2,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                background: p.color || p.fill,
              }}
            />
            <span style={{ textTransform: "capitalize" }}>{p.name}</span>
            <b className="tnum" style={{ marginLeft: "auto" }}>
              {Number(p.value || 0).toLocaleString()}
            </b>
          </div>
        ))}
      </div>
    );
  };
}

const axisProps = (tk) => ({
  tick: { fill: tk.axis, fontSize: 11.5 },
  axisLine: false,
  tickLine: false,
});

function EmptyChart({ title, sub }) {
  return (
    <div
      style={{
        height: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.45,
      }}
    >
      <BarChart3
        size={28}
        style={{ marginBottom: 10, color: "currentColor" }}
      />
      <div style={{ fontSize: 13, fontWeight: 550 }}>No data yet</div>
      <div style={{ fontSize: 12, marginTop: 3 }}>
        Data will appear as activity is recorded
      </div>
    </div>
  );
}

export function AreaCard({ tk, title, sub, data = [], keys = [], empty }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-sub">{sub}</div>
        </div>
        <span className="badge b-green">
          <TrendingUp size={12} />
          Live
        </span>
      </div>
      {empty || data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div style={{ height: 230, padding: "0 8px 12px" }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 6, right: 12, left: -14, bottom: 0 }}
            >
              <defs>
                {keys.map((k) => (
                  <linearGradient
                    key={k.dk}
                    id={"g" + k.dk}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={k.color} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={k.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke={tk.grid} vertical={false} />
              <XAxis dataKey="m" {...axisProps(tk)} />
              <YAxis {...axisProps(tk)} width={46} />
              <Tooltip content={ChartTip(tk)} />
              {keys.map((k) => (
                <Area
                  key={k.dk}
                  type="monotone"
                  dataKey={k.dk}
                  stroke={k.color}
                  strokeWidth={2.2}
                  fill={`url(#g${k.dk})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function LineCard({ tk, title, sub, data = [], dk, color, empty }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-sub">{sub}</div>
        </div>
      </div>
      {empty || data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div style={{ height: 230, padding: "0 8px 12px" }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 6, right: 12, left: -14, bottom: 0 }}
            >
              <CartesianGrid stroke={tk.grid} vertical={false} />
              <XAxis dataKey="m" {...axisProps(tk)} />
              <YAxis {...axisProps(tk)} width={46} />
              <Tooltip content={ChartTip(tk)} />
              <Line
                type="monotone"
                dataKey={dk}
                stroke={color}
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function BarCard({
  tk,
  title,
  sub,
  data = [],
  dk,
  color,
  horizontal,
  empty,
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-sub">{sub}</div>
        </div>
      </div>
      {empty || data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div style={{ height: 230, padding: "0 8px 12px" }}>
          <ResponsiveContainer>
            {horizontal ? (
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 6, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke={tk.grid} horizontal={false} />
                <XAxis type="number" {...axisProps(tk)} />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...axisProps(tk)}
                  width={92}
                />
                <Tooltip
                  content={ChartTip(tk)}
                  cursor={{ fill: tk.grid, opacity: 0.4 }}
                />
                <Bar
                  dataKey={dk}
                  fill={color}
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                />
              </BarChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 6, right: 12, left: -14, bottom: 0 }}
              >
                <CartesianGrid stroke={tk.grid} vertical={false} />
                <XAxis dataKey="m" {...axisProps(tk)} />
                <YAxis {...axisProps(tk)} width={46} />
                <Tooltip
                  content={ChartTip(tk)}
                  cursor={{ fill: tk.grid, opacity: 0.4 }}
                />
                <Bar
                  dataKey={dk}
                  fill={color}
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function DonutCard({ tk, title, sub, data = [], empty }) {
  const cmap = {
    green: tk.green,
    brand: tk.brand,
    cyan: tk.cyan,
    amber: tk.amber,
    red: tk.red,
    purple: tk.purple,
    gray: tk.axis,
  };
  const validData = data.filter((d) => Number(d.value || 0) > 0);
  const total = validData.reduce((a, b) => a + Number(b.value || 0), 0);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-sub">{sub}</div>
        </div>
      </div>
      {empty || validData.length === 0 ? (
        <EmptyChart />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 18px 20px",
          }}
        >
          <div
            style={{
              width: 168,
              height: 168,
              position: "relative",
              flexShrink: 0,
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={validData}
                  dataKey="value"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {validData.map((d, i) => (
                    <Cell key={i} fill={cmap[d.c] || tk.brand} />
                  ))}
                </Pie>
                <Tooltip content={ChartTip(tk)} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div>
                <div
                  className="tnum"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-.03em",
                  }}
                >
                  {total > 999 ? `${(total / 1000).toFixed(1)}k` : total}
                </div>
                <div style={{ fontSize: 11, color: tk.axis }}>Total</div>
              </div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {validData.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    flexShrink: 0,
                    background: cmap[d.c] || tk.brand,
                  }}
                />
                <span className="muted2">{d.name}</span>
                <b className="tnum" style={{ marginLeft: "auto" }}>
                  {Number(d.value || 0).toLocaleString()}
                </b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
