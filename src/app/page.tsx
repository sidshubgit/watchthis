"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchServer } from "@/mocks/api/server-api";
import { fetchWebsites } from "@/mocks/api/website-api";
import { fetchIncidents } from "@/mocks/api/incident-api";
import { fetchTimelineEvents } from "@/mocks/api/timeline-api";
import { OverallHealthCard } from "@/components/dashboard/overall-health-card";
import { PriorityIncidentBanner } from "@/components/dashboard/priority-incident-banner";
import { ServerHealthSummary } from "@/components/dashboard/server-health-summary";
import { WebsiteOverview } from "@/components/dashboard/website-overview";
import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useDemoStore } from "@/stores/demo-store";
import { Plus, Lightning, ArrowClockwise } from "@phosphor-icons/react";

export default function CommandCenterPage() {
  const { openRecordTask, openAddWebsite } = useUiStore();
  const { simulateOutage, simulateRecovery, probeLiveWebsites, isProbingLive, isPerformingAction } = useDemoStore();

  const { data: server, isLoading: isServerLoading } = useQuery({
    queryKey: ["server"],
    queryFn: () => fetchServer(),
  });

  const { data: websites = [], isLoading: isWebsitesLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: () => fetchWebsites(),
  });

  const { data: incidents = [], isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  const { data: timelineEvents = [], isLoading: isTimelineLoading } = useQuery({
    queryKey: ["timeline"],
    queryFn: () => fetchTimelineEvents(),
  });

  const activeIncident = incidents.find((i) => i.status !== "resolved") || null;
  const isLoading = isServerLoading || isWebsitesLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        description="Unified status of your primary VPS host, hosted websites, and real-time operational story."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {activeIncident ? (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateRecovery()}
                disabled={isPerformingAction}
                title="Resolve the open incident in the guided demo"
              >
                <ArrowClockwise size={15} weight="bold" />
                <span>Simulate Recovery</span>
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => simulateOutage("site-amsolit")}
                disabled={isPerformingAction}
                title="Trigger simulated outage test"
              >
                <Lightning size={15} weight="fill" className="text-amber-500" />
                <span>Simulate Outage</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => probeLiveWebsites()}
              isLoading={isProbingLive}
              title="Run live HTTP network probes against all websites now"
            >
              <ArrowClockwise size={15} weight="bold" />
              <span>Probe Live</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAddWebsite()}
              title="Register a new website or domain into live monitoring"
            >
              <Plus size={15} weight="bold" />
              <span>Add Website</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => openRecordTask()}
            >
              <Plus size={16} weight="bold" />
              <span>Record Task</span>
            </Button>
          </div>
        }
      />

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* Overall Health Summary */}
          <OverallHealthCard server={server || null} websites={websites} />

          {/* Priority Incident Banner if an active outage exists */}
          {activeIncident && <PriorityIncidentBanner incident={activeIncident} />}

          {/* VPS Hardware & Resource Telemetry */}
          <ServerHealthSummary server={server || null} />

          {/* Two-column layout for Websites & Live Timeline preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <WebsiteOverview websites={websites} />
            <TimelinePreview events={timelineEvents} />
          </div>
        </>
      )}
    </div>
  );
}
