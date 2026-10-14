"use client";

import React, { useState } from "react";
import { MetricSnapshot } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatTimeOnly, formatTimestamp } from "@/lib/dates";
import { formatRate } from "@/lib/formatters";

interface NetworkTrafficChartProps {
  snapshots: MetricSnapshot[];
}

export function NetworkTrafficChart({ snapshots }: NetworkTrafficChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  const width = 720;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max network rate in bytes/sec
  const maxRate = Math.max(
    ...snapshots.map((s) => Math.max(s.networkInBytesPerSecond, s.networkOutBytesPerSecond)),
    1000000
  );

  const getY = (val: number) => padding.top + chartHeight - (val / maxRate) * chartHeight;
  const getX = (idx: number) => padding.left + (idx / (snapshots.length - 1)) * chartWidth;

  const netInPoints = snapshots
    .map((s, idx) => `${getX(idx)},${getY(s.networkInBytesPerSecond)}`)
    .join(" ");

  const netOutPoints = snapshots
    .map((s, idx) => `${getX(idx)},${getY(s.networkOutBytesPerSecond)}`)
    .join(" ");

  const hoveredItem = hoveredIndex !== null ? snapshots[hoveredIndex] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-bold">Network Bandwidth (I/O Throughput)</CardTitle>
          <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
            Simulated throughput
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Inbound Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-600 dark:text-slate-300">Outbound Traffic</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-64 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Gridlines */}
            {[0, 0.5, 1].map((pct) => {
              const val = maxRate * pct;
              return (
                <g key={pct}>
                  <line
                    x1={padding.left}
                    y1={getY(val)}
                    x2={width - padding.right}
                    y2={getY(val)}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={getY(val) + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {formatRate(val)}
                  </text>
                </g>
              );
            })}

            {/* Inbound line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={netInPoints}
            />

            {/* Outbound line */}
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={netOutPoints}
            />

            {/* Hover hitboxes */}
            {snapshots.map((s, idx) => (
              <rect
                key={s.id}
                x={getX(idx) - chartWidth / snapshots.length / 2}
                y={padding.top}
                width={chartWidth / snapshots.length}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                className="cursor-pointer"
              />
            ))}

            {/* Active hover crosshair */}
            {hoveredIndex !== null && hoveredItem && (
              <g>
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={padding.top + chartHeight}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(hoveredItem.networkInBytesPerSecond)}
                  r="4"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(hoveredItem.networkOutBytesPerSecond)}
                  r="4"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* X-axis time points */}
            {snapshots
              .filter((_, idx) => idx % Math.ceil(snapshots.length / 5) === 0)
              .map((s) => (
                <text
                  key={s.id}
                  x={getX(snapshots.indexOf(s))}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatTimeOnly(s.recordedAt)}
                </text>
              ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredItem && (
            <div className="absolute top-2 right-4 bg-slate-900/90 text-white dark:bg-slate-800/90 backdrop-blur-md rounded-lg p-2.5 shadow-lg border border-slate-700 text-xs pointer-events-none">
              <div className="text-[10px] text-slate-400 mb-1">
                {formatTimestamp(hoveredItem.recordedAt)}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-400">Inbound (Rx):</span>
                <span className="font-bold tabular-nums">
                  {formatRate(hoveredItem.networkInBytesPerSecond)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-cyan-400">Outbound (Tx):</span>
                <span className="font-bold tabular-nums">
                  {formatRate(hoveredItem.networkOutBytesPerSecond)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
