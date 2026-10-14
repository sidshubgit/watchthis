"use client";

import React from "react";
import { Server } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatBytes, formatRate, formatPercent, formatDuration } from "@/lib/formatters";
import { Cpu, HardDrive, Database, Pulse, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ServerHealthSummaryProps {
  server: Server | null;
}

export function ServerHealthSummary({ server }: ServerHealthSummaryProps) {
  if (!server) return null;

  const memPercent = Math.round((server.memoryUsedBytes / server.memoryTotalBytes) * 100);
  const diskPercent = Math.round((server.diskUsedBytes / server.diskTotalBytes) * 100);

  const metrics = [
    {
      label: "CPU Utilization",
      value: formatPercent(server.cpuUsage),
      subtext: "4 Cores (AMD EPYC)",
      percent: server.cpuUsage,
      icon: Cpu,
      isWarning: server.cpuUsage > 80,
    },
    {
      label: "Memory (RAM)",
      value: `${memPercent}%`,
      subtext: `${formatBytes(server.memoryUsedBytes)} / ${formatBytes(server.memoryTotalBytes)}`,
      percent: memPercent,
      icon: HardDrive,
      isWarning: memPercent > 85,
    },
    {
      label: "Disk Storage",
      value: `${diskPercent}%`,
      subtext: `${formatBytes(server.diskUsedBytes)} / ${formatBytes(server.diskTotalBytes)}`,
      percent: diskPercent,
      icon: Database,
      isWarning: diskPercent > 90,
    },
    {
      label: "Network Traffic",
      value: formatRate(server.networkOutBytesPerSecond),
      subtext: `In: ${formatRate(server.networkInBytesPerSecond)} • Out: ${formatRate(server.networkOutBytesPerSecond)}`,
      percent: Math.min(100, (server.networkOutBytesPerSecond / 10000000) * 100),
      icon: Pulse,
      isWarning: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3.5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-bold">VPS Resource Telemetry</CardTitle>
          <span className="text-[11px] text-slate-500 font-mono">
            {server.hostname} • Uptime {formatDuration(server.uptimeSeconds)}
          </span>
        </div>
        <Link
          href="/server"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Detailed Metrics</span>
          <ArrowRight size={13} />
        </Link>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="font-medium flex items-center gap-1.5">
                  <Icon size={15} /> {m.label}
                </span>
                {m.isWarning && (
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    High
                  </span>
                )}
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {m.value}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {m.subtext}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    m.isWarning ? "bg-amber-500" : "bg-blue-600 dark:bg-blue-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(2, m.percent))}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
