"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTimelineEvents } from "@/mocks/api/timeline-api";
import { fetchWebsites } from "@/mocks/api/website-api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { formatTimestamp, formatRelativeTime } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import { useDemoStore } from "@/stores/demo-store";
import {
  ClockCounterClockwise,
  MagnifyingGlass,
  WarningCircle,
  ShieldCheck,
  CheckSquareOffset,
  Cpu,
  Globe,
  Note,
  ArrowUp,
  Lightning,
  ArrowClockwise,
  Plus,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TimelineEventType, IncidentSeverity } from "@/types/domain";

export default function TimelinePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");

  const { openRecordTask } = useUiStore();
  const {
    simulateOutage,
    simulateRecovery,
    hasNewTimelineEvents,
    newTimelineEventsCount,
    clearNewTimelineEvents,
    isPerformingAction,
  } = useDemoStore();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["timeline", typeFilter, severityFilter, websiteFilter, search],
    queryFn: () =>
      fetchTimelineEvents({
        type: typeFilter,
        severity: severityFilter,
        websiteId: websiteFilter !== "all" ? websiteFilter : undefined,
        search,
      }),
  });

  const { data: websites = [] } = useQuery({
    queryKey: ["websites"],
    queryFn: () => fetchWebsites(),
  });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSeverityFilter("all");
    setWebsiteFilter("all");
  };

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case "website_down":
        return <WarningCircle className="text-rose-500" size={20} weight="fill" />;
      case "website_recovered":
        return <ShieldCheck className="text-emerald-500" size={20} weight="fill" />;
      case "website_degraded":
        return <WarningCircle className="text-amber-500" size={20} weight="fill" />;
      case "incident_opened":
        return <WarningCircle className="text-rose-500" size={20} weight="bold" />;
      case "incident_resolved":
        return <ShieldCheck className="text-emerald-500" size={20} weight="bold" />;
      case "server_metric_warning":
        return <Cpu className="text-amber-500" size={20} weight="bold" />;
      case "task_completed":
        return <CheckSquareOffset className="text-emerald-500" size={20} weight="bold" />;
      case "task_created":
      case "task_updated":
        return <CheckSquareOffset className="text-blue-500" size={20} weight="bold" />;
      default:
        return <Note className="text-slate-400" size={20} />;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    clearNewTimelineEvents();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Live Ops Timeline"
        description="Health changes, incidents, and the work you record—in one unified chronological story."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {events.length} events
          </span>
        }
        actions={
          <>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => simulateOutage("site-aurora")}
              disabled={isPerformingAction}
              title="Add simulated outage event"
            >
              <Lightning size={15} weight="fill" className="text-amber-500" />
              <span>Simulate Outage</span>
            </Button>

            <Button
              variant="subtle"
              size="sm"
              onClick={() => simulateRecovery()}
              disabled={isPerformingAction}
              title="Add simulated recovery event"
            >
              <ArrowClockwise size={15} weight="bold" />
              <span>Simulate Recovery</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => openRecordTask()}
            >
              <Plus size={16} weight="bold" />
              <span>Record Task</span>
            </Button>
          </>
        }
      />

      {/* Floating New Events Indicator */}
      {hasNewTimelineEvents && (
        <div className="sticky top-20 z-20 flex justify-center animate-in slide-in-from-top duration-200">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-xs shadow-lg hover:bg-blue-700 transition-all select-none"
          >
            <ArrowUp size={15} weight="bold" />
            <span>
              {newTimelineEventsCount} new operational event{newTimelineEventsCount > 1 ? "s" : ""}
            </span>
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, actions, domains..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Event Type Filter */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Event Types</option>
            <option value="website_down">Outages</option>
            <option value="website_recovered">Recoveries</option>
            <option value="incident_opened">Incident Opened</option>
            <option value="incident_resolved">Incident Resolved</option>
            <option value="task_created">Task Created</option>
            <option value="task_completed">Task Completed</option>
            <option value="server_metric_warning">Server Warnings</option>
          </Select>

          {/* Severity Filter */}
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

          {/* Website Filter */}
          <Select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Entities</option>
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Chronological Timeline Container */}
      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          Loading timeline events...
        </Card>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={28} />}
          title="No timeline events match your criteria"
          description="Adjust or reset your filters to review earlier operational logs."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {events.map((ev) => {
            let targetHref = "/timeline";
            let targetLabel = "Inspect";

            if (ev.incidentId) {
              targetHref = `/incidents/${ev.incidentId}`;
              targetLabel = "View Incident";
            } else if (ev.websiteId) {
              targetHref = `/websites/${ev.websiteId}`;
              targetLabel = "View Website";
            } else if (ev.taskId) {
              targetHref = `/tasks`;
              targetLabel = "View Task";
            }

            return (
              <div
                key={ev.id}
                className={cn(
                  "relative group transition-all",
                  ev.isNew && "animate-in fade-in slide-in-from-left duration-300"
                )}
              >
                {/* Node Dot on vertical ruler line */}
                <div className="absolute -left-6 sm:-left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xs shrink-0">
                  <span className="h-2 w-2 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors" />
                </div>

                {/* Event Card */}
                <Card
                  className={cn(
                    "p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all",
                    ev.isNew && "border-blue-500/40 bg-blue-500/[0.02]"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0 mt-0.5">
                        {getEventIcon(ev.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {ev.title}
                          </h4>
                          {ev.severity && <SeverityBadge severity={ev.severity} size="sm" />}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                          {ev.description}
                        </p>

                        {/* Associated Entities Chips */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {ev.websiteId && (
                            <Link
                              href={`/websites/${ev.websiteId}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500"
                            >
                              <Globe size={12} />
                              <span>Website</span>
                            </Link>
                          )}
                          {ev.incidentId && (
                            <Link
                              href={`/incidents/${ev.incidentId}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:underline"
                            >
                              <WarningCircle size={12} />
                              <span>Incident</span>
                            </Link>
                          )}
                          {ev.taskId && (
                            <Link
                              href={`/tasks`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <CheckSquareOffset size={12} />
                              <span>Task</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp & Link */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          {formatRelativeTime(ev.occurredAt)}
                        </span>
                        <span
                          className="text-[10px] text-slate-400 font-mono block"
                          title="Exact ISO event timestamp"
                        >
                          {formatTimestamp(ev.occurredAt)}
                        </span>
                      </div>

                      <Link href={targetHref} className="mt-1">
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                          {targetLabel} →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
