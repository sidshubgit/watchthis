"use client";

import React from "react";
import { TimelineEvent } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/dates";
import {
  ClockCounterClockwise,
  ArrowRight,
  WarningCircle,
  ShieldCheck,
  CheckSquareOffset,
  Cpu,
  Globe,
  Note,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TimelinePreviewProps {
  events: TimelineEvent[];
}

export function TimelinePreview({ events }: TimelinePreviewProps) {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "website_down":
        return <WarningCircle className="text-rose-500" size={17} weight="fill" />;
      case "website_recovered":
        return <ShieldCheck className="text-emerald-500" size={17} weight="fill" />;
      case "website_degraded":
        return <WarningCircle className="text-amber-500" size={17} weight="fill" />;
      case "incident_opened":
        return <WarningCircle className="text-rose-500" size={17} weight="bold" />;
      case "incident_resolved":
        return <ShieldCheck className="text-emerald-500" size={17} weight="bold" />;
      case "server_metric_warning":
        return <Cpu className="text-amber-500" size={17} weight="bold" />;
      case "task_completed":
        return <CheckSquareOffset className="text-emerald-500" size={17} weight="bold" />;
      case "task_created":
      case "task_updated":
        return <CheckSquareOffset className="text-blue-500" size={17} weight="bold" />;
      default:
        return <Note className="text-slate-400" size={17} />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3.5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <ClockCounterClockwise size={16} /> Live Ops Timeline Preview
          </CardTitle>
        </div>
        <Link
          href="/timeline"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>View Full Timeline</span>
          <ArrowRight size={13} />
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
        {events.slice(0, 5).map((ev) => {
          // Route destination based on entity
          let href = "/timeline";
          if (ev.incidentId) href = `/incidents/${ev.incidentId}`;
          else if (ev.websiteId) href = `/websites/${ev.websiteId}`;
          else if (ev.taskId) href = `/tasks`;

          return (
            <Link
              key={ev.id}
              href={href}
              className={cn(
                "flex items-start gap-3 p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group",
                ev.isNew && "bg-blue-500/[0.04]"
              )}
            >
              <div className="mt-0.5 shrink-0">{getEventIcon(ev.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {ev.title}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {formatRelativeTime(ev.occurredAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {ev.description}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
