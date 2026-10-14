import {
  Server,
  Website,
  Incident,
  Task,
  MetricSnapshot,
  TimelineEvent,
  TimeRange,
  TaskStatus,
  ServiceStatus,
} from "@/types/domain";
import { initialServer } from "../data/server";
import { initialWebsites } from "../data/websites";
import { initialIncidents } from "../data/incidents";
import { initialTasks } from "../data/tasks";
import { initialMetricSnapshots, generateMetricSnapshots } from "../data/metrics";
import { initialTimelineEvents } from "../data/timeline";
import { TaskFormData } from "@/lib/validation";

type RepositoryListener = () => void;

class MockRepository {
  private server: Server = { ...initialServer };
  private websites: Website[] = initialWebsites.map((w) => ({ ...w }));
  private incidents: Incident[] = initialIncidents.map((i) => ({ ...i, events: i.events ? [...i.events] : [] }));
  private tasks: Task[] = initialTasks.map((t) => ({ ...t }));
  private metricSnapshots: MetricSnapshot[] = initialMetricSnapshots.map((m) => ({ ...m }));
  private timelineEvents: TimelineEvent[] = initialTimelineEvents.map((e) => ({ ...e }));
  private listeners: Set<RepositoryListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        // Clear stale v1 cache (missing errorType/errorDetail fields)
        localStorage.removeItem("watchthis_websites_v1");
        const saved = localStorage.getItem("watchthis_websites_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.websites = parsed;
          }
        }
      } catch {}
    }
  }

  private persistWebsites() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("watchthis_websites_v2", JSON.stringify(this.websites));
      } catch {}
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in repository listener:", err);
      }
    });
  }

  public subscribe(listener: RepositoryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Latency simulator (200-450ms)
  private async delay(ms = 250): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- SERVER ---
  public async getServer(): Promise<Server> {
    await this.delay(200);
    if (!this.server) {
      this.server = { ...initialServer };
    }
    return { ...this.server };
  }

  // --- METRICS ---
  public async getMetricSnapshots(range: TimeRange = "24h"): Promise<MetricSnapshot[]> {
    await this.delay(200);
    const now = Date.now();
    let durationMs = 24 * 60 * 60 * 1000;
    if (range === "1h") durationMs = 1 * 60 * 60 * 1000;
    else if (range === "6h") durationMs = 6 * 60 * 60 * 1000;
    else if (range === "7d") durationMs = 7 * 24 * 60 * 60 * 1000;

    const filtered = this.metricSnapshots.filter(
      (m) => now - new Date(m.recordedAt).getTime() <= durationMs
    );
    return filtered.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }

  // --- WEBSITES ---
  public async getWebsites(filters?: { status?: string; search?: string; sort?: string }): Promise<Website[]> {
    await this.delay(100);
    if (!this.websites || this.websites.length === 0) {
      this.websites = initialWebsites.map((w) => ({ ...w }));
    }
    let result = [...this.websites];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((w) => w.status === filters.status);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (w) => w.name.toLowerCase().includes(q) || w.url.toLowerCase().includes(q)
      );
    }

    if (filters?.sort) {
      if (filters.sort === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filters.sort === "status") {
        const order: Record<ServiceStatus, number> = { down: 0, degraded: 1, healthy: 2, unknown: 3 };
        result.sort((a, b) => order[a.status] - order[b.status]);
      } else if (filters.sort === "responseTime") {
        result.sort((a, b) => (a.responseTimeMs ?? 9999) - (b.responseTimeMs ?? 9999));
      } else if (filters.sort === "uptime") {
        result.sort((a, b) => (b.uptimePercentage ?? 0) - (a.uptimePercentage ?? 0));
      }
    }

    return result;
  }

  public async getWebsiteById(id: string): Promise<Website | null> {
    await this.delay(180);
    const site = this.websites.find((w) => w.id === id);
    return site ? { ...site } : null;
  }

  public async probeWebsite(id: string): Promise<Website | null> {
    const site = this.websites.find((w) => w.id === id);
    if (!site) return null;

    try {
      if (typeof window !== "undefined") {
        const res = await fetch(`/api/websites/probe?url=${encodeURIComponent(site.url)}`);
        if (res.ok) {
          const data = await res.json();
          site.status = data.status;
          site.httpStatusCode = data.httpStatusCode;
          site.responseTimeMs = data.responseTimeMs;
          site.lastCheckedAt = data.checkedAt;
          site.errorType = data.errorType ?? null;
          site.errorDetail = data.errorDetail ?? null;
          if (data.responseTimeMs !== null) {
            site.historySparkline = [...site.historySparkline.slice(1), data.responseTimeMs];
          } else {
            site.historySparkline = [...site.historySparkline.slice(1), 0];
          }
          this.persistWebsites();
          this.notify();
        }
      }
    } catch (e) {
      console.warn("Live probe failed:", e);
    }
    return site ? { ...site } : null;
  }

  public async probeAllWebsites(): Promise<Website[]> {
    if (typeof window !== "undefined") {
      await Promise.allSettled(
        this.websites.map(async (site) => {
          try {
            const res = await fetch(`/api/websites/probe?url=${encodeURIComponent(site.url)}`);
            if (res.ok) {
              const data = await res.json();
              site.status = data.status;
              site.httpStatusCode = data.httpStatusCode;
              site.responseTimeMs = data.responseTimeMs;
              site.lastCheckedAt = data.checkedAt;
              site.errorType = data.errorType ?? null;
              site.errorDetail = data.errorDetail ?? null;
              if (data.responseTimeMs !== null) {
                site.historySparkline = [...site.historySparkline.slice(1), data.responseTimeMs];
              } else {
                site.historySparkline = [...site.historySparkline.slice(1), 0];
              }
            }
          } catch (e) {
            console.warn(`Probe failed for ${site.url}:`, e);
          }
        })
      );
      this.server.lastCheckedAt = new Date().toISOString();
      this.persistWebsites();
      this.notify();
    }
    return [...this.websites];
  }

  public async addWebsite(data: { name?: string; url: string; isCritical?: boolean }): Promise<Website> {
    await this.delay(150);
    let rawUrl = data.url.trim();
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = `https://${rawUrl}`;
    }

    let hostname = rawUrl;
    try {
      hostname = new URL(rawUrl).hostname;
    } catch {}

    const displayName = data.name?.trim() ? data.name.trim() : hostname;
    const id = `site-${Date.now()}`;

    const newSite: Website = {
      id,
      serverId: this.server.id,
      name: displayName,
      url: rawUrl,
      status: "unknown",
      responseTimeMs: null,
      httpStatusCode: null,
      uptimePercentage: 100,
      sslExpiryAt: new Date(Date.now() + 90 * 86400 * 1000).toISOString(),
      lastCheckedAt: null,
      isCritical: data.isCritical ?? false,
      historySparkline: [0, 0, 0, 0, 0, 0, 0, 0],
      errorType: null,
      errorDetail: null,
    };

    this.websites.unshift(newSite);
    this.persistWebsites();

    const now = new Date().toISOString();
    this.timelineEvents.unshift({
      id: `tl-site-add-${Date.now()}`,
      type: "maintenance_note",
      title: `Added website: ${displayName}`,
      description: `Registered ${rawUrl} into active synthetic uptime and health monitoring.`,
      occurredAt: now,
      severity: null,
      serverId: this.server.id,
      websiteId: id,
      incidentId: null,
      taskId: null,
      isNew: true,
    });

    this.notify();

    // Trigger live probe in background immediately
    if (typeof window !== "undefined") {
      this.probeWebsite(id);
    }

    return { ...newSite };
  }

  public async deleteWebsite(id: string): Promise<boolean> {
    await this.delay(150);
    const site = this.websites.find((w) => w.id === id);
    if (!site) return false;

    this.websites = this.websites.filter((w) => w.id !== id);
    this.persistWebsites();

    const now = new Date().toISOString();
    this.timelineEvents.unshift({
      id: `tl-site-del-${Date.now()}`,
      type: "maintenance_note",
      title: `Removed website: ${site.name}`,
      description: `Unregistered ${site.url} from active monitoring.`,
      occurredAt: now,
      severity: null,
      serverId: this.server.id,
      websiteId: null,
      incidentId: null,
      taskId: null,
      isNew: true,
    });

    this.notify();
    return true;
  }

  // --- INCIDENTS ---
  public async getIncidents(filters?: { status?: string; severity?: string; search?: string }): Promise<Incident[]> {
    await this.delay(200);
    let result = [...this.incidents];

    if (filters?.status && filters.status !== "all") {
      if (filters.status === "active") {
        result = result.filter((i) => i.status !== "resolved");
      } else {
        result = result.filter((i) => i.status === filters.status);
      }
    }

    if (filters?.severity && filters.severity !== "all") {
      result = result.filter((i) => i.severity === filters.severity);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    // Newest startedAt first
    return result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public async getIncidentById(id: string): Promise<Incident | null> {
    await this.delay(180);
    const inc = this.incidents.find((i) => i.id === id);
    return inc ? { ...inc, events: inc.events ? [...inc.events] : [] } : null;
  }

  // --- TASKS ---
  public async getTasks(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    websiteId?: string;
    incidentId?: string;
  }): Promise<Task[]> {
    await this.delay(200);
    let result = [...this.tasks];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters?.category && filters.category !== "all") {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters?.priority && filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    if (filters?.websiteId) {
      result = result.filter((t) => t.websiteId === filters.websiteId);
    }

    if (filters?.incidentId) {
      result = result.filter((t) => t.incidentId === filters.incidentId);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.outcome && t.outcome.toLowerCase().includes(q))
      );
    }

    // Newest updated first
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async getTaskById(id: string): Promise<Task | null> {
    await this.delay(180);
    const task = this.tasks.find((t) => t.id === id);
    return task ? { ...task } : null;
  }

  public async createTask(input: TaskFormData): Promise<Task> {
    await this.delay(350);
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: input.title,
      description: input.description ?? "",
      category: input.category,
      priority: input.priority,
      status: input.status,
      createdAt: now,
      updatedAt: now,
      completedAt: input.status === "completed" ? now : null,
      serverId: "srv-primary-vps",
      websiteId: input.websiteId || null,
      incidentId: input.incidentId || null,
      outcome: input.outcome || null,
    };

    this.tasks.unshift(newTask);

    // Create a corresponding timeline event
    const eventType = input.status === "completed" ? "task_completed" : "task_created";
    const tlEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      type: eventType,
      title: `${input.status === "completed" ? "Task completed" : "Task created"}: ${newTask.title}`,
      description: newTask.description || `Operator recorded ${newTask.category} task.`,
      occurredAt: now,
      severity: null,
      serverId: newTask.serverId,
      websiteId: newTask.websiteId,
      incidentId: newTask.incidentId,
      taskId: newTask.id,
      isNew: true,
    };
    this.timelineEvents.unshift(tlEvent);

    this.notify();
    return newTask;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.delay(300);
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const current = this.tasks[index];
    const now = new Date().toISOString();
    const isNowCompleted = updates.status === "completed" && current.status !== "completed";

    const updatedTask: Task = {
      ...current,
      ...updates,
      updatedAt: now,
      completedAt: isNowCompleted ? now : (updates.status && updates.status !== "completed" ? null : current.completedAt),
    };

    this.tasks[index] = updatedTask;

    // Timeline event for status update
    const eventType = isNowCompleted ? "task_completed" : "task_updated";
    const tlEvent: TimelineEvent = {
      id: `tl-upd-${Date.now()}`,
      type: eventType,
      title: `${isNowCompleted ? "Task completed" : "Task updated"}: ${updatedTask.title}`,
      description: updatedTask.outcome || updatedTask.description || `Task status updated to ${updatedTask.status}.`,
      occurredAt: now,
      severity: null,
      serverId: updatedTask.serverId,
      websiteId: updatedTask.websiteId,
      incidentId: updatedTask.incidentId,
      taskId: updatedTask.id,
      isNew: true,
    };
    this.timelineEvents.unshift(tlEvent);

    this.notify();
    return updatedTask;
  }

  public async deleteTask(id: string): Promise<boolean> {
    await this.delay(200);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.notify();
    return true;
  }

  // --- TIMELINE ---
  public async getTimelineEvents(filters?: {
    type?: string;
    severity?: string;
    search?: string;
    websiteId?: string;
    incidentId?: string;
  }): Promise<TimelineEvent[]> {
    await this.delay(220);
    let result = [...this.timelineEvents];

    if (filters?.type && filters.type !== "all") {
      result = result.filter((e) => e.type === filters.type);
    }

    if (filters?.severity && filters.severity !== "all") {
      result = result.filter((e) => e.severity === filters.severity);
    }

    if (filters?.websiteId) {
      result = result.filter((e) => e.websiteId === filters.websiteId);
    }

    if (filters?.incidentId) {
      result = result.filter((e) => e.incidentId === filters.incidentId);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }

    // Newest occurredAt first
    return result.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  // --- DEMO ACTIONS ---
  public async simulateOutage(websiteId = "site-aurora"): Promise<void> {
    await this.delay(300);
    const targetSite = this.websites.find((w) => w.id === websiteId) || this.websites[0];
    const now = new Date().toISOString();

    // 1. Mark site down
    targetSite.status = "down";
    targetSite.httpStatusCode = 503;
    targetSite.responseTimeMs = null;
    targetSite.lastCheckedAt = now;
    targetSite.historySparkline = [...targetSite.historySparkline.slice(1), 0];

    // 2. Open incident
    const newIncidentId = `inc-sim-${Date.now()}`;
    const newIncident: Incident = {
      id: newIncidentId,
      title: `Service Outage: ${targetSite.name}`,
      description: `Automated health check received HTTP 503 Service Unavailable for ${targetSite.url}.`,
      severity: targetSite.isCritical ? "critical" : "high",
      status: "open",
      serverId: "srv-primary-vps",
      websiteId: targetSite.id,
      startedAt: now,
      detectedAt: now,
      resolvedAt: null,
      durationSeconds: null,
      resolutionNotes: null,
      events: [
        {
          id: `ev-sim-${Date.now()}`,
          incidentId: newIncidentId,
          title: "Outage detected by synthetic monitor",
          description: "HTTP 503 response received with connection error.",
          occurredAt: now,
          status: "open",
        },
      ],
    };
    this.incidents.unshift(newIncident);

    // 3. Add timeline events
    this.timelineEvents.unshift({
      id: `tl-outage-${Date.now()}`,
      type: "website_down",
      title: `${targetSite.name} is DOWN`,
      description: `HTTP 503 Service Unavailable detected during automated probe.`,
      occurredAt: now,
      severity: targetSite.isCritical ? "critical" : "high",
      serverId: "srv-primary-vps",
      websiteId: targetSite.id,
      incidentId: newIncidentId,
      taskId: null,
      isNew: true,
    });

    this.timelineEvents.unshift({
      id: `tl-inc-${Date.now()}`,
      type: "incident_opened",
      title: `Incident opened: ${newIncident.title}`,
      description: newIncident.description,
      occurredAt: now,
      severity: newIncident.severity,
      serverId: "srv-primary-vps",
      websiteId: targetSite.id,
      incidentId: newIncidentId,
      taskId: null,
      isNew: true,
    });

    this.server.lastCheckedAt = now;
    this.notify();
  }

  public async simulateRecovery(targetWebsiteId?: string): Promise<void> {
    await this.delay(300);
    const now = new Date().toISOString();

    // Find any down website or the specific one
    const targetSite = targetWebsiteId
      ? this.websites.find((w) => w.id === targetWebsiteId)
      : this.websites.find((w) => w.status === "down" || w.status === "degraded");

    if (!targetSite) {
      // Nothing is down
      return;
    }

    targetSite.status = "healthy";
    targetSite.httpStatusCode = 200;
    targetSite.responseTimeMs = 115;
    targetSite.lastCheckedAt = now;
    targetSite.historySparkline = [...targetSite.historySparkline.slice(1), 115];

    // Find associated open incident
    const incident = this.incidents.find((i) => i.websiteId === targetSite.id && i.status !== "resolved");
    if (incident) {
      incident.status = "resolved";
      incident.resolvedAt = now;
      const started = new Date(incident.startedAt).getTime();
      incident.durationSeconds = Math.max(60, Math.floor((new Date(now).getTime() - started) / 1000));
      incident.resolutionNotes = "Automated health check verified HTTP 200 OK across all edges. Traffic back to normal.";
      if (!incident.events) incident.events = [];
      incident.events.push({
        id: `ev-res-${Date.now()}`,
        incidentId: incident.id,
        title: "All health probes passing",
        description: "Response code 200 OK observed with 115ms response latency.",
        occurredAt: now,
        status: "resolved",
      });

      this.timelineEvents.unshift({
        id: `tl-inc-res-${Date.now()}`,
        type: "incident_resolved",
        title: `Incident resolved: ${incident.title}`,
        description: incident.resolutionNotes,
        occurredAt: now,
        severity: incident.severity,
        serverId: "srv-primary-vps",
        websiteId: targetSite.id,
        incidentId: incident.id,
        taskId: null,
        isNew: true,
      });
    }

    this.timelineEvents.unshift({
      id: `tl-rec-${Date.now()}`,
      type: "website_recovered",
      title: `${targetSite.name} recovered to HEALTHY`,
      description: `Target returned HTTP 200 OK (115ms latency).`,
      occurredAt: now,
      severity: null,
      serverId: "srv-primary-vps",
      websiteId: targetSite.id,
      incidentId: incident?.id || null,
      taskId: null,
      isNew: true,
    });

    this.server.lastCheckedAt = now;
    this.notify();
  }

  public resetDemoData(): void {
    this.server = { ...initialServer, lastCheckedAt: new Date().toISOString() };
    this.websites = initialWebsites.map((w) => ({
      ...w,
      lastCheckedAt: new Date().toISOString(),
      historySparkline: [...w.historySparkline],
    }));
    this.incidents = initialIncidents.map((i) => ({
      ...i,
      events: i.events ? [...i.events] : [],
    }));
    this.tasks = initialTasks.map((t) => ({ ...t }));
    this.metricSnapshots = generateMetricSnapshots();
    this.timelineEvents = initialTimelineEvents.map((e) => ({ ...e, isNew: false }));
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("watchthis_websites_v1");
        localStorage.removeItem("watchthis_websites_v2");
      } catch {}
    }
    this.notify();
  }
}

// Export singleton instance
export const mockRepository = new MockRepository();
