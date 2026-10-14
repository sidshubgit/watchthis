"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchIncidentById } from "@/mocks/api/incident-api";
import { fetchWebsiteById } from "@/mocks/api/website-api";
import { fetchTasks } from "@/mocks/api/task-api";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge, IncidentStatusBadge } from "@/components/shared/severity-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { formatTimestamp, formatRelativeTime } from "@/lib/dates";
import { formatDuration } from "@/lib/formatters";
import { useUiStore } from "@/stores/ui-store";
import { useDemoStore } from "@/stores/demo-store";
import {
  WarningCircle,
  ArrowLeft,
  Globe,
  HardDrives,
  CheckSquareOffset,
  ShieldCheck,
  Plus,
  ArrowClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = use(params);
  const { openRecordTask } = useUiStore();
  const { simulateRecovery, isPerformingAction } = useDemoStore();

  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => fetchIncidentById(incidentId),
  });

  const { data: website } = useQuery({
    queryKey: ["website", incident?.websiteId],
    queryFn: () => (incident?.websiteId ? fetchWebsiteById(incident.websiteId) : Promise.resolve(null)),
    enabled: !!incident?.websiteId,
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="space-y-6">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Back to Incidents
        </Link>
        <EmptyState
          icon={<WarningCircle size={28} />}
          title="Incident Not Found"
          description="The incident record requested could not be located in simulated logs."
          action={
            <Link href="/incidents">
              <Button variant="outline" size="sm">
                Return to Incidents
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const linkedTasks = allTasks.filter((t) => t.incidentId === incident.id);
  const isOpen = incident.status !== "resolved";

  const durationDisplay = incident.durationSeconds
    ? formatDuration(incident.durationSeconds)
    : formatDuration(
        Math.max(60, Math.floor((Date.now() - new Date(incident.detectedAt).getTime()) / 1000))
      ) + " (ongoing)";

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Incidents</span>
        </Link>
      </div>

      {/* Incident Header */}
      <PageHeader
        title={incident.title}
        description={`Incident ID: ${incident.id.toUpperCase()}`}
        badge={
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} size="md" />
            <IncidentStatusBadge status={incident.status} size="md" />
          </div>
        }
        actions={
          <>
            {isOpen && (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateRecovery(incident.websiteId || undefined)}
                disabled={isPerformingAction}
                title="Mark this incident resolved in demo mode"
              >
                <ArrowClockwise size={15} weight="bold" />
                <span>Simulate Recovery</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                openRecordTask({
                  incidentId: incident.id,
                  websiteId: incident.websiteId || undefined,
                })
              }
            >
              <Plus size={16} weight="bold" />
              <span>Record Task for Incident</span>
            </Button>
          </>
        }
      />

      {/* Incident Summary Card */}
      <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Incident Overview
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {incident.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Affected Target</span>
              {website ? (
                <Link
                  href={`/websites/${website.id}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Globe size={13} /> {website.name}
                </Link>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <HardDrives size={13} /> Linux VPS Host
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Detected Time</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatTimestamp(incident.detectedAt)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Duration</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {durationDisplay}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Lifecycle State</span>
              <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                {incident.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Notes if Resolved */}
      {incident.resolutionNotes && (
        <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
          <CardHeader className="py-3.5">
            <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={18} weight="fill" />
              Resolution Notes & Mitigation Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {incident.resolutionNotes}
            <div className="mt-2 text-[11px] text-slate-400">
              Resolved at {formatTimestamp(incident.resolvedAt)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident Event Log & Linked Tasks in 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Events Chronology */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <WarningCircle size={16} /> Incident Timeline Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {!incident.events || incident.events.length === 0 ? (
              <div className="text-xs text-slate-500">No telemetry log entries available.</div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {incident.events.map((ev) => (
                  <div key={ev.id} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ev.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRelativeTime(ev.occurredAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linked Operator Tasks */}
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckSquareOffset size={16} /> Operator Tasks ({linkedTasks.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openRecordTask({
                  incidentId: incident.id,
                  websiteId: incident.websiteId || undefined,
                })
              }
            >
              + Record Task
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
            {linkedTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No mitigation tasks linked to this incident yet.
              </div>
            ) : (
              linkedTasks.map((task) => (
                <div key={task.id} className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {task.outcome || task.description}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1.5">
                    Recorded {formatRelativeTime(task.createdAt)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
