"use client";

import React from "react";
import { Incident } from "@/types/domain";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/dates";
import { WarningCircle, ArrowRight, CheckSquareOffset } from "@phosphor-icons/react";
import Link from "next/link";
import { useUiStore } from "@/stores/ui-store";

interface PriorityIncidentBannerProps {
  incident: Incident | null;
}

export function PriorityIncidentBanner({ incident }: PriorityIncidentBannerProps) {
  const { openRecordTask } = useUiStore();

  if (!incident) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-4 sm:p-5 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <WarningCircle size={22} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Active Outage Requiring Attention
              </span>
              <SeverityBadge severity={incident.severity} size="sm" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {incident.title}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl line-clamp-2">
              {incident.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Detected {formatRelativeTime(incident.detectedAt)}</span>
              <span>•</span>
              <span className="capitalize">Status: {incident.status}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
            <CheckSquareOffset size={15} weight="bold" />
            <span>Record Task</span>
          </Button>
          <Link href={`/incidents/${incident.id}`}>
            <Button variant="danger" size="sm">
              <span>Investigate</span>
              <ArrowRight size={15} weight="bold" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
