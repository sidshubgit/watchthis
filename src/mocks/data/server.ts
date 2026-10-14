import { Server } from "@/types/domain";

export const initialServer: Server = {
  id: "srv-neevcloud-01",
  name: "serverforcloud",
  hostname: "serverforcloud.neevcloud",
  operatingSystem: "Ubuntu 24.04 LTS (Noble Numbat)",
  ipAddress: "156.238.99.48",
  status: "degraded", // Degraded due to HTTP 500 on web server / PHP-FPM pools
  cpuUsage: 38.4,
  memoryUsedBytes: 6871947673, // ~6.4 GB
  memoryTotalBytes: 17179869184, // 16.0 GB (from NeevCloud screenshot)
  diskUsedBytes: 24696061952, // ~23 GB
  diskTotalBytes: 42949672960, // 40 GB Volume (from NeevCloud screenshot)
  networkInBytesPerSecond: 2845120, // ~2.7 MB/s
  networkOutBytesPerSecond: 5210432, // ~5.0 MB/s
  uptimeSeconds: 1209600, // ~14 days (from NeevCloud screenshot unpause activity)
  lastCheckedAt: new Date().toISOString(),
};
