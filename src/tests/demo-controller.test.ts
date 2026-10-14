import test from "node:test";
import assert from "node:assert";
import { mockRepository } from "../mocks/repository/mock-repository";

test("simulateOutage marks target website down and opens incident", async () => {
  mockRepository.resetDemoData();
  await mockRepository.simulateOutage("site-ajaypradeep");

  const site = await mockRepository.getWebsiteById("site-ajaypradeep");
  assert.strictEqual(site?.status, "down");
  assert.strictEqual(site?.httpStatusCode, 503);

  const incidents = await mockRepository.getIncidents({ status: "open" });
  const ajayIncident = incidents.find((i) => i.websiteId === "site-ajaypradeep");
  assert.ok(ajayIncident, "Open incident for ajaypradeep should exist");

  const timeline = await mockRepository.getTimelineEvents();
  const hasDownEvent = timeline.some((e) => e.type === "website_down" && e.websiteId === "site-ajaypradeep");
  assert.ok(hasDownEvent, "Timeline should contain website_down event");
});

test("simulateRecovery restores down website and resolves incident", async () => {
  await mockRepository.simulateRecovery("site-ajaypradeep");

  const site = await mockRepository.getWebsiteById("site-ajaypradeep");
  assert.strictEqual(site?.status, "healthy");
  assert.strictEqual(site?.httpStatusCode, 200);

  const incidents = await mockRepository.getIncidents({ status: "all" });
  const ajayIncident = incidents.find((i) => i.websiteId === "site-ajaypradeep");
  assert.strictEqual(ajayIncident?.status, "resolved");

  const timeline = await mockRepository.getTimelineEvents();
  const hasRecoveredEvent = timeline.some((e) => e.type === "website_recovered" && e.websiteId === "site-ajaypradeep");
  assert.ok(hasRecoveredEvent, "Timeline should contain website_recovered event");
});

test("resetDemoData restores clean initial fixtures", async () => {
  mockRepository.resetDemoData();
  const websites = await mockRepository.getWebsites();
  assert.strictEqual(websites.length, 14);
  // Initially site-amsolit is down in initial fixtures
  const amsolit = websites.find((w) => w.id === "site-amsolit");
  assert.strictEqual(amsolit?.status, "down");
});
