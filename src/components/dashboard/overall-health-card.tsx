"use client";

import React from "react";
import { Server, Website } from "@/types/domain";
import { getOverallHealth } from "@/lib/status";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatTimeOnly, formatRelativeTime } from "@/lib/dates";
import {
  ShieldCheck,
  WarningOctagon,
  Warning,
  Question,
  Globe,
  HardDrives,
  ArrowRight,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OverallHealthCardProps {
  server: Server | null;
  websites: Website[];
}

export function OverallHealthCard({ server, websites }: OverallHealthCardProps) {
  const health = getOverallHealth(server, websites);

  const icons = {
    healthy: <ShieldCheck size={36} weight="fill" className="text-emerald-500" />,
    degraded: <Warning size={36} weight="fill" className="text-amber-500" />,
    down: <WarningOctagon size={36} weight="fill" className="text-rose-500" />,
    unknown: <Question size={36} weight="fill" className="text-slate-400" />,
  };

  const borderStyles = {
    healthy: "border-emerald-500/30 bg-emerald-500/[0.03]",
    degraded: "border-amber-500/30 bg-amber-500/[0.03]",
    down: "border-rose-500/30 bg-rose-500/[0.03]",
    unknown: "border-slate-500/30 bg-slate-500/[0.03]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all",
        borderStyles[health.status] || "border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall Status & Headline */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
            {icons[health.status]}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {health.label}
              </h2>
              <StatusBadge status={health.status} size="md" />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {health.summary}
            </p>
          </div>
        </div>

        {/* Right: Operational Metric Metrics Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0">
          {/* Websites Health */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Globe size={14} /> Websites
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {health.healthyWebsitesCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / {health.totalWebsitesCount} up
              </span>
            </div>
          </div>

          {/* Incidents Count */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
              Active Outages
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  health.activeIncidentsCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {health.activeIncidentsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {health.activeIncidentsCount === 1 ? "incident" : "incidents"}
              </span>
            </div>
          </div>

          {/* VPS Host State */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <HardDrives size={14} /> VPS Host
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Healthy
              </span>
            </div>
          </div>

          {/* Last Check */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
              Simulated Check
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
              {formatRelativeTime(health.lastCheckedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
