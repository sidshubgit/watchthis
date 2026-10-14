import React from "react";
import { ServiceStatus } from "@/types/domain";
import { getStatusTheme } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  showDot = true,
  className,
}: StatusBadgeProps) {
  const theme = getStatusTheme(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border px-2.5 py-0.5 select-none transition-colors",
        size === "sm" ? "text-[11px] py-0 px-2" : "text-xs",
        theme.bg,
        theme.text,
        theme.border,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {status !== "healthy" && status !== "unknown" && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                theme.dot
              )}
            />
          )}
          <span
            className={cn("relative inline-flex rounded-full h-2 w-2", theme.dot)}
          />
        </span>
      )}
      {theme.label}
    </span>
  );
}
