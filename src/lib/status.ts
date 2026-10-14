import { ServiceStatus, IncidentSeverity, IncidentStatus, Server, Website, OverallHealth } from "@/types/domain";

export function getOverallHealth(server: Server | null, websites: Website[]): OverallHealth {
  if (!server || websites.length === 0) {
    return {
      status: "unknown",
      label: "Unknown",
      summary: "Waiting for telemetry checks",
      healthyWebsitesCount: 0,
      degradedWebsitesCount: 0,
      downWebsitesCount: 0,
      totalWebsitesCount: websites.length,
      activeIncidentsCount: 0,
      serverStatus: server?.status ?? "unknown",
      lastCheckedAt: server?.lastCheckedAt ?? new Date().toISOString(),
    };
  }

  let healthyCount = 0;
  let degradedCount = 0;
  let downCount = 0;
  let criticalDown = false;

  for (const site of websites) {
    if (site.status === "healthy") {
      healthyCount++;
    } else if (site.status === "degraded") {
      degradedCount++;
    } else if (site.status === "down") {
      downCount++;
      if (site.isCritical) {
        criticalDown = true;
      }
    }
  }

  // Derive status
  let overallStatus: ServiceStatus = "healthy";
  let label = "All Systems Operational";
  let summary = `Server and all ${websites.length} websites are running normally.`;

  if (server.status === "down" || criticalDown || downCount >= 2) {
    overallStatus = "down";
    label = criticalDown ? "Critical Service Outage" : "Major Service Disruption";
    summary = criticalDown
      ? "A critical website is currently unreachable."
      : `${downCount} website${downCount > 1 ? "s are" : " is"} down.`;
  } else if (
    server.status === "degraded" ||
    downCount > 0 ||
    degradedCount > 0 ||
    server.cpuUsage > 85 ||
    server.memoryUsedBytes / server.memoryTotalBytes > 0.9
  ) {
    overallStatus = "degraded";
    label = "Degraded Performance";
    summary = downCount > 0 
      ? `1 non-critical site is offline.` 
      : `${degradedCount} site${degradedCount > 1 ? "s" : ""} experiencing degraded response time.`;
  }

  return {
    status: overallStatus,
    label,
    summary,
    healthyWebsitesCount: healthyCount,
    degradedWebsitesCount: degradedCount,
    downWebsitesCount: downCount,
    totalWebsitesCount: websites.length,
    activeIncidentsCount: overallStatus === "healthy" ? 0 : (downCount + degradedCount > 0 ? 1 : 0),
    serverStatus: server.status,
    lastCheckedAt: server.lastCheckedAt,
  };
}

export function getStatusTheme(status: ServiceStatus) {
  switch (status) {
    case "healthy":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30 dark:border-emerald-500/30",
        dot: "bg-emerald-500",
        ring: "ring-emerald-500/30",
        label: "Healthy",
      };
    case "degraded":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30 dark:border-amber-500/30",
        dot: "bg-amber-500",
        ring: "ring-amber-500/30",
        label: "Degraded",
      };
    case "down":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/15",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30 dark:border-rose-500/30",
        dot: "bg-rose-500",
        ring: "ring-rose-500/30",
        label: "Down",
      };
    case "unknown":
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/30 dark:border-zinc-500/30",
        dot: "bg-zinc-400",
        ring: "ring-zinc-400/30",
        label: "Unknown",
      };
  }
}

export function getSeverityTheme(severity: IncidentSeverity) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/15",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        label: "Critical",
      };
    case "high":
      return {
        bg: "bg-orange-500/10 dark:bg-orange-500/15",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-500/30",
        label: "High",
      };
    case "medium":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        label: "Medium",
      };
    case "low":
    default:
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-500/30",
        label: "Low",
      };
  }
}

export function getIncidentStatusTheme(status: IncidentStatus) {
  switch (status) {
    case "open":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/15",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        label: "Open",
      };
    case "investigating":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        label: "Investigating",
      };
    case "monitoring":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-500/30",
        label: "Monitoring",
      };
    case "resolved":
    default:
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        label: "Resolved",
      };
  }
}
