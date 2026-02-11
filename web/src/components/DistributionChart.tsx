"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { DistributionBin } from "@/lib/types";
import { getPointsPlusBarColor } from "@/lib/colors";

export default function DistributionChart({ data }: { data: DistributionBin[] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
        Points+ Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelStyle={{ color: "#f1f5f9" }}
              itemStyle={{ color: "#cbd5e1" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value} players`, "Count"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => `Points+ ${label}`}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <ReferenceLine
              x="100-110"
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: "Avg", fill: "#f59e0b", fontSize: 10, position: "top" }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getPointsPlusBarColor((entry.min + entry.max) / 2)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
