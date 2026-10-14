import test from "node:test";
import assert from "node:assert";
import { taskSchema } from "../lib/validation";

test("taskSchema succeeds with valid minimal data", () => {
  const validData = {
    title: "Restart php8.3-fpm service",
    description: "Verified worker status in systemd",
    category: "troubleshooting",
    priority: "urgent",
    status: "in_progress",
  };

  const parsed = taskSchema.safeParse(validData);
  assert.strictEqual(parsed.success, true);
});

test("taskSchema fails when title is less than 3 characters", () => {
  const invalidData = {
    title: "No",
    description: "Too short title",
    category: "maintenance",
    priority: "normal",
    status: "planned",
  };

  const parsed = taskSchema.safeParse(invalidData);
  assert.strictEqual(parsed.success, false);
});

test("taskSchema fails when category is invalid", () => {
  const invalidData = {
    title: "Update packages",
    description: "",
    category: "non_existent_category",
    priority: "normal",
    status: "planned",
  };

  const parsed = taskSchema.safeParse(invalidData);
  assert.strictEqual(parsed.success, false);
});
