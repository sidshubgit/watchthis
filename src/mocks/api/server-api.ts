import { mockRepository } from "../repository/mock-repository";
import { Server, MetricSnapshot, TimeRange } from "@/types/domain";

export async function fetchServer(): Promise<Server> {
  return mockRepository.getServer();
}

export async function fetchMetricSnapshots(range: TimeRange = "24h"): Promise<MetricSnapshot[]> {
  return mockRepository.getMetricSnapshots(range);
}
