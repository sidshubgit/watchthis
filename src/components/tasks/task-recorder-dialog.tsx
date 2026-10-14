"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData } from "@/lib/validation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useUiStore } from "@/stores/ui-store";
import { saveTask } from "@/mocks/api/task-api";
import { fetchWebsites } from "@/mocks/api/website-api";
import { fetchIncidents } from "@/mocks/api/incident-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquareOffset, Info } from "@phosphor-icons/react";

export function TaskRecorderDialog() {
  const {
    isRecordTaskOpen,
    closeRecordTask,
    preselectedWebsiteId,
    preselectedIncidentId,
    showToast,
  } = useUiStore();

  const queryClient = useQueryClient();

  const { data: websites = [] } = useQuery({
    queryKey: ["websites"],
    queryFn: () => fetchWebsites(),
    enabled: isRecordTaskOpen,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
    enabled: isRecordTaskOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "maintenance",
      priority: "normal",
      status: "in_progress",
      websiteId: null,
      incidentId: null,
      outcome: "",
    },
  });

  const currentStatus = watch("status");

  useEffect(() => {
    if (isRecordTaskOpen) {
      setValue("websiteId", preselectedWebsiteId || null);
      setValue("incidentId", preselectedIncidentId || null);

      if (preselectedIncidentId) {
        setValue("category", "troubleshooting");
        setValue("priority", "urgent");
      }
    }
  }, [isRecordTaskOpen, preselectedWebsiteId, preselectedIncidentId, setValue]);

  const mutation = useMutation({
    mutationFn: (data: TaskFormData) => saveTask(data),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      showToast(`Task "${newTask.title}" recorded successfully`, "success");
      reset();
      closeRecordTask();
    },
    onError: () => {
      showToast("Failed to record task. Please try again.", "error");
    },
  });

  const onSubmit = (data: TaskFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={isRecordTaskOpen}
      onClose={() => {
        reset();
        closeRecordTask();
      }}
      title="Record Operational Task"
      description="Document server maintenance, diagnostics, or incident mitigation notes."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
          <Info size={16} className="shrink-0" weight="bold" />
          <span>
            Tasks are saved to the operational timeline. Command snippets are stored as documentation and will not execute on your server.
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. Restart php8.3-fpm service and purge opcache"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        {/* Category & Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <Select {...register("category")}>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="maintenance">Maintenance</option>
              <option value="deployment">Deployment</option>
              <option value="backup">Backup</option>
              <option value="security">Security</option>
              <option value="monitoring">Monitoring</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <Select {...register("priority")}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <Select {...register("status")}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        {/* Related Website & Incident */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Related Website (Optional)
            </label>
            <Select
              {...register("websiteId")}
              value={watch("websiteId") || ""}
              onChange={(e) => setValue("websiteId", e.target.value || null)}
            >
              <option value="">None (Server host level)</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.url.replace("https://", "")})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Related Incident (Optional)
            </label>
            <Select
              {...register("incidentId")}
              value={watch("incidentId") || ""}
              onChange={(e) => setValue("incidentId", e.target.value || null)}
            >
              <option value="">None</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity.toUpperCase()}] {inc.title.slice(0, 38)}...
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description & Troubleshooting Notes
          </label>
          <Textarea
            rows={3}
            placeholder="Document error log findings, configuration changes, or commands run..."
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        {/* Outcome (if completed or marked completed) */}
        {currentStatus === "completed" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Outcome & Verification Result
            </label>
            <Textarea
              rows={2}
              placeholder="e.g. Service successfully restored. Latency returned to 110ms with no 502 errors."
              error={errors.outcome?.message}
              {...register("outcome")}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              closeRecordTask();
            }}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={mutation.isPending}
          >
            <CheckSquareOffset size={16} weight="bold" />
            <span>Record Task</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
