import { mockRepository } from "../repository/mock-repository";
import { Incident } from "@/types/domain";

export async function fetchIncidents(filters?: { status?: string; severity?: string; search?: string }): Promise<Incident[]> {
  return mockRepository.getIncidents(filters);
}

export async function fetchIncidentById(id: string): Promise<Incident | null> {
  return mockRepository.getIncidentById(id);
}
