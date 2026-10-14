"use client";

import React from "react";
import { Website } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ResponseTimeSparkline } from "@/components/shared/response-time-sparkline";
import { formatResponseTime, formatPercent, formatHttpStatusCode } from "@/lib/formatters";
import { Globe, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WebsiteOverviewProps {
  websites: Website[];
}

export function WebsiteOverview({ websites }: WebsiteOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3.5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Globe size={16} /> Monitored Websites ({websites.length})
          </CardTitle>
        </div>
        <Link
          href="/websites"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>All Websites</span>
          <ArrowRight size={13} />
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
        {websites.slice(0, 5).map((site) => {
          const httpInfo = formatHttpStatusCode(site.httpStatusCode);
          const isDown = site.status === "down";

          return (
            <Link
              key={site.id}
              href={`/websites/${site.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0",
                    isDown
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {site.name}
                    </span>
                    {site.isCritical && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Critical
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {site.url.replace("https://", "")}
                  </span>
                </div>
              </div>

              {/* Status and telemetry */}
              <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                {/* Latency sparkline */}
                <div className="hidden md:flex flex-col items-end">
                  <ResponseTimeSparkline
                    data={site.historySparkline}
                    isDown={isDown}
                    width={64}
                    height={18}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {formatResponseTime(site.responseTimeMs)}
                  </span>
                </div>

                {/* HTTP code */}
                <span
                  className={cn(
                    "font-mono text-xs px-2 py-0.5 rounded border",
                    isDown
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {httpInfo.text}
                </span>

                {/* Uptime */}
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {site.uptimePercentage ? formatPercent(site.uptimePercentage) : "—"}
                  </div>
                  <div className="text-[10px] text-slate-400">demo uptime</div>
                </div>

                {/* Badge */}
                <StatusBadge status={site.status} size="sm" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
