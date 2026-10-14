"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, modifyTask, removeTask } from "@/mocks/api/task-api";
import { fetchWebsites } from "@/mocks/api/website-api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { formatRelativeTime, formatTimestamp } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import { Task, TaskStatus, TaskPriority, TaskCategory } from "@/types/domain";
import {
  CheckSquareOffset,
  MagnifyingGlass,
  Plus,
  Globe,
  WarningCircle,
  CheckCircle,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editOutcome, setEditOutcome] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("completed");

  const { openRecordTask, showToast } = useUiStore();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", statusFilter, categoryFilter, priorityFilter, search],
    queryFn: () =>
      fetchTasks({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search,
      }),
  });

  const { data: websites = [] } = useQuery({
    queryKey: ["websites"],
    queryFn: () => fetchWebsites(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      modifyTask(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      showToast(`Task "${updated.title}" updated`, "success");
      setEditingTask(null);
    },
    onError: () => {
      showToast("Failed to update task", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      showToast("Task removed from records", "success");
    },
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const styles = {
      urgent: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      high: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      normal: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    };
    return (
      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", styles[priority])}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: TaskStatus) => {
    const styles = {
      completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      planned: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      cancelled: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    };
    return (
      <span className={cn("text-[11px] font-medium capitalize px-2 py-0.5 rounded border", styles[status])}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditStatus(task.status);
    setEditOutcome(task.outcome || "");
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    updateMutation.mutate({
      id: editingTask.id,
      updates: {
        status: editStatus,
        outcome: editOutcome.trim() || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Operational Tasks & Work Log"
        description="Record maintenance, log investigations, and track resolution outcomes across your infrastructure."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {tasks.length} tasks
          </span>
        }
        actions={
          <Button variant="primary" size="sm" onClick={() => openRecordTask()}>
            <Plus size={16} weight="bold" />
            <span>Record New Task</span>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions, outcomes..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-36 h-9 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="troubleshooting">Troubleshooting</option>
            <option value="maintenance">Maintenance</option>
            <option value="deployment">Deployment</option>
            <option value="backup">Backup</option>
            <option value="security">Security</option>
            <option value="monitoring">Monitoring</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-32 h-9 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          <TableRowSkeleton />
          <TableRowSkeleton />
        </Card>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquareOffset size={28} />}
          title="No tasks match your criteria"
          description="Clear your search filters or record a new maintenance task."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const relatedWebsite = websites.find((w) => w.id === task.websiteId);

            return (
              <Card
                key={task.id}
                className="p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                      <span className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {task.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {task.description || "No detailed notes provided."}
                    </p>

                    {/* Outcome section if completed */}
                    {task.outcome && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 text-xs">
                        <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">
                          Outcome / Verification:
                        </strong>
                        <span className="text-slate-700 dark:text-slate-300">
                          {task.outcome}
                        </span>
                      </div>
                    )}

                    {/* Meta info & Relationships */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>Updated {formatRelativeTime(task.updatedAt)}</span>
                      <span>•</span>
                      {relatedWebsite ? (
                        <Link
                          href={`/websites/${relatedWebsite.id}`}
                          className="flex items-center gap-1 hover:text-blue-500 text-slate-600 dark:text-slate-400 font-medium"
                        >
                          <Globe size={13} /> {relatedWebsite.name}
                        </Link>
                      ) : (
                        <span>Host Level (VPS)</span>
                      )}
                      {task.incidentId && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/incidents/${task.incidentId}`}
                            className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium hover:underline"
                          >
                            <WarningCircle size={13} /> Linked Incident
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Edit / Complete */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    {task.status !== "completed" && (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setEditingTask(task);
                          setEditStatus("completed");
                          setEditOutcome(task.outcome || "");
                        }}
                        title="Mark Completed"
                      >
                        <CheckCircle size={15} weight="bold" />
                        <span>Complete</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(task)}
                      title="Edit task details"
                    >
                      <PencilSimple size={15} />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Remove task "${task.title}"?`)) {
                          deleteMutation.mutate(task.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-500 p-2"
                      aria-label="Delete task"
                    >
                      <Trash size={15} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit / Complete Task Modal Dialog */}
      {editingTask && (
        <Dialog
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          title={`Update: ${editingTask.title}`}
          description="Update task lifecycle status or record troubleshooting outcome notes."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outcome / Resolution Notes
              </label>
              <Textarea
                rows={3}
                value={editOutcome}
                onChange={(e) => setEditOutcome(e.target.value)}
                placeholder="Describe what was discovered or verified (e.g. opcache memory allocated, systemd service restarted)..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                isLoading={updateMutation.isPending}
              >
                Save Updates
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
