import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

/** Charts are client-only: recharts measures the DOM to lay out. */
function ChartFrame({ height, children }: { height: number; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Skeleton style={{ height }} className="w-full rounded-lg" />;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "0.8rem",
    color: "var(--color-popover-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

export type Datum = { name: string; value: number; color?: string };

export function DonutChart({
  data,
  height = 260,
  centerLabel,
  centerValue,
}: {
  data: Datum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative">
      <ChartFrame height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="var(--color-card)"
            strokeWidth={2}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ChartFrame>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl">{centerValue}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}

export function BarsChart({
  data,
  height = 260,
  color = "var(--color-chart-4)",
  layout = "vertical",
}: {
  data: Datum[];
  height?: number;
  color?: string;
  layout?: "vertical" | "horizontal";
}) {
  const horizontal = layout === "horizontal";
  return (
    <ChartFrame height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 40 : 0, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 11 }}
              stroke="var(--color-muted-foreground)"
            />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
          </>
        )}
        <Tooltip cursor={{ fill: "var(--color-secondary)" }} {...tooltipStyle} />
        <Bar dataKey="value" radius={4} fill={color}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? color ?? PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

export function TrendChart({
  data,
  height = 240,
  suffix = "",
}: {
  data: Datum[];
  height?: number;
  suffix?: string;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="var(--color-muted-foreground)"
          tickFormatter={(v: number) => `${v}${suffix}`}
        />
        <Tooltip formatter={(v: number) => `${v}${suffix}`} {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-gold)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-gold)" }}
        />
      </LineChart>
    </ChartFrame>
  );
}

export function ChartLegend({ data }: { data: Datum[] }) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center gap-2 text-sm">
          <span
            className="size-2.5 rounded-full"
            style={{ background: d.color ?? PALETTE[i % PALETTE.length] }}
          />
          <span className="text-muted-foreground">{d.name}</span>
          <span className="ml-auto font-medium">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}

export const CHART_PALETTE = PALETTE;
