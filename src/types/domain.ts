export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "monitoring" | "resolved";
export type TaskStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskCategory =
  | "maintenance"
  | "troubleshooting"
  | "deployment"
  | "backup"
  | "security"
  | "monitoring"
  | "other";

export type TimelineEventType =
  | "server_metric_warning"
  | "website_down"
  | "website_degraded"
  | "website_recovered"
  | "incident_opened"
  | "incident_resolved"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "maintenance_note";

export interface Server {
  id: string;
  name: string;
  hostname: string;
  operatingSystem: string;
  ipAddress: string;
  status: ServiceStatus;
  cpuUsage: number; // percentage 0-100
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  networkInBytesPerSecond: number;
  networkOutBytesPerSecond: number;
  uptimeSeconds: number;
  lastCheckedAt: string; // ISO 8601
}

export interface Website {
  id: string;
  serverId: string;
  name: string;
  url: string;
  status: ServiceStatus;
  responseTimeMs: number | null;
  httpStatusCode: number | null;
  uptimePercentage: number | null;
  sslExpiryAt: string | null;
  lastCheckedAt: string | null;
  isCritical: boolean;
  historySparkline: number[]; // recent response times for mini chart
  errorType: string | null;   // e.g. "network_error", "content_error", "server_error"
  errorDetail: string | null; // human-readable probe error description
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  occurredAt: string;
  status: IncidentStatus;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  serverId: string;
  websiteId: string | null;
  startedAt: string;
  detectedAt: string;
  resolvedAt: string | null;
  durationSeconds: number | null;
  resolutionNotes: string | null;
  events?: IncidentEvent[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  serverId: string | null;
  websiteId: string | null;
  incidentId: string | null;
  outcome: string | null;
}

export interface MetricSnapshot {
  id: string;
  serverId: string;
  cpuUsage: number;
  memoryUsagePercentage: number;
  diskUsagePercentage: number;
  networkInBytesPerSecond: number;
  networkOutBytesPerSecond: number;
  recordedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  occurredAt: string;
  severity: IncidentSeverity | null;
  serverId: string | null;
  websiteId: string | null;
  incidentId: string | null;
  taskId: string | null;
  isNew?: boolean; // For animated entry in current session
}

export interface OverallHealth {
  status: ServiceStatus;
  label: string;
  summary: string;
  healthyWebsitesCount: number;
  degradedWebsitesCount: number;
  downWebsitesCount: number;
  totalWebsitesCount: number;
  activeIncidentsCount: number;
  serverStatus: ServiceStatus;
  lastCheckedAt: string;
}

export type TimeRange = "1h" | "6h" | "24h" | "7d";

export interface DemoSettingsState {
  isSimulatedLive: boolean;
  updateCadenceSeconds: number;
  activeScenario: "normal" | "outage_simulated" | "custom";
}
