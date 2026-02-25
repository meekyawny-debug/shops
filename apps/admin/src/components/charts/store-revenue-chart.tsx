"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StoreRevenueData {
  storeName: string;
  totalRevenue: number;
  orderCount: number;
}

interface StoreRevenueChartProps {
  data: StoreRevenueData[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(262, 80%, 55%)",
  "hsl(173, 80%, 40%)",
  "hsl(43, 96%, 56%)",
];

export function StoreRevenueChart({ data }: StoreRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="storeName"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
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
          formatter={(value: number, name: string) => [
            name === "totalRevenue" ? `$${value.toFixed(2)}` : value,
            name === "totalRevenue" ? "Revenue" : "Orders",
          ]}
        />
        <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]} barSize={48}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
