import { mockRepository } from "../repository/mock-repository";
import { Task } from "@/types/domain";
import { TaskFormData } from "@/lib/validation";

export async function fetchTasks(filters?: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  websiteId?: string;
  incidentId?: string;
}): Promise<Task[]> {
  return mockRepository.getTasks(filters);
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  return mockRepository.getTaskById(id);
}

export async function saveTask(input: TaskFormData): Promise<Task> {
  return mockRepository.createTask(input);
}

export async function modifyTask(id: string, updates: Partial<Task>): Promise<Task> {
  return mockRepository.updateTask(id, updates);
}

export async function removeTask(id: string): Promise<boolean> {
  return mockRepository.deleteTask(id);
}
