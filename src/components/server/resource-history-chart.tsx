"use client";

import React, { useState } from "react";
import { MetricSnapshot } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatTimeOnly, formatTimestamp } from "@/lib/dates";

interface ResourceHistoryChartProps {
  snapshots: MetricSnapshot[];
  title?: string;
}

export function ResourceHistoryChart({
  snapshots,
  title = "CPU & Memory Utilization History",
}: ResourceHistoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No telemetry samples available.
        </CardContent>
      </Card>
    );
  }

  const width = 720;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max scale is 100%
  const getY = (val: number) => padding.top + chartHeight - (val / 100) * chartHeight;
  const getX = (idx: number) => padding.left + (idx / (snapshots.length - 1)) * chartWidth;

  const cpuPoints = snapshots
    .map((s, idx) => `${getX(idx)},${getY(s.cpuUsage)}`)
    .join(" ");

  const memPoints = snapshots
    .map((s, idx) => `${getX(idx)},${getY(s.memoryUsagePercentage)}`)
    .join(" ");

  const hoveredItem = hoveredIndex !== null ? snapshots[hoveredIndex] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-bold">{title}</CardTitle>
          <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
            Simulated metrics
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">CPU Usage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-300">Memory (RAM)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-72 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Horizontal Gridlines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={getY(tick)}
                  x2={width - padding.right}
                  y2={getY(tick)}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={getY(tick) + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tick}%
                </text>
              </g>
            ))}

            {/* Threshold line 85% Warning */}
            <line
              x1={padding.left}
              y1={getY(85)}
              x2={width - padding.right}
              y2={getY(85)}
              stroke="#f59e0b"
              strokeDasharray="2 2"
              strokeOpacity={0.6}
            />

            {/* Polyline for CPU */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={cpuPoints}
            />

            {/* Polyline for Memory */}
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={memPoints}
            />

            {/* Interactive invisible hover rectangles */}
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

            {/* Active hover vertical indicator line and dots */}
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
                  cy={getY(hoveredItem.cpuUsage)}
                  r="4"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(hoveredItem.memoryUsagePercentage)}
                  r="4"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* X-Axis Time Labels */}
            {snapshots
              .filter((_, idx) => idx % Math.ceil(snapshots.length / 5) === 0)
              .map((s, idx, arr) => (
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
                <span className="text-blue-400">CPU Usage:</span>
                <span className="font-bold tabular-nums">{hoveredItem.cpuUsage}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-purple-400">Memory:</span>
                <span className="font-bold tabular-nums">{hoveredItem.memoryUsagePercentage}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
