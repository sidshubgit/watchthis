import { mockRepository } from "../repository/mock-repository";
import { Website } from "@/types/domain";

export async function fetchWebsites(filters?: { status?: string; search?: string; sort?: string }): Promise<Website[]> {
  return mockRepository.getWebsites(filters);
}

export async function fetchWebsiteById(id: string): Promise<Website | null> {
  return mockRepository.getWebsiteById(id);
}

export async function probeWebsiteLive(id: string): Promise<Website | null> {
  return mockRepository.probeWebsite(id);
}

export async function probeAllWebsitesLive(): Promise<Website[]> {
  return mockRepository.probeAllWebsites();
}

export async function addWebsite(data: { name?: string; url: string; isCritical?: boolean }): Promise<Website> {
  return mockRepository.addWebsite(data);
}

export async function deleteWebsite(id: string): Promise<boolean> {
  return mockRepository.deleteWebsite(id);
}
