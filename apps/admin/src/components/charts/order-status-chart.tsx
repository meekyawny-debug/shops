"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface OrderStatusData {
  status: string;
  count: number;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "hsl(43, 96%, 56%)",
  PAID: "hsl(217, 91%, 60%)",
  PROCESSING: "hsl(262, 80%, 55%)",
  SHIPPED: "hsl(173, 80%, 40%)",
  DELIVERED: "hsl(142, 71%, 45%)",
  CANCELLED: "hsl(0, 84%, 60%)",
  REFUNDED: "hsl(0, 0%, 55%)",
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={72}
            paddingAngle={2}
            dataKey="count"
            nameKey="status"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] || "hsl(var(--muted))"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1.5">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    STATUS_COLORS[item.status] || "hsl(var(--muted))",
                }}
              />
              <span className="text-muted-foreground capitalize">
                {item.status.toLowerCase()}
              </span>
            </div>
            <span className="font-medium tabular-nums">
              {item.count}{" "}
              <span className="text-muted-foreground font-normal">
                ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
