import React from "react";
import { IncidentSeverity, IncidentStatus } from "@/types/domain";
import { getSeverityTheme, getIncidentStatusTheme } from "@/lib/status";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  size?: "sm" | "md";
  className?: string;
}

export function SeverityBadge({
  severity,
  size = "md",
  className,
}: SeverityBadgeProps) {
  const theme = getSeverityTheme(severity);

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 select-none uppercase tracking-wider",
        size === "sm" ? "text-[10px] py-0 px-2" : "text-xs",
        theme.bg,
        theme.text,
        theme.border,
        className
      )}
    >
      {theme.label}
    </span>
  );
}

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  size?: "sm" | "md";
  className?: string;
}

export function IncidentStatusBadge({
  status,
  size = "md",
  className,
}: IncidentStatusBadgeProps) {
  const theme = getIncidentStatusTheme(status);

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 select-none",
        size === "sm" ? "text-[11px] py-0 px-2" : "text-xs",
        theme.bg,
        theme.text,
        theme.border,
        className
      )}
    >
      {theme.label}
    </span>
  );
}
