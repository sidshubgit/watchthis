import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or less"),
  category: z.enum([
    "maintenance",
    "troubleshooting",
    "deployment",
    "backup",
    "security",
    "monitoring",
    "other",
  ]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  websiteId: z.string().nullable().optional(),
  incidentId: z.string().nullable().optional(),
  outcome: z.string().max(2000).nullable().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
