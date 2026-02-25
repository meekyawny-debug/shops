"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => {
            const date = new Date(d + "T00:00:00");
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          labelFormatter={(d: string) => {
            const date = new Date(d + "T00:00:00");
            return date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
          }}
          formatter={(value: number, name: string) => [
            name === "revenue" ? `$${value.toFixed(2)}` : value,
            name === "revenue" ? "Revenue" : "Orders",
          ]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
