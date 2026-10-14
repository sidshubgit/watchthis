import { mockRepository } from "../repository/mock-repository";
import { TimelineEvent } from "@/types/domain";

export async function fetchTimelineEvents(filters?: {
  type?: string;
  severity?: string;
  search?: string;
  websiteId?: string;
  incidentId?: string;
}): Promise<TimelineEvent[]> {
  return mockRepository.getTimelineEvents(filters);
}
