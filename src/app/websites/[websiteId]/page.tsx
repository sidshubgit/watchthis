"use client";

import React, { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsiteById, probeWebsiteLive } from "@/mocks/api/website-api";
import { fetchIncidents } from "@/mocks/api/incident-api";
import { fetchTasks } from "@/mocks/api/task-api";
import { fetchTimelineEvents } from "@/mocks/api/timeline-api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { formatResponseTime, formatPercent, formatHttpStatusCode } from "@/lib/formatters";
import { formatRelativeTime, formatDateOnly, getDaysUntil } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import { useDemoStore } from "@/stores/demo-store";
import {
  Globe,
  ArrowLeft,
  Plus,
  ShieldCheck,
  WarningCircle,
  ClockCounterClockwise,
  ArrowSquareOut,
  Lightning,
  ArrowClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = use(params);
  const { openRecordTask, showToast } = useUiStore();
  const { simulateOutage, simulateRecovery, isPerformingAction } = useDemoStore();
  const [isProbingThis, setIsProbingThis] = useState(false);

  const { data: website, isLoading } = useQuery({
    queryKey: ["website", websiteId],
    queryFn: () => fetchWebsiteById(websiteId),
  });

  const { data: allIncidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ["timeline", websiteId],
    queryFn: () => fetchTimelineEvents({ websiteId }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="space-y-6">
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Back to Websites
        </Link>
        <EmptyState
          icon={<Globe size={28} />}
          title="Website Not Found"
          description="The website you requested does not exist or has been removed from monitored fixtures."
          action={
            <Link href="/websites">
              <Button variant="outline" size="sm">
                Return to Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const linkedIncidents = allIncidents.filter((i) => i.websiteId === website.id);
  const linkedTasks = allTasks.filter((t) => t.websiteId === website.id);
  const httpInfo = formatHttpStatusCode(website.httpStatusCode);
  const isDown = website.status === "down";
  const daysToSsl = getDaysUntil(website.sslExpiryAt);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Websites</span>
        </Link>
      </div>

      {/* Detail Page Header */}
      <PageHeader
        title={website.name}
        description={`Simulated uptime monitoring for ${website.url}`}
        badge={<StatusBadge status={website.status} size="md" />}
        actions={
          <>
            {isDown ? (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateRecovery(website.id)}
                disabled={isPerformingAction}
              >
                <ArrowClockwise size={15} weight="bold" />
                <span>Simulate Recovery</span>
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateOutage(website.id)}
                disabled={isPerformingAction}
              >
                <Lightning size={15} weight="fill" className="text-amber-500" />
                <span>Simulate Outage</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsProbingThis(true);
                try {
                  await probeWebsiteLive(website.id);
                  showToast(`Live probe completed for ${website.name}`, "info");
                } finally {
                  setIsProbingThis(false);
                }
              }}
              isLoading={isProbingThis}
              title="Query live network endpoint now"
            >
              <ArrowClockwise size={15} weight="bold" />
              <span>Probe Live Status</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => openRecordTask({ websiteId: website.id })}
            >
              <Plus size={16} weight="bold" />
              <span>Record Task</span>
            </Button>
          </>
        }
      />

      {/* Live Probe Status Banner */}
      <Card className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {website.url}
                </span>
                <span
                  title="Fictional test domain (RFC 2606)"
                  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500"
                >
                  Demo Domain (.test)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last checked {formatRelativeTime(website.lastCheckedAt)} • Hosted on primary VPS (vps-fra-01)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "font-mono text-xs px-3 py-1 rounded-lg border font-semibold",
                  isDown
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {httpInfo.text}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Latency */}
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1 font-medium">Response Latency</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatResponseTime(website.responseTimeMs)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isDown ? "Probe connection refused" : "Healthy response window"}
          </div>
        </Card>

        {/* Uptime */}
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1 font-medium">Demo Historical Uptime</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {website.uptimePercentage ? formatPercent(website.uptimePercentage) : "—"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Calculated over 30-day window
          </div>
        </Card>

        {/* SSL Expiry */}
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1 font-medium">SSL / TLS Certificate</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums flex items-center gap-2">
            <span>{daysToSsl ? `${daysToSsl} Days` : "Active"}</span>
            <ShieldCheck size={22} className="text-emerald-500" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Expires {formatDateOnly(website.sslExpiryAt)} (Let&apos;s Encrypt)
          </div>
        </Card>
      </div>

      {/* Latency History Sparkline & Check History */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold">Latency Benchmark History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-end gap-2 h-24 pt-4">
            {website.historySparkline.map((val, idx) => {
              const maxVal = Math.max(...website.historySparkline, 200);
              const heightPercent = val === 0 ? 8 : Math.max(12, (val / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-20 flex items-end overflow-hidden">
                    <div
                      className={cn(
                        "w-full transition-all duration-300",
                        val === 0 ? "bg-rose-500" : "bg-blue-600 dark:bg-blue-500 group-hover:bg-blue-400"
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {val === 0 ? "FAIL" : `${val}ms`}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Linked Incidents & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Incidents */}
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <WarningCircle size={16} /> Linked Incidents ({linkedIncidents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
            {linkedIncidents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No incidents reported for this website.
              </div>
            ) : (
              linkedIncidents.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="flex items-start justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-500">
                        {inc.title}
                      </span>
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {inc.description}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    {formatRelativeTime(inc.detectedAt)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Linked Tasks */}
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ClockCounterClockwise size={16} /> Recorded Tasks ({linkedTasks.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openRecordTask({ websiteId: website.id })}
            >
              + Add
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
            {linkedTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No recorded maintenance tasks for this website yet.
              </div>
            ) : (
              linkedTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      {task.title}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {task.outcome || task.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
