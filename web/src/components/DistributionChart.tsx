"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { DistributionBin, LeaderboardPlayer } from "@/lib/types";
import { getPointsPlusBarColor } from "@/lib/colors";
import PlayerImage from "./PlayerImage";
import PointsPlusBadge from "./PointsPlusBadge";

export default function DistributionChart({
  data,
  players,
}: {
  data: DistributionBin[];
  players: LeaderboardPlayer[];
}) {
  const [selectedBin, setSelectedBin] = useState<DistributionBin | null>(null);

  const filteredPlayers = selectedBin
    ? players.filter((p) => p.pointsPlus >= selectedBin.min && p.pointsPlus < selectedBin.max)
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleBarClick(barData: any) {
    if (!barData?.activePayload?.[0]?.payload) return;
    const bin = barData.activePayload[0].payload as DistributionBin;
    setSelectedBin((prev) => (prev?.label === bin.label ? null : bin));
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
        Points+ Distribution
        <span className="ml-2 text-xs text-slate-500 normal-case font-normal">Click a bar to see players</span>
      </h3>
      <div className="h-48 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            onClick={handleBarClick}
          >
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
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
            />
            <ReferenceLine
              x="100-110"
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: "Avg", fill: "#f59e0b", fontSize: 10, position: "top" }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getPointsPlusBarColor((entry.min + entry.max) / 2)}
                  opacity={selectedBin ? (selectedBin.label === entry.label ? 1 : 0.3) : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedBin && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">
              Points+ {selectedBin.label}
              <span className="ml-2 text-slate-400 font-normal">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
              </span>
            </h4>
            <button
              onClick={() => setSelectedBin(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filteredPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/player/${player.id}`}
                className="flex items-center gap-3 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2 hover:bg-slate-700/50 transition-colors"
              >
                <PlayerImage playerId={player.id} name={player.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{player.name}</div>
                  <div className="text-xs text-slate-400">{player.team} &middot; #{player.rank}</div>
                </div>
                <PointsPlusBadge value={player.pointsPlus} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
