import test from "node:test";
import assert from "node:assert";
import { getOverallHealth } from "../lib/status";
import { Server, Website } from "../types/domain";

test("getOverallHealth returns unknown when server is null", () => {
  const result = getOverallHealth(null, []);
  assert.strictEqual(result.status, "unknown");
});

test("getOverallHealth returns down when a critical site is down", () => {
  const mockServer: Server = {
    id: "srv-1",
    name: "VPS 1",
    hostname: "vps.test",
    operatingSystem: "Ubuntu 24.04",
    ipAddress: "198.51.100.1",
    status: "healthy",
    cpuUsage: 25,
    memoryUsedBytes: 2000,
    memoryTotalBytes: 8000,
    diskUsedBytes: 2000,
    diskTotalBytes: 8000,
    networkInBytesPerSecond: 100,
    networkOutBytesPerSecond: 200,
    uptimeSeconds: 10000,
    lastCheckedAt: new Date().toISOString(),
  };

  const mockWebsites: Website[] = [
    {
      id: "w1",
      serverId: "srv-1",
      name: "Shop",
      url: "https://shop.example.test",
      status: "down",
      responseTimeMs: null,
      httpStatusCode: 502,
      uptimePercentage: 98,
      sslExpiryAt: null,
      lastCheckedAt: new Date().toISOString(),
      isCritical: true,
      historySparkline: [0],
      errorType: "server_error",
      errorDetail: "HTTP 502 received",
    },
    {
      id: "w2",
      serverId: "srv-1",
      name: "Docs",
      url: "https://docs.example.test",
      status: "healthy",
      responseTimeMs: 80,
      httpStatusCode: 200,
      uptimePercentage: 100,
      sslExpiryAt: null,
      lastCheckedAt: new Date().toISOString(),
      isCritical: false,
      historySparkline: [80],
      errorType: null,
      errorDetail: null,
    },
  ];

  const result = getOverallHealth(mockServer, mockWebsites);
  assert.strictEqual(result.status, "down");
  assert.strictEqual(result.downWebsitesCount, 1);
  assert.strictEqual(result.healthyWebsitesCount, 1);
});

test("getOverallHealth returns healthy when all services are healthy", () => {
  const mockServer: Server = {
    id: "srv-1",
    name: "VPS 1",
    hostname: "vps.test",
    operatingSystem: "Ubuntu 24.04",
    ipAddress: "198.51.100.1",
    status: "healthy",
    cpuUsage: 35,
    memoryUsedBytes: 2000,
    memoryTotalBytes: 8000,
    diskUsedBytes: 2000,
    diskTotalBytes: 8000,
    networkInBytesPerSecond: 100,
    networkOutBytesPerSecond: 200,
    uptimeSeconds: 10000,
    lastCheckedAt: new Date().toISOString(),
  };

  const mockWebsites: Website[] = [
    {
      id: "w1",
      serverId: "srv-1",
      name: "Shop",
      url: "https://shop.example.test",
      status: "healthy",
      responseTimeMs: 120,
      httpStatusCode: 200,
      uptimePercentage: 99.9,
      sslExpiryAt: null,
      lastCheckedAt: new Date().toISOString(),
      isCritical: true,
      historySparkline: [120],
      errorType: null,
      errorDetail: null,
    },
  ];

  const result = getOverallHealth(mockServer, mockWebsites);
  assert.strictEqual(result.status, "healthy");
});
