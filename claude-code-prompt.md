# watchthis — Claude Code Master Prompt
## Production-quality frontend implementation blueprint

> **Mission:** Build a polished, responsive, frontend-only React application named **watchthis**: a personal command center for monitoring one Linux VPS and the websites hosted on it. Its signature experience is the **Live Ops Timeline**, which connects service-health events, incidents, manually recorded tasks, and recovery events into one chronological operational story.
>
> **Phase 1 is frontend only.** Do not build or connect a backend, database, authentication, payments, real monitoring agent, real uptime checks, shell execution, or server-control functionality. Use realistic mock APIs, deterministic mock data, and clearly labeled simulated live events. The application must look and behave like a thoughtfully designed product, not a static wireframe.

---

# 1. Project Objective

Build the complete first-phase user interface for **watchthis**, an elegant personal monitoring workspace for one Linux VPS and its hosted websites.

The user needs to answer these questions quickly:

1. Is my server healthy?
2. Are my hosted websites reachable?
3. Is anything degraded or down right now?
4. What happened, when did it happen, and what was affected?
5. What did I do to investigate or fix it?
6. What work remains to be done?

The interface should make these answers easy to find without overwhelming the user with enterprise observability complexity. The product is for a single operator, not a team-management suite.

## Product positioning

**watchthis is your personal, real-time infrastructure command center that monitors your Linux server and hosted websites, alerts you when something goes wrong, and records every task and fix so you always know what happened and why.**

## Product principles

- Design questions, not widgets. Every panel must answer a useful operational question.
- Make the current state obvious. Healthy, degraded, down, recovering, stale, and unknown must not be visually conflated.
- Connect events to work. The relationship between an incident and the tasks recorded around it is a defining product feature.
- Favor signal over noise. Show urgent issues first, with deeper diagnostics available when requested.
- Keep the product personal and fast. Avoid team seats, role management, enterprise permission systems, or complicated configuration.
- Preserve trust. Simulated information must be clearly identifiable as demo data; never imply the UI is connected to the user's actual server.
- Design once and adapt across mobile, tablet, and desktop.
- Use empty, loading, error, offline, and stale-data states as intentional product states, not afterthoughts.

---

# 2. Scope Boundaries

## In scope for Phase 1

- A fully interactive React frontend with seven main sections.
- One mock Linux VPS and a realistic inventory of hosted websites.
- Server-health cards and time-series visualizations using mock telemetry.
- Website status, response time, HTTP status, uptime, and illustrative SSL-expiry information.
- A guided demo mode with simulated incidents, status transitions, and recovery.
- An incident list and incident detail experience.
- A manual task recorder with validation, editing, completion, and links to websites/incidents.
- A chronological Live Ops Timeline combining server events, website status changes, incidents, tasks, and recoveries.
- Search, filters, sorting, detail panels, forms, toasts, confirmations, and contextual navigation.
- Light and dark themes.
- Responsive desktop sidebar and mobile navigation.
- Realistic mock API modules with loading delays and deterministic behavior.
- Type-safe models and a clean architecture that can later accept a real backend.
- Accessible interaction patterns, keyboard navigation, reduced-motion support, and clear status semantics.

## Explicitly out of scope for Phase 1

Do not implement or pretend to implement:

- A backend server or server-side business services.
- A database, persistent server storage, or external data store.
- Authentication, OAuth, registration, user accounts, or password handling.
- Actual uptime checks or external network probes.
- A Linux agent, SSH connection, shell access, command execution, or remote service restart.
- Real CPU/RAM/disk/network telemetry.
- Real email, SMS, push, Telegram, Slack, or other notifications.
- Payment processing or subscription management.
- AI model calls, AI chat, or automated diagnosis.
- Real incident creation from live infrastructure.
- Any capability that can modify or control the user's server.

Use in-memory mock repositories and local UI state. If browser storage is used to retain theme or demo preferences, keep it limited to harmless frontend preferences and do not represent it as a backend or database. A clean in-memory reset must always be available.

Show a persistent, subtle **Demo data** or **Simulated monitoring** indicator wherever needed to prevent confusion. The header must communicate that monitoring is simulated and display a mock “last updated” time.

---

# 3. Product Vision and Signature Experience

## Product vision

Give a solo server owner a calm, reliable view of infrastructure health and an operational memory of what happened and how they responded.

## Signature experience: Live Ops Timeline

The Live Ops Timeline is not a generic activity feed. It is the product's central narrative layer. It brings together:

- Server-health changes.
- Website availability changes.
- New incidents and severity changes.
- Recovery and resolution events.
- Manually recorded tasks.
- Task completion and outcomes.
- Maintenance notes and other operational events.

Every timeline item should have a clear type, timestamp, title, concise description, relevant entity, and a useful next action. Clicking an event should open the associated incident, website, task, or server details without losing the user's place in the timeline.

Example sequence using explicitly fictional demo content:

1. `shop.example.test` returns HTTP 502.
2. watchthis marks the demo website as down and creates a simulated incident.
3. The user opens the incident and reviews its details.
4. The user records a manual task: “Investigate web server logs,” with notes and an outcome.
5. The demo user triggers a simulated recovery check.
6. The website returns to healthy status and the incident becomes resolved.
7. The timeline shows the full sequence, including the task recorded between detection and recovery.

Do not imply that a real server command was run. The interface may display example command text entered by the user, but must never execute it.

## Signature interaction details

- The timeline should update in a restrained, understandable way when a simulated event occurs.
- New events may animate in with a subtle fade/slide and a small status accent; do not make the page jump.
- Preserve scroll position when new events arrive, unless the user is already at the top and the design intentionally keeps the newest item visible.
- When a new event appears while the user is reading older events, show a “New events” affordance instead of forcibly scrolling.
- Timeline filters must combine predictably: event type, status/severity, and search query.
- Use relative time labels with an accessible exact timestamp in the detail view.
- A task created from an incident should automatically inherit the incident relationship, unless the user removes it.
- Incident detail must show linked tasks and relevant timeline events in one context.
- The user should be able to move from the command center to a problem, record work, and return without losing context.

---

# 4. Users and Jobs to Be Done

## Primary user: solo server owner/operator

### Goals
- Know infrastructure health in seconds.
- Detect website downtime or degradation.
- Investigate issues without searching across unrelated screens.
- Record maintenance and troubleshooting actions while the context is fresh.
- Reconstruct what happened after an incident.
- Keep a simple operational history for a single VPS.

### Needs
- A clear overall health summary.
- Website inventory and service detail.
- Essential server metrics.
- Incident details and chronology.
- Quick manual task entry.
- Searchable, filterable history.
- Honest monitoring-state indicators.

### Pain points
- Manually opening websites to check if they are available.
- Discovering an outage later than desired.
- Losing troubleshooting notes.
- Forgetting which change preceded a problem.
- Having charts without an explanation of operational events.

### Success criteria
- The current state is understandable within 30 seconds.
- The most urgent issue is easy to identify.
- A task can be recorded quickly with minimal required fields.
- An incident's history and linked tasks are easy to inspect.
- The user can distinguish mock/demo state from real monitoring.

## Secondary actors and future integrations

The Linux host, websites, future monitoring agent, and future notification channels are integration concepts, not users who need interfaces in Phase 1. Do not add team-management or admin workflows.

---

# 5. Technology Stack

Use the following default stack unless a package incompatibility requires a documented, minimal substitution:

- **Framework:** Next.js 15 with App Router.
- **UI:** React 19 and TypeScript in strict mode.
- **Styling:** Tailwind CSS v4.
- **Components:** shadcn/ui, customized to the watchthis visual system.
- **Motion:** Framer Motion.
- **Icons:** Phosphor Icons (`@phosphor-icons/react`), consistently using one icon weight family where possible.
- **Client state:** Zustand for small, cross-screen UI/demo state where appropriate.
- **Async/mock data:** TanStack Query over mock API functions to establish realistic loading, error, and invalidation behavior.
- **Forms:** React Hook Form and Zod.
- **Charts:** Use a small, accessible chart library compatible with React 19, or implement simple SVG charts if that is more reliable. Keep charts responsive and avoid unnecessary visual noise.
- **Testing:** Use the project's compatible testing setup (prefer Vitest and React Testing Library; Playwright for key browser flows if practical).
- **Deployment readiness:** Vercel-compatible Next.js structure and configuration.
- **PWA readiness:** Provide sensible metadata and manifest readiness if achievable without adding unnecessary complexity. Do not claim offline monitoring; only the UI shell may be made PWA-ready.

Do not use Bootstrap, Material UI defaults, generic admin templates, emoji icons, or an unmodified dashboard starter. The visual identity must be deliberately designed.

Before installing packages, inspect the existing project. Preserve useful existing configuration and avoid unnecessary rewrites. If no project exists, scaffold the Next.js app with the stack above. Use current APIs compatible with the chosen package versions.

---

# 6. Visual Design Philosophy

## Desired feeling

Premium, calm, modern, precise, dependable, and slightly technical. The product should feel like a crafted developer tool inspired by the spacing and restraint of Apple, the clarity of Linear, the usability of Arc, and the human-centered polish of Airbnb—without copying any brand's interface.

The UI must feel production-ready rather than a generic SaaS admin template.

## Visual principles

- Strong typographic hierarchy and generous whitespace.
- Compact but breathable information density.
- A dark mode that feels intentionally designed, not simply inverted.
- Clear alignment and consistent spacing.
- Rounded cards and panels with restrained borders.
- Small, purposeful use of accent colors.
- Realistic data and credible labels; never use Lorem Ipsum.
- Avoid unnecessary gradients, glassmorphism, glowing borders, excessive shadows, or ornamental charts.
- Avoid filling every empty area with a card.
- Avoid giant hero sections that push operational content below the fold.
- Make urgent failures prominent but not visually chaotic.
- Use iconography consistently and pair important icons with labels.
- Use tabular numerals for metrics, timestamps, percentages, and durations where suitable.

## Suggested color system

Define design tokens through CSS variables and map them to Tailwind/shadcn tokens. Validate contrast in both themes.

Suggested semantic direction, not a mandate to use raw values everywhere:

- App background: very light cool neutral in light mode; deep blue-charcoal in dark mode.
- Surface: white/near-white in light mode; elevated charcoal surfaces in dark mode.
- Primary text: deep neutral ink in light mode; soft near-white in dark mode.
- Secondary text: medium neutral gray with sufficient contrast.
- Primary accent: restrained indigo/blue.
- Healthy: green.
- Degraded/warning: amber.
- Down/critical: red.
- Informational: blue.
- Unknown/offline/stale: neutral gray.

Never communicate status through color alone. Include labels and, where useful, icons.

## Typography

- Use a modern, highly legible sans-serif. Prefer a well-supported local/system stack or a licensed web font with sensible fallbacks.
- Use clear type scales for page title, section heading, card title, body, metadata, and dense metric values.
- Avoid overusing all-caps labels and tiny low-contrast text.
- Keep line lengths comfortable.
- Use tabular numerals for rapidly changing metrics so layout does not jitter.

## Radius, borders, and shadows

- Use consistent medium-to-large corner radii for cards and dialogs.
- Use thin borders to establish grouping before adding shadows.
- Use shadows sparingly, primarily for floating menus, command overlays, and modal layers.
- Keep cards visually related; don't give every card a different style.

## Imagery

This is a technical monitoring product. Do not decorate it with unrelated stock photos. Use polished data visualization, purposeful icons, and high-quality UI composition instead. If an avatar or profile image is unnecessary, omit it.

---

# 7. Design System and Reusable Components

Create reusable, typed components. Do not implement every screen as one large component.

## Foundations
- `AppShell`
- `DesktopSidebar`
- `MobileBottomNavigation`
- `TopBar`
- `PageHeader`
- `SectionHeader`
- `ThemeProvider` / theme toggle
- `DemoModeIndicator`
- `ConnectionState`
- `LastUpdatedLabel`
- `StatusBadge`
- `SeverityBadge`
- `MetricValue`
- `MetricDelta`
- `RelativeTime`
- `Tooltip`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `OfflineOrStaleBanner`
- `ConfirmDialog`
- `Toast` / notification feedback
- `SearchInput`
- `FilterBar`
- `SegmentedFilter`
- `PageContainer`
- `ResponsiveGrid`

## Server and website components
- `ServerHealthSummary`
- `ResourceMetricCard`
- `ResourceHistoryChart`
- `NetworkTrafficChart`
- `ServerOverviewPanel`
- `WebsiteStatusRow`
- `WebsiteStatusCard`
- `WebsiteInventoryTable`
- `ResponseTimeSparkline`
- `UptimeValue`
- `HttpStatusCode`
- `SslExpiryIndicator`
- `WebsiteDetailHeader`
- `WebsiteMetricsPanel`
- `HealthCheckHistory`

## Incident and timeline components
- `IncidentSummaryCard`
- `IncidentList`
- `IncidentDetailHeader`
- `IncidentEventTimeline`
- `IncidentSeverityIndicator`
- `IncidentDuration`
- `LinkedTasksList`
- `LiveOpsTimeline`
- `TimelineEvent`
- `TimelineEventIcon`
- `TimelineFilters`
- `NewEventsIndicator`
- `DemoEventControls`

## Task components
- `TaskRecorderForm`
- `TaskComposer`
- `TaskList`
- `TaskListItem`
- `TaskDetailPanel`
- `TaskStatusSelector`
- `TaskCategorySelector`
- `RelatedEntityPicker`
- `TaskOutcomeField`

## Component standards
- Components should receive typed props and avoid reaching into global state unless they genuinely need it.
- Separate reusable presentation components from page-level composition and data fetching.
- Use shadcn/ui primitives for accessible dialogs, menus, tooltips, selects, buttons, inputs, checkboxes, and toasts, then style them consistently.
- Include keyboard focus styles.
- Avoid nested clickable elements and ambiguous hit areas.
- Every button, menu item, tab, filter, and clickable row must perform a meaningful action.
- Use skeletons that resemble the final layout, not generic spinner-only loading screens.
- Prefer explicit empty-state actions such as “Record a task” or “Clear filters.”

---

# 8. Navigation and Application Shell

Build seven main sections:

1. **Command Center**
2. **Server Health**
3. **Websites**
4. **Live Ops Timeline**
5. **Tasks**
6. **Incidents**
7. **Settings**

Use intuitive routes. Suggested route structure:

- `/` — Command Center
- `/server` — Server Health
- `/websites` — Website inventory
- `/websites/[websiteId]` — Website detail
- `/timeline` — Live Ops Timeline
- `/tasks` — Task list and recorder
- `/tasks/[taskId]` — Task detail, if appropriate
- `/incidents` — Incident list
- `/incidents/[incidentId]` — Incident detail
- `/settings` — Preferences and demo controls

A modal or side panel is acceptable for detail experiences if it improves continuity, but route-backed detail views are preferable where deep linking and browser history matter. Choose one consistent approach.

## Desktop shell

- Left sidebar with watchthis mark/name and seven navigation items.
- Clear active navigation state.
- Compact top bar with page context, demo/monitoring indicator, last-updated label, theme toggle, and a primary quick action to record a task.
- Main content constrained to a comfortable max width with responsive gutters.
- Do not overfill the sidebar with nested navigation.
- On narrower desktop/tablet sizes, allow a compact/collapsible sidebar.

## Mobile shell

- Bottom navigation for the most frequently used sections. Prioritize Command Center, Websites, Timeline, Tasks, and Incidents; expose Server and Settings through a “More” surface or another clear, accessible navigation arrangement.
- A mobile-safe task creation action that does not obscure content.
- Stack cards and charts thoughtfully.
- Avoid desktop tables overflowing the viewport. Convert rows to cards or use carefully designed horizontal scrolling with clear affordances.
- Keep touch targets approximately 44×44 CSS pixels or larger.
- Respect safe areas on devices with bottom insets.
- Forms should be easy to complete with a mobile keyboard.

## Navigation behavior

- Active navigation updates with route changes.
- Browser back/forward should behave correctly.
- Opening an incident from the timeline should preserve useful timeline filter/scroll context when feasible.
- A “Back to timeline” or contextual breadcrumb should appear in detail views where it helps.
- No dead-end pages.

---

# 9. Screen Specifications

## Screen 1 — Command Center

### Job to be done
Answer “What needs my attention right now?” within 30 seconds.

### Layout hierarchy
1. Page header: “Command Center” with concise greeting or contextual subtitle, demo indicator, and quick-record-task action.
2. Overall health summary.
3. Priority incident banner if an unresolved incident exists.
4. Server resource overview.
5. Hosted websites status list/grid.
6. Live Ops Timeline preview.
7. Recent tasks or outstanding work, if it adds value.

### Health summary
Show:
- Overall status: Healthy, Degraded, Down, or Unknown.
- Count of healthy, degraded, and down websites.
- Server health indicator.
- Active incident count.
- Last simulated check/update time.

Define the overall status consistently. For example:
- `Down` if a critical server status or any website designated critical is down.
- `Degraded` if no critical outage exists but one or more services are degraded or a warning threshold is exceeded.
- `Healthy` if checks are current and all monitored entities are healthy.
- `Unknown` if data is unavailable or stale enough that a trustworthy status cannot be established.

Document the exact mock rule in code. Do not claim real uptime.

### Server resource overview
Display CPU, memory, disk, and network metrics with:
- Current value.
- Sensible units.
- A small trend chart or sparkline.
- Contextual state if above a demo threshold.
- Click-through to Server Health.

Use plausible mock values and coherent histories. Do not show random jumps every render.

### Website overview
Display a short list of monitored websites with:
- Site name and domain.
- Status badge.
- Response time.
- HTTP status code when relevant.
- Uptime percentage with “demo history” caveat.
- Tiny response-time trend.
- Click-through to website detail.

Include one simulated degraded/down website in the default guided-demo dataset so incident flows can be discovered, but do not make every sample site unhealthy. Ensure the user can reset the demo.

### Timeline preview
Show the most recent three to six events. Include a clear “View full timeline” action. The preview should make event types visually distinguishable without overpowering titles and timestamps.

### Empty/loading/error states
- Loading: skeletons shaped like summary cards, metric cards, and rows.
- Empty: “No monitored websites yet” with an explanatory message and a mock “Explore demo websites” action. Do not pretend to add real websites to a server.
- Error: explain that demo data could not be loaded and offer retry.
- Stale/offline: show a neutral warning banner and keep last-known mock data visually marked as stale.

### Interactions
- Click a website to open detail.
- Click an incident banner to open the incident.
- Click metric cards to open Server Health.
- Click a timeline event to open its linked entity.
- Click “Record task” to open the manual task form.
- Demo controls can simulate outage/recovery events.
- Theme toggle changes the entire application.

## Screen 2 — Server Health

### Job to be done
Understand resource usage and whether the server may be under pressure.

### Layout
- Page title and server identity.
- Server status, Linux OS label, mock hostname, and simulated last check.
- Four primary metric cards: CPU, memory, disk, and network.
- Historical charts with selectable periods (e.g. 1h, 6h, 24h), using deterministic fixture data.
- Resource warnings section when a demo threshold is crossed.
- Related timeline events.

### Metric definitions
- CPU: percentage of simulated utilization.
- Memory: used / total with percentage.
- Disk: used / total with percentage.
- Network: inbound/outbound rates with explicit units.
- Uptime: a formatted duration, not a percentage.
- Last checked: mock timestamp, not the browser's actual check against the VPS.

Use a consistent mock dataset with plausible relationships and time points. Keep units and chart axes labeled. Avoid misleading charts with hidden axes or unclear scales.

### Interactions
- Select a time period and update chart data.
- Hover/focus chart points to reveal exact values and timestamps.
- Select a warning to open the related incident or timeline event if available.
- Use a visible label such as “Simulated metrics” near chart content.

### States
Provide loading skeletons, empty metric history, and retryable error states.

## Screen 3 — Websites Inventory

### Job to be done
Find a website and quickly understand its current demo status.

### Header
- Title “Websites.”
- Count of monitored demo websites.
- Search input.
- Status filter: All, Up, Degraded, Down, Unknown.
- Optional sort by status, response time, name, or uptime.
- Do not include a “Connect server” action that suggests real integration exists.

### Website cards/rows
Each item includes:
- Website display name.
- Domain/URL.
- Status badge and icon.
- Response time in ms.
- Last simulated check.
- HTTP status code where meaningful.
- Uptime percentage for the mock historical window.
- SSL expiry date or “Not configured” state.
- Tiny response-time trend where useful.

Ensure status, response time, and HTTP code agree. For example, a down fixture may return HTTP 502 and show high or unavailable response time; a healthy fixture should use a plausible 2xx code.

### Website detail
Provide a route or detail panel with:
- Website identity and URL.
- Current simulated status.
- Response-time history.
- Uptime history over the demo period.
- Recent check/event history.
- SSL expiry information.
- Linked incidents.
- Linked tasks.
- Action to record a task associated with this website.

External links should be safe. Since example domains may be fictional, avoid automatically navigating the user to them. If external opening is supported, make it an explicit action and use safe link attributes. Prefer reserved example domains such as `example.test` in mock data.

### Interactions
- Search filters as the user types.
- Filters combine with search and sort.
- Clicking a website opens its detail.
- Clicking a related incident opens incident detail.
- “Record task” preselects the website in the task form.
- Empty search results include a “Clear filters” action.

## Screen 4 — Live Ops Timeline

### Job to be done
Understand the chronological story of infrastructure events and work performed.

### Layout
- Page header with clear explanation: “Health changes, incidents, and the work you record—in one place.”
- “Simulated monitoring” indicator.
- Search field.
- Filter chips/dropdowns for event type, severity/status, and related website.
- Chronological grouped timeline, newest first by default.
- A visible distinction between real-time demo additions and older history.
- Optional date-group labels such as Today and Yesterday based on fixed demo fixture dates or a consistent simulated clock.

### Event types
- `server_metric_warning`
- `website_down`
- `website_degraded`
- `website_recovered`
- `incident_opened`
- `incident_resolved`
- `task_created`
- `task_updated`
- `task_completed`
- `maintenance_note`

Avoid duplicate events when a single simulated transition updates both an incident and a website. If both events are intentionally represented, give them distinct meanings and clear sequencing.

### Timeline item
- Type icon.
- Title.
- Concise description.
- Timestamp and accessible exact time.
- Severity/status marker.
- Related entity chip(s).
- Contextual action such as “View incident,” “View website,” or “View task.”
- A restrained visual treatment for newly added events.

### Filters and search
- Search across title, description, website name/domain, incident title, and task title.
- Filter by event type.
- Filter by severity/status when meaningful.
- Optional website filter.
- Show active filters and provide “Clear all.”
- Show a thoughtful empty state when no events match.

### New-event behavior
- Simulated events arrive only according to the guided demo controller, not an uncontrolled interval that creates endless noise.
- A manual “Simulate outage” or “Simulate recovery” control may create deterministic events.
- A “Pause demo” control stops simulated updates.
- If the user is scrolled away from the top, show a new-event count and let the user choose to jump to new items.
- Do not show browser notifications or claim external alerts are sent.

### Event detail
Clicking an event opens its related detail. A task event opens task detail; an incident event opens incident detail; a website state event opens website detail. Generic events can open a side panel with full description and exact timestamp.

## Screen 5 — Tasks

### Job to be done
Record what the operator did and preserve useful context.

### Primary action
“Record task” must be prominent and easy to access from all relevant screens.

### Task list
Each task should display:
- Title.
- Category.
- Status.
- Priority.
- Created/updated timestamp.
- Related website and/or incident when present.
- Short description or outcome.
- Quick action to open details.

Support search and filters by status, category, priority, and related website where practical.

### Task categories
- Maintenance
- Troubleshooting
- Deployment
- Backup
- Security
- Monitoring
- Other

### Task status
- Planned
- In progress
- Completed
- Cancelled

### Task priority
- Low
- Normal
- High
- Urgent

### Manual task recorder
Use a shadcn dialog or mobile-friendly sheet. Keep it focused and quick.

Fields:
- **Title** (required; 3–120 characters).
- **Description / notes** (optional; sensible maximum such as 5,000 characters).
- **Category** (required; default to Maintenance or Other).
- **Priority** (required; default Normal).
- **Status** (default Planned or In progress based on an intentional choice).
- **Related website** (optional).
- **Related incident** (optional).
- **Outcome** (optional; can be added or edited later).
- Creation/update timestamps generated by the mock repository.

Validation:
- Use React Hook Form and Zod.
- Show inline field-level messages.
- Preserve user input when validation fails.
- Prevent duplicate submissions while a mock request is pending.
- Disable submission only when appropriate; do not create inert buttons.
- Show a success toast after the mock API reports success.
- Close the form only after a successful save.
- Reset fields when opening a new task, but not while an error needs correction.

When opened from an incident:
- Preselect the incident.
- Preselect its affected website if available.
- Show the related incident in the form so the context is obvious.

When opened from a website:
- Preselect that website.

### Task detail
Show all fields, status, related entities, timestamps, description, and outcome. Allow editing, status changes, and completion. Every mutation must update the task list and related timeline view consistently.

Do not execute shell commands. If notes contain command text, treat it as plain text only. Clearly label the form as a manual record of work.

### Empty states
- No tasks: explain the value of recording maintenance and offer “Record your first task.”
- No filter results: offer “Clear filters.”
- Loading/error states should be functional and retryable.

## Screen 6 — Incidents

### Job to be done
Review current and historical incidents and understand their resolution.

### Incident list
- Open/resolved filters.
- Severity filter.
- Search by title or website.
- Sort newest first or by severity.
- Show title, affected service, severity, status, detected time, duration, and whether tasks are linked.
- Open incidents should be clearly visible without making the screen alarmist.

### Incident model and UI states
Severity:
- Critical
- High
- Medium
- Low

Status:
- Open
- Investigating
- Monitoring
- Resolved

An incident can have a lifecycle from Open to Investigating to Monitoring to Resolved. Keep demo transitions deterministic and avoid impossible state combinations.

### Incident detail
Include:
- Incident title and severity.
- Affected server/website.
- Current state.
- Started/detected/resolved timestamps.
- Duration (elapsed for open incidents; fixed duration for resolved demo incidents).
- Concise summary.
- Chronological incident events.
- Related tasks.
- Related website and server metric context where applicable.
- Resolution notes.
- Action to record a task linked to this incident.

The demo may allow a simulated incident to be resolved through a clear “Simulate recovery” action. Label this as a demo action and never imply it runs a real health check.

### Incident integrity
- Incident start and detection times must be internally consistent.
- Resolved incidents must have a resolved timestamp and duration.
- Open incidents must not have a resolved timestamp.
- If a website is recovered, the associated demo incident can transition to Resolved through the demo scenario.
- Avoid allowing a user to accidentally create false real-world operational claims. Everything in this phase is a mock record.

## Screen 7 — Settings

### Job to be done
Adjust the local experience and control the guided demo.

### Sections
1. **Appearance**
   - Light, dark, and system theme if supported.
   - Theme change applies globally and immediately.
2. **Demo behavior**
   - Guided demo on/off.
   - Pause/resume simulated updates.
   - Simulate outage.
   - Simulate recovery.
   - Reset demo data.
   - Optional mock update cadence selector.
3. **Dashboard preferences**
   - Optional choice of default landing page or compact/comfortable density if it can be implemented cleanly.
4. **About**
   - Product name and version.
   - Clear Phase 1/demo disclaimer.

### Settings safeguards
- Confirm before resetting demo data.
- Reset returns to the known initial dataset and clears transient UI state.
- Never display real credentials, secrets, SSH details, or destructive server controls.
- No save button is needed for immediate local preferences; if used, it must have a real stateful effect.

---

# 10. Data Model and TypeScript Contracts

Define central TypeScript types in a dedicated domain/models area. Prefer explicit union types over unbounded strings.

Suggested types:

```ts
type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
type IncidentSeverity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "open" | "investigating" | "monitoring" | "resolved";
type TaskStatus = "planned" | "in_progress" | "completed" | "cancelled";
type TaskPriority = "low" | "normal" | "high" | "urgent";
type TaskCategory =
  | "maintenance"
  | "troubleshooting"
  | "deployment"
  | "backup"
  | "security"
  | "monitoring"
  | "other";

type TimelineEventType =
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
```

Create interfaces with appropriate nullability:

```ts
interface Server {
  id: string;
  name: string;
  hostname: string;
  operatingSystem: string;
  status: ServiceStatus;
  cpuUsage: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  networkInBytesPerSecond: number;
  networkOutBytesPerSecond: number;
  uptimeSeconds: number;
  lastCheckedAt: string;
}

interface Website {
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
}

interface Incident {
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
}

interface Task {
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

interface MetricSnapshot {
  id: string;
  serverId: string;
  cpuUsage: number;
  memoryUsagePercentage: number;
  diskUsagePercentage: number;
  networkInBytesPerSecond: number;
  networkOutBytesPerSecond: number;
  recordedAt: string;
}

interface TimelineEvent {
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
}
```

Adapt these contracts if needed for cleaner implementation, but preserve their intent and relationships. Store timestamps in ISO 8601 strings. Avoid storing redundant derived values unless a fixture explicitly needs a snapshot. Calculate display durations and derived overall status through typed utilities.

## Model invariants

- Website `serverId` must refer to the mock server.
- A linked task's website and incident should be compatible when both are set.
- Task timestamps must be coherent; `completedAt` is non-null only when completed.
- Incident lifecycle timestamps must be coherent.
- Timeline event links must reference existing entities.
- Percentages must remain within 0–100.
- Durations and byte counts cannot be negative.
- Response time may be null when a check failed.
- `lastCheckedAt: null` means no known check; it must not be rendered as “Up.”
- A stale or unknown status must never be styled as healthy.
- Derived overall health must follow one centralized rule, not separate page-specific guesses.

---

# 11. Mock APIs and Demo Data

## Architecture

Create mock API functions that mimic asynchronous network calls and return typed data. Use a small, consistent artificial delay (e.g. 200–600 ms) so loading states can be seen during development without making the app feel sluggish.

Organize API functions around domains:

- `getServer()`
- `getMetricSnapshots(range)`
- `getWebsites(filters)`
- `getWebsiteById(id)`
- `getIncidents(filters)`
- `getIncidentById(id)`
- `createTask(input)`
- `updateTask(id, input)`
- `getTasks(filters)`
- `getTaskById(id)`
- `getTimelineEvents(filters)`
- `simulateOutage(websiteId)`
- `simulateRecovery(websiteId or incidentId)`
- `resetDemoData()`

Use a typed mock repository as the source of truth during a session. Avoid hard-coding a separate contradictory copy of the same entity in every screen. Use TanStack Query for fetching, caching, pending/error states, and invalidation where helpful.

No API function may contact a real external endpoint or the user's VPS. Keep the future boundary obvious so real integrations can replace the mock functions later.

## Demo data

Create:
- One Linux VPS with a plausible mock hostname and operating-system label.
- Four to six fictional hosted websites using reserved `.test` domains.
- Several days of coherent metric samples.
- A mix of healthy sites and one initially degraded/down scenario.
- A few historical resolved incidents.
- A small set of maintenance and troubleshooting tasks.
- A timeline that connects the above records coherently.
- A couple of SSL expiry states, including healthy and expiring soon.
- One server warning example that can be explored without making all metrics critical.

Avoid using real customer domains, real credentials, or real infrastructure details. Avoid Lorem Ipsum and meaningless placeholder records. Give each fictional website a distinct, believable name and purpose.

Example demo entities may include:
- `site-aurora`: `aurora.example.test`
- `site-studio`: `studio.example.test`
- `site-store`: `shop.example.test`
- `site-docs`: `docs.example.test`

Names and values are illustrative. Make all references internally consistent.

## Coherent telemetry

Do not generate unrelated random values on every render. Seed deterministic fixture histories and update them only when a demo event is triggered or the guided simulation explicitly advances.

Ensure:
- Chart labels align with sample timestamps.
- A down site has a compatible failed HTTP status/response state.
- A recovery changes the website, incident, and timeline coherently.
- The dashboard summary recalculates from the same source of truth.
- Uptime percentages correspond plausibly to the illustrative history, or are clearly identified as a demo-window metric.
- Time ranges return the correct subset of samples.
- Reset restores the same known initial fixture state.

## Simulated live updates

Build a guided demo controller with explicit `start`, `pause`, `resume`, `simulate outage`, `simulate recovery`, and `reset` behavior as appropriate.

Use a deterministic state machine or scripted sequence. Avoid timers that multiply on route changes or hot reload. Clean up any interval or subscription in React effects. Prefer a single provider/store-owned scheduler rather than page-level timers.

A suggested demo scenario:
1. Begin with most websites healthy and one known incident scenario available.
2. Trigger or advance a website failure.
3. Update website status and last-check data.
4. Create one incident and corresponding timeline event(s).
5. Let the user record a manual task.
6. Trigger simulated recovery.
7. Resolve the incident, add a recovery event, and refresh summary metrics.
8. Allow reset to restore the baseline.

The user must be able to explore without waiting for a timer. Include obvious demo controls in Settings and a contextual control on relevant incident/timeline screens. If the guided demo automatically advances, it must be pausable and must not create endless incidents.

## Mock errors

Create a development-only way to test loading and error states if useful. Do not make errors random or frequent in the normal user experience. Provide an obvious retry action.

---

# 12. State Management

Use a clear separation of concerns:

- **Server state / async mock API:** TanStack Query.
- **Cross-screen UI/demo state:** Zustand only where state needs to be shared, such as demo controller status, active demo scenario, and perhaps persistent theme preferences.
- **Form state:** React Hook Form and Zod.
- **Local component state:** filters, open dialogs, temporary search text, and expanded sections where global state is unnecessary.
- **URL state:** use query parameters for meaningful list filters where appropriate and feasible.

Do not put all server records into one giant global store if query-based domain modules can manage them more cleanly.

When a task is created or edited:
- Update/invalidate task queries.
- Add the corresponding timeline event through the mock repository.
- Ensure linked incident/website detail reflects the new relationship.
- Show success/error feedback.

When an outage/recovery simulation occurs:
- Update the website status.
- Create/update the incident lifecycle.
- Add timeline events.
- Recalculate overall health.
- Invalidate or update affected query caches consistently.

Avoid stale duplicated state and effects that fight each other. Make demo reset restore all related domains, query caches, and transient state coherently.

---

# 13. Interaction and Motion System

Use Framer Motion for restrained, purposeful motion. Motion should communicate state changes and hierarchy, not become a distraction.

## Motion principles
- Prefer short, smooth transitions.
- Use spring motion for floating surfaces and shared elements where it feels natural.
- Respect `prefers-reduced-motion`.
- Avoid large bounces, endless pulsing, excessive parallax, or decorative animation.
- Never rely on motion alone to convey a status change.

## Motion specifications
- Page transitions: subtle opacity and small vertical movement; avoid delaying navigation.
- Cards: small fade/slide on first entry, stagger only for short lists.
- Timeline: new event enters with a short fade and slight vertical translation.
- Status transitions: animate badge/background subtly when a state changes.
- Dialog/sheet: smooth opacity plus scale/vertical motion; preserve accessibility focus behavior.
- Buttons: subtle hover/pressed feedback and visible focus.
- Metric updates: use stable layout and restrained number transitions only when readable.
- Toasts: quick entrance and exit, with appropriate timeout and dismissal.
- Sidebar/mobile navigation: active indicator transitions smoothly.
- Charts: animate initial drawing modestly; disable or simplify animation for reduced-motion users.

## Performance constraints
- Do not animate large areas continuously.
- Avoid layout-shifting count-up animations for every metric tick.
- Pause demo motion when the demo is paused.
- Avoid animations that obscure critical alerts or delay access to controls.

---

# 14. Responsive Strategy

Build mobile-first, then enhance for larger viewports.

## Mobile
- Single-column content with clear hierarchy.
- Compact metric cards in a two-column grid only when legible.
- Bottom navigation and a thumb-friendly task action.
- Timeline items with readable titles and timestamps.
- Forms in a full-height sheet or well-spaced dialog.
- No clipped dialogs or hidden primary actions behind the keyboard.
- Avoid tiny charts; simplify or horizontally scroll only when necessary.

## Tablet
- Two-column layout for metrics and detail panels where appropriate.
- Collapsible sidebar or compact navigation.
- Charts and tables must remain readable.
- Maintain enough whitespace for a premium feel.

## Desktop
- Sidebar plus main content.
- Multi-column metric layout.
- Larger charts and contextual side panels where helpful.
- Website inventory can use a table if it remains easy to scan.
- Avoid excessive full-width empty space; constrain content thoughtfully.

## Breakpoint quality checks
Test at approximately 360 px, 390 px, 768 px, 1024 px, 1280 px, and 1440 px widths. No horizontal overflow, clipped dialogs, overlapping navigation, or inaccessible controls.

---

# 15. Accessibility

Target WCAG 2.2 AA practices where applicable.

- Semantic landmarks: header, nav, main, sections, lists, and forms.
- Logical heading hierarchy.
- Keyboard access for all interactions.
- Visible focus states in both themes.
- Proper labels and descriptions for inputs.
- Accessible validation messages linked to their fields.
- Dialog focus management, escape behavior, and return focus.
- Color contrast for text, muted labels, status badges, and chart labels.
- Status always communicated through text/icon as well as color.
- Screen-reader announcements for task save, task completion, demo incident creation, and recovery where appropriate.
- Do not announce every simulated metric tick.
- Chart summaries or accessible tabular equivalents for important information.
- Reduced-motion support.
- Touch targets appropriate for mobile.
- Do not use placeholder text as the only input label.
- Avoid rapidly flashing or pulsing critical status indicators.

---

# 16. Loading, Empty, Error, Stale, and Offline States

Treat state handling as a product requirement on every data-driven screen.

## Loading
- Use layout-matched skeletons.
- Preserve page structure to reduce layout shift.
- Use button-level pending states for mutations.
- Avoid full-screen blocking spinners for small updates.

## Empty
- Explain why the section is empty.
- Provide one useful next action.
- Differentiate “no records exist” from “no records match your filters.”
- Do not populate every empty state with arbitrary sample content after the user clears the demo.

## Error
- State what failed in plain language.
- Provide retry where possible.
- Preserve user-entered form data.
- Do not display raw stack traces to the user.

## Stale/offline
- Mark stale data visibly and neutrally.
- Show the timestamp of the last known mock update.
- Do not imply that stale data proves a service is healthy.
- Clearly distinguish browser/network unavailability from a website being down in the simulated model.

## Demo status
Use wording such as:
- “Demo data”
- “Simulated monitoring”
- “Last simulated check”
- “Simulate outage”
- “Simulate recovery”

Avoid wording such as “Your server is live” unless real telemetry exists—which it does not in Phase 1.

---

# 17. Performance and Engineering Quality

- Keep components small and domain-oriented.
- Avoid unnecessary client components when server components suffice, but recognize that interactive dashboard areas require client behavior.
- Use dynamic imports only when they materially reduce initial bundle cost.
- Avoid importing large charting or icon packages wholesale if tree-shaking is poor.
- Use stable keys and memoization only when it has measurable benefit.
- Keep charts responsive and avoid excessive data points.
- Avoid rerendering every page on each mock metric update.
- Clean up event listeners, intervals, and subscriptions.
- Avoid duplicate schedulers and stale closures.
- Use strict TypeScript; avoid `any` and broad type assertions.
- Keep domain utilities pure and testable.
- Centralize formatting for bytes, durations, percentages, timestamps, and response times.
- Handle invalid IDs and missing mock entities with graceful not-found states.
- Use error boundaries where appropriate.
- Keep secrets out of source code; no secrets should be needed in this phase.
- Do not install packages without a clear need.
- Keep console warnings/errors out of normal flows.

## Suggested formatting utilities
- `formatBytes(value)`
- `formatDuration(seconds)`
- `formatPercent(value)`
- `formatResponseTime(ms)`
- `formatTimestamp(isoString)`
- `formatRelativeTime(isoString)`
- `getOverallHealth(server, websites)`
- `getIncidentDuration(incident, now)`
- `getStatusLabel(status)`

Centralize the overall-health logic so it cannot disagree across screens.

---

# 18. Suggested Folder Structure

Adapt to the existing project if one exists, but preserve domain separation.

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    server/
      page.tsx
    websites/
      page.tsx
      [websiteId]/
        page.tsx
    timeline/
      page.tsx
    tasks/
      page.tsx
      [taskId]/
        page.tsx
    incidents/
      page.tsx
      [incidentId]/
        page.tsx
    settings/
      page.tsx
    not-found.tsx
  components/
    ui/
    shell/
      app-shell.tsx
      desktop-sidebar.tsx
      mobile-bottom-navigation.tsx
      top-bar.tsx
    shared/
      status-badge.tsx
      severity-badge.tsx
      page-header.tsx
      empty-state.tsx
      error-state.tsx
      loading-skeleton.tsx
      demo-mode-indicator.tsx
    dashboard/
      overall-health-card.tsx
      server-health-summary.tsx
      resource-metric-card.tsx
      website-overview.tsx
      timeline-preview.tsx
    server/
      resource-history-chart.tsx
      network-traffic-chart.tsx
    websites/
      website-status-card.tsx
      website-inventory.tsx
      website-detail.tsx
    timeline/
      live-ops-timeline.tsx
      timeline-event.tsx
      timeline-filters.tsx
      demo-event-controls.tsx
    tasks/
      task-recorder-form.tsx
      task-list.tsx
      task-detail.tsx
    incidents/
      incident-list.tsx
      incident-detail.tsx
    settings/
      appearance-settings.tsx
      demo-settings.tsx
  features/
    server/
    websites/
    incidents/
    tasks/
    timeline/
    demo/
  lib/
    utils.ts
    formatters.ts
    status.ts
    dates.ts
    validation.ts
  mocks/
    data/
      server.ts
      websites.ts
      incidents.ts
      tasks.ts
      metrics.ts
      timeline.ts
    api/
      server-api.ts
      website-api.ts
      incident-api.ts
      task-api.ts
      timeline-api.ts
    repository/
      mock-repository.ts
      demo-controller.ts
  hooks/
  providers/
    query-provider.tsx
    theme-provider.tsx
  stores/
    demo-store.ts
    ui-store.ts
  types/
    domain.ts
  tests/
    status.test.ts
    task-validation.test.ts
    demo-controller.test.ts
    timeline.test.ts
```

Do not create empty abstractions simply to match the tree. Use a pragmatic subset, but retain clear separation between screens, reusable components, domain models, mock API functions, and demo orchestration.

---

# 19. Coding Standards

- TypeScript strict mode.
- Avoid `any`; use `unknown` and narrow it when necessary.
- Use explicit return types for important domain functions and mock APIs.
- Use named exports for most components and utilities unless Next.js conventions require default exports.
- Use consistent naming: PascalCase components, camelCase functions/variables, kebab-case filenames.
- Keep data fixtures separate from UI components.
- Keep business-like derivations in pure utilities rather than embedding the same logic in multiple components.
- Use Zod schemas for form validation and inferred form types where appropriate.
- Avoid deeply nested conditional JSX; extract subcomponents when clarity improves.
- Do not silence lint errors without explaining why.
- Use meaningful, realistic copy.
- Never use Lorem Ipsum.
- Avoid emoji as icons.
- Keep comments focused on non-obvious behavior and important architectural boundaries.
- Do not add TODO placeholders for core functionality.
- All visible actions must work.
- Avoid fake links (`href="#"`) and buttons without behavior.
- Avoid fake progress indicators that imply a real operation.
- Avoid claiming external notifications were delivered.
- Use stable deterministic IDs in fixtures and unique IDs for new in-session records.
- Make reset and state transitions testable.

---

# 20. Test Plan and Acceptance Criteria

The implementation is not complete merely because it renders. Verify the key product flows and quality constraints.

## Command Center
- [ ] Shows server health, website status counts, active incidents, and recent timeline events.
- [ ] Overall health is derived from the centralized status rule.
- [ ] A degraded/down fixture is discoverable without every card looking broken.
- [ ] Website, incident, server, task, and timeline actions navigate to the correct context.
- [ ] Demo-data labeling is visible.
- [ ] Loading, error, stale, and empty states work.

## Server Health
- [ ] CPU, memory, disk, network, and uptime display correct units.
- [ ] Time-range controls update chart data.
- [ ] Chart tooltips provide values and timestamps.
- [ ] Simulated metric data is coherent and labeled.
- [ ] Warning interactions lead to relevant events/details.

## Websites
- [ ] Search, status filters, and sorting work together.
- [ ] Each website opens a detail experience.
- [ ] HTTP status and response time match fixture status.
- [ ] SSL expiry states are visually clear and accessible.
- [ ] Related incidents and tasks link correctly.
- [ ] No layout overflow on mobile.

## Live Ops Timeline
- [ ] Shows incidents, website changes, recovery events, and tasks in chronological order.
- [ ] Search and filters work and can be cleared.
- [ ] Event links open the correct related record.
- [ ] New events do not forcibly steal scroll position.
- [ ] Pause/resume and manual demo triggers work.
- [ ] Reset returns the timeline to baseline.
- [ ] Duplicate or contradictory events are avoided.

## Tasks
- [ ] Task form validates title and required fields.
- [ ] Validation errors are accessible and input is preserved.
- [ ] A successful task save updates the list and timeline.
- [ ] Task editing and status transitions work.
- [ ] Website/incident relationships are retained and displayed.
- [ ] Completing a task sets `completedAt`.
- [ ] Task notes never execute as commands.
- [ ] Loading/error feedback works.

## Incidents
- [ ] Open and resolved incidents display correctly.
- [ ] Severity and status filters work.
- [ ] Incident timestamps and durations are coherent.
- [ ] Related tasks appear on incident detail.
- [ ] Simulated recovery updates website status, incident status, and timeline coherently.
- [ ] Recovery is explicitly labeled as simulated.

## Settings and demo controller
- [ ] Theme change updates every screen.
- [ ] Guided demo can be paused/resumed.
- [ ] Simulate outage creates consistent mock state.
- [ ] Simulate recovery resolves the intended scenario.
- [ ] Reset requires confirmation and restores the baseline.
- [ ] No control performs a real server action.

## Visual and responsive quality
- [ ] Looks polished at 360, 390, 768, 1024, 1280, and 1440 px.
- [ ] No horizontal overflow, clipped dialogs, or obscured mobile actions.
- [ ] Light and dark themes both have strong contrast and hierarchy.
- [ ] Loading skeletons resemble final content.
- [ ] Motion is restrained and reduced-motion preferences are respected.
- [ ] No emoji icons, Lorem Ipsum, generic admin-template styling, or unrelated stock imagery.
- [ ] Typography, spacing, radii, borders, and status colors are consistent.

## Engineering quality
- [ ] TypeScript checks pass.
- [ ] Linting passes.
- [ ] Relevant unit tests pass.
- [ ] Core task and incident flows can be manually tested from a fresh launch.
- [ ] No uncaught runtime errors or console warnings in normal use.
- [ ] Mock data relationships remain consistent after mutations and reset.
- [ ] All navigation and controls work.
- [ ] No backend, database, auth, payments, real monitoring, or shell execution has been added.

---

# 21. Implementation Sequence

Follow this sequence to keep architecture and product behavior coherent. Do not stop after generating a static dashboard mockup.

## Phase A — Inspect and scaffold
1. Inspect the current repository, package manager, and existing conventions.
2. Preserve useful existing setup.
3. Create or adapt the Next.js App Router project.
4. Configure TypeScript strictness, Tailwind CSS v4, shadcn/ui, theme tokens, icon package, motion, forms, query provider, and test tooling as needed.
5. Verify the application starts before building the full feature set.

## Phase B — Domain and fixtures
1. Define domain types and Zod schemas.
2. Create coherent fixture data for server, websites, metrics, incidents, tasks, and timeline events.
3. Implement pure status/formatting utilities.
4. Implement the in-memory mock repository and asynchronous API functions.
5. Add a deterministic demo controller and reset behavior.
6. Test data invariants and lifecycle transitions.

## Phase C — App shell and foundations
1. Implement theme support.
2. Implement desktop sidebar, top bar, mobile navigation, and responsive page container.
3. Build shared badges, loading/empty/error states, toast feedback, dialogs, and filters.
4. Verify keyboard behavior and mobile layout early.

## Phase D — Main experiences
1. Build Command Center.
2. Build Server Health and charts.
3. Build Website inventory and details.
4. Build Live Ops Timeline and filtering.
5. Build manual task recording, list, edit, and detail.
6. Build incident list and detail.
7. Build Settings and guided demo controls.
8. Wire all pages to the same mock repository/query layer.

## Phase E — Integration polish
1. Ensure task mutations update timeline and related entities.
2. Ensure outage/recovery simulation updates website, incident, timeline, and dashboard consistently.
3. Ensure reset restores all domains and clears transient state.
4. Add route not-found states and error handling.
5. Check browser back/forward and preserve context where appropriate.

## Phase F — Quality pass
1. Run TypeScript checks, lint, tests, and production build.
2. Test each acceptance criterion.
3. Test both themes and all target viewport sizes.
4. Review accessibility, contrast, focus states, reduced motion, and chart labeling.
5. Remove dead code, fake controls, inconsistent fixtures, and visual clutter.
6. Fix issues rather than merely documenting them.

---

# 22. Definition of Done

The work is complete when watchthis is a coherent, premium-quality frontend that a user can explore as a product:

- It has all seven agreed sections.
- Its data model and mock APIs are connected, typed, and consistent.
- Its signature Live Ops Timeline tells a believable operational story.
- A user can record a task manually, link it to a website/incident, edit it, and see it in the timeline.
- A guided outage and recovery sequence updates the website, incident, summary, and timeline together.
- The user can pause and reset the demo.
- The app is responsive and polished in light and dark modes.
- Every visible control has a real effect.
- Empty, loading, error, stale, and offline states are designed and functional.
- The UI clearly identifies all simulated monitoring and demo data.
- There is no backend, database, authentication, payment processing, real server connection, real uptime checking, or shell execution.
- Type checks, lint, relevant tests, and production build pass.

## Final instruction to Claude Code

Act as the lead frontend engineer working from an approved product brief. Build the complete Phase 1 application, not a summary, static concept, or partial mockup. Make sensible implementation decisions within this brief, keep the user informed about significant tradeoffs, and do not ask questions already answered here.

Prioritize product coherence, credible interactions, accessibility, responsive behavior, clean architecture, and visual polish. If a feature is outside Phase 1, represent its future role honestly rather than faking a real integration.

**Deliver a working watchthis frontend whose central promise is clear: know what is happening, understand what happened, and remember what you did about it.**
