import { MetricSnapshot } from "@/types/domain";

export function generateMetricSnapshots(): MetricSnapshot[] {
  const snapshots: MetricSnapshot[] = [];
  const now = Date.now();
  // 60 data points over the last 24 hours (1 every 24 minutes)
  const count = 60;
  const intervalMs = (24 * 60 * 60 * 1000) / count;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toISOString();
    // Simulate diurnal pattern + slight spike 2 hours ago
    const hour = new Date(now - i * intervalMs).getHours();
    const isSpikePeriod = i >= 4 && i <= 8; // recent anomaly period

    const baseCpu = 25 + Math.sin(hour / 3.8) * 12;
    const cpu = isSpikePeriod 
      ? Math.min(88, baseCpu + 48 + (Math.sin(i) * 5))
      : Math.max(12, baseCpu + (Math.cos(i) * 4));

    const baseMem = 62 + Math.sin(hour / 4) * 5;
    const mem = isSpikePeriod ? Math.min(84, baseMem + 16) : baseMem;

    const disk = 45.0; // stable disk at 45%

    const netIn = isSpikePeriod
      ? 4500000 + Math.random() * 800000
      : 1200000 + Math.sin(hour / 3) * 600000;

    const netOut = isSpikePeriod
      ? 9800000 + Math.random() * 1500000
      : 3400000 + Math.sin(hour / 3) * 1200000;

    snapshots.push({
      id: `metric-snap-${count - i}`,
      serverId: "srv-primary-vps",
      cpuUsage: Math.round(cpu * 10) / 10,
      memoryUsagePercentage: Math.round(mem * 10) / 10,
      diskUsagePercentage: disk,
      networkInBytesPerSecond: Math.round(netIn),
      networkOutBytesPerSecond: Math.round(netOut),
      recordedAt: timestamp,
    });
  }

  return snapshots;
}

export const initialMetricSnapshots: MetricSnapshot[] = generateMetricSnapshots();
