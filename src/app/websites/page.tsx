"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsites } from "@/mocks/api/website-api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ResponseTimeSparkline } from "@/components/shared/response-time-sparkline";
import { EmptyState } from "@/components/shared/empty-state";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatResponseTime, formatPercent, formatHttpStatusCode } from "@/lib/formatters";
import { formatRelativeTime, getDaysUntil } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import {
  Globe,
  MagnifyingGlass,
  ArrowRight,
  ShieldCheck,
  Warning,
  Plus,
  ArrowClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/stores/demo-store";

export default function WebsitesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("status");
  const { openRecordTask, openAddWebsite } = useUiStore();
  const { probeLiveWebsites, isProbingLive } = useDemoStore();

  const { data: websites = [], isLoading } = useQuery({
    queryKey: ["websites", statusFilter, search, sortField],
    queryFn: () =>
      fetchWebsites({
        status: statusFilter,
        search,
        sort: sortField,
      }),
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Monitored Websites"
        description="Continuous synthetic uptime probes, response latency benchmarks, and TLS certificate monitoring."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {websites.length} {websites.length === 1 ? "site" : "sites"}
          </span>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => probeLiveWebsites()}
              isLoading={isProbingLive}
              title="Run live HTTP network probes against all websites now"
            >
              <ArrowClockwise size={16} weight="bold" />
              <span>Probe Live Status</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => openAddWebsite()}>
              <Plus size={16} weight="bold" />
              <span>Add Website</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openRecordTask()}>
              <span>Record Task</span>
            </Button>
          </div>
        }
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain or site name..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status selector */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy Only</option>
            <option value="degraded">Degraded Only</option>
            <option value="down">Down Only</option>
          </Select>

          {/* Sort selector */}
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="status">Sort by Status</option>
            <option value="name">Sort by Name</option>
            <option value="responseTime">Sort by Latency</option>
            <option value="uptime">Sort by Uptime</option>
          </Select>
        </div>
      </div>

      {/* Website List / Table */}
      {isLoading ? (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </Card>
      ) : websites.length === 0 ? (
        <EmptyState
          icon={<Globe size={26} />}
          title="No matching websites found"
          description="None of your monitored sites matched your current search and status filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
          {websites.map((site) => {
            const httpInfo = formatHttpStatusCode(site.httpStatusCode);
            const isDown = site.status === "down";
            const daysToSsl = getDaysUntil(site.sslExpiryAt);
            const isSslExpiringSoon = daysToSsl !== null && daysToSsl <= 14;

            return (
              <div
                key={site.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors gap-4"
              >
                {/* Left: Domain & Status */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm shrink-0 mt-0.5 sm:mt-0",
                      isDown
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <Globe size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/websites/${site.id}`}
                        className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {site.name}
                      </Link>
                      <StatusBadge status={site.status} size="sm" />
                      {site.isCritical && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {site.url}
                      </span>
                      <span>•</span>
                      <span>Checked {formatRelativeTime(site.lastCheckedAt)}</span>
                    </div>
                    {site.errorDetail && site.status === "down" && (
                      <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <Warning size={11} weight="fill" />
                        {site.errorDetail}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Telemetry & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0">
                  {/* Latency & Sparkline */}
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Response Time
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ResponseTimeSparkline
                        data={site.historySparkline}
                        isDown={isDown}
                        width={60}
                        height={18}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatResponseTime(site.responseTimeMs)}
                      </span>
                    </div>
                  </div>

                  {/* HTTP Status Code */}
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      HTTP Status
                    </span>
                    <span
                      className={cn(
                        "inline-block font-mono text-xs px-2 py-0.5 rounded border mt-0.5",
                        isDown
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {httpInfo.text}
                    </span>
                  </div>

                  {/* SSL Expiry */}
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      SSL Certificate
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {isSslExpiringSoon ? (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Warning size={13} weight="fill" /> {daysToSsl}d left
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <ShieldCheck size={13} className="text-emerald-500" />
                          {daysToSsl ? `${daysToSsl}d` : "Active"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="hidden lg:block text-right">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      30d Uptime
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5 block">
                      {site.uptimePercentage ? formatPercent(site.uptimePercentage) : "—"}
                    </span>
                  </div>

                  {/* View Details Link */}
                  <Link href={`/websites/${site.id}`}>
                    <Button variant="outline" size="sm">
                      <span>Inspect</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
