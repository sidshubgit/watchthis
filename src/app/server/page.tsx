"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchServer, fetchMetricSnapshots } from "@/mocks/api/server-api";
import { fetchTimelineEvents } from "@/mocks/api/timeline-api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourceHistoryChart } from "@/components/server/resource-history-chart";
import { NetworkTrafficChart } from "@/components/server/network-traffic-chart";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { TimeRange } from "@/types/domain";
import { formatBytes, formatRate, formatPercent, formatDuration } from "@/lib/formatters";
import { formatRelativeTime } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import {
  HardDrives,
  Cpu,
  Database,
  Pulse,
  Warning,
  CheckCircle,
  Plus,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ServerHealthPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("24h");
  const { openRecordTask } = useUiStore();

  const { data: server, isLoading: isServerLoading } = useQuery({
    queryKey: ["server"],
    queryFn: () => fetchServer(),
  });

  const { data: metrics = [], isLoading: isMetricsLoading } = useQuery({
    queryKey: ["server-metrics", selectedRange],
    queryFn: () => fetchMetricSnapshots(selectedRange),
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ["timeline", "server"],
    queryFn: () => fetchTimelineEvents({ search: "server" }),
  });

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: "1 Hour", value: "1h" },
    { label: "6 Hours", value: "6h" },
    { label: "24 Hours", value: "24h" },
    { label: "7 Days", value: "7d" },
  ];

  if (isServerLoading || !server) {
    return (
      <div className="space-y-6">
        <PageHeader title="Server Health" description="Loading VPS telemetry..." />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const memPercent = Math.round((server.memoryUsedBytes / server.memoryTotalBytes) * 100);
  const diskPercent = Math.round((server.diskUsedBytes / server.diskTotalBytes) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Server Health & Hardware"
        description="Low-level kernel, compute, memory, and filesystem telemetry for primary Linux VPS."
        badge={<StatusBadge status={server.status} size="md" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => openRecordTask({ websiteId: undefined })}
          >
            <Plus size={16} weight="bold" />
            <span>Record Host Task</span>
          </Button>
        }
      />

      {/* Server Identity Card */}
      <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <HardDrives size={30} weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {server.name}
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {server.hostname}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>OS: <strong className="text-slate-700 dark:text-slate-300">{server.operatingSystem}</strong></span>
                  <span>•</span>
                  <span>IP: <span className="font-mono">{server.ipAddress}</span></span>
                  <span>•</span>
                  <span>Uptime: <strong className="text-slate-700 dark:text-slate-300">{formatDuration(server.uptimeSeconds)}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 dark:text-slate-400 border-t md:border-t-0 pt-3 md:pt-0">
              <div>Simulated Health Check</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {formatRelativeTime(server.lastCheckedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Telemetry Window
        </h3>
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                selectedRange === range.value
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium"><Cpu size={16} /> CPU Usage</span>
            <span className="font-mono text-[11px]">4 Cores</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatPercent(server.cpuUsage)}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${server.cpuUsage}%` }}
            />
          </div>
        </Card>

        {/* RAM */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium"><Database size={16} /> Memory (RAM)</span>
            <span className="font-mono text-[11px]">{memPercent}%</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatBytes(server.memoryUsedBytes)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            of {formatBytes(server.memoryTotalBytes)} capacity
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${memPercent}%` }}
            />
          </div>
        </Card>

        {/* Disk */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium"><HardDrives size={16} /> Disk (/dev/vda1)</span>
            <span className="font-mono text-[11px]">{diskPercent}%</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatBytes(server.diskUsedBytes)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            of {formatBytes(server.diskTotalBytes)} SSD storage
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${diskPercent}%` }}
            />
          </div>
        </Card>

        {/* Network */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium"><Pulse size={16} /> Bandwidth</span>
            <span className="text-emerald-500 text-[11px] font-semibold">Active</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatRate(server.networkOutBytesPerSecond)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            In: {formatRate(server.networkInBytesPerSecond)}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-600 rounded-full w-2/5" />
          </div>
        </Card>
      </div>

      {/* Historical Telemetry Charts */}
      {isMetricsLoading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-6">
          <ResourceHistoryChart snapshots={metrics} />
          <NetworkTrafficChart snapshots={metrics} />
        </div>
      )}

      {/* Active Resource Warnings & Threshold Advisories */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Warning className="text-amber-500" size={17} weight="bold" />
            Host Resource Thresholds & Active Advisories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] flex items-start gap-3">
            <Warning size={18} className="text-amber-500 shrink-0 mt-0.5" weight="fill" />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Recent CPU peak detected:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                CPU reached 88.4% during upstream PHP socket timeout on shop.example.test. System load has since stabilized.
              </span>
              <div className="mt-2">
                <Link
                  href="/incidents/inc-shop-502"
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  View linked incident INC-SHOP-502 →
                </Link>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] flex items-start gap-3">
            <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" weight="fill" />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Disk storage healthy:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                47.3 GB free SSD headroom available. Nightly log rotation nice policy verified.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
