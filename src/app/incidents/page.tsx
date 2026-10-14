"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchIncidents } from "@/mocks/api/incident-api";
import { fetchWebsites } from "@/mocks/api/website-api";
import { fetchTasks } from "@/mocks/api/task-api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge, IncidentStatusBadge } from "@/components/shared/severity-badge";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/dates";
import { formatDuration as formatDurationSec } from "@/lib/formatters";
import { useDemoStore } from "@/stores/demo-store";
import {
  WarningCircle,
  MagnifyingGlass,
  ArrowRight,
  Globe,
  HardDrives,
  CheckSquareOffset,
  Lightning,
  ArrowClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { simulateOutage, simulateRecovery, isPerformingAction } = useDemoStore();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents", statusFilter, severityFilter, search],
    queryFn: () =>
      fetchIncidents({
        status: statusFilter,
        severity: severityFilter,
        search,
      }),
  });

  const { data: websites = [] } = useQuery({
    queryKey: ["websites"],
    queryFn: () => fetchWebsites(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSeverityFilter("all");
  };

  const hasActiveIncidents = incidents.some((i) => i.status !== "resolved");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Incidents & Outages"
        description="Historical log and real-time response records for infrastructure disruptions and service degradations."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {incidents.length} incidents
          </span>
        }
        actions={
          <>
            {hasActiveIncidents ? (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateRecovery()}
                disabled={isPerformingAction}
              >
                <ArrowClockwise size={15} weight="bold" />
                <span>Simulate Recovery</span>
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateOutage("site-aurora")}
                disabled={isPerformingAction}
              >
                <Lightning size={15} weight="fill" className="text-amber-500" />
                <span>Simulate Outage</span>
              </Button>
            )}
          </>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident title, description, website..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Lifecycles</option>
            <option value="active">Active Only</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </Select>

          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-32 h-9 text-xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          <TableRowSkeleton />
          <TableRowSkeleton />
        </Card>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={<WarningCircle size={28} />}
          title="No incidents match your criteria"
          description="Clear your filters to view historical incident reports."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const affectedWebsite = websites.find((w) => w.id === incident.websiteId);
            const linkedTasksCount = tasks.filter((t) => t.incidentId === incident.id).length;
            const isOpen = incident.status !== "resolved";

            // Calculate duration
            const durationDisplay = incident.durationSeconds
              ? formatDurationSec(incident.durationSeconds)
              : formatDurationSec(
                  Math.max(60, Math.floor((Date.now() - new Date(incident.detectedAt).getTime()) / 1000))
                ) + " (ongoing)";

            return (
              <Card
                key={incident.id}
                className={cn(
                  "p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all",
                  isOpen && "border-rose-500/30 bg-rose-500/[0.02]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl shrink-0 mt-0.5",
                        isOpen
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}
                    >
                      <WarningCircle size={22} weight="fill" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          href={`/incidents/${incident.id}`}
                          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-500 transition-colors"
                        >
                          {incident.title}
                        </Link>
                        <SeverityBadge severity={incident.severity} size="sm" />
                        <IncidentStatusBadge status={incident.status} size="sm" />
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 max-w-2xl leading-relaxed">
                        {incident.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {affectedWebsite ? (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Globe size={13} /> {affectedWebsite.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <HardDrives size={13} /> VPS Host (Kernel/Resource)
                          </span>
                        )}
                        <span>•</span>
                        <span>Detected {formatRelativeTime(incident.detectedAt)}</span>
                        <span>•</span>
                        <span>Duration: {durationDisplay}</span>
                        {linkedTasksCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                              <CheckSquareOffset size={13} /> {linkedTasksCount} linked task{linkedTasksCount > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="self-end md:self-center shrink-0">
                    <Link href={`/incidents/${incident.id}`}>
                      <Button
                        variant={isOpen ? "danger" : "outline"}
                        size="sm"
                        className="gap-1.5"
                      >
                        <span>{isOpen ? "Investigate" : "Inspect History"}</span>
                        <ArrowRight size={14} weight="bold" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
