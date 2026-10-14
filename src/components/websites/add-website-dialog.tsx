"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/stores/ui-store";
import { addWebsite } from "@/mocks/api/website-api";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, ShieldCheck } from "@phosphor-icons/react";

export function AddWebsiteDialog() {
  const { isAddWebsiteOpen, closeAddWebsite, showToast } = useUiStore();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Please enter a domain or website URL (e.g. clientapp.com)");
      return;
    }

    // Basic domain validation
    if (!cleanUrl.includes(".")) {
      setError("Please provide a valid domain with a top-level domain (e.g. mysite.com)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newSite = await addWebsite({
        url: cleanUrl,
        name: name.trim() || undefined,
        isCritical,
      });

      // Invalidate relevant queries so UI refreshes immediately
      await queryClient.invalidateQueries({ queryKey: ["websites"] });
      await queryClient.invalidateQueries({ queryKey: ["server"] });
      await queryClient.invalidateQueries({ queryKey: ["timeline"] });

      showToast(`Website "${newSite.name}" added & live probe initiated!`, "success");

      // Reset form
      setUrl("");
      setName("");
      setIsCritical(false);
      closeAddWebsite();
    } catch (err) {
      console.error("Failed to add website:", err);
      setError("Failed to register website. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    closeAddWebsite();
  };

  return (
    <Dialog
      open={isAddWebsiteOpen}
      onClose={handleClose}
      title="Add Website to Live Monitoring"
      description="Register a newly deployed website or domain hosted on your server for real-time uptime benchmarks."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* URL / Domain Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Domain / URL <span className="text-rose-500">*</span></span>
            <span className="text-[11px] font-normal lowercase text-slate-600 dark:text-slate-400">
              e.g. app.ajaypradeep.in or newclient.com
            </span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. portal.bizbharath.com"
              className="pl-9 h-10 font-mono text-sm"
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            HTTPS will be used automatically. Watchthis will immediately send an HTTP probe to measure status and latency.
          </p>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Friendly Display Name <span className="text-[11px] font-normal lowercase text-slate-600 dark:text-slate-400">(optional)</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Client Billing Portal"
            className="h-10 text-sm"
          />
        </div>

        {/* Critical Site Checkbox */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-start gap-3 cursor-pointer select-none"
             onClick={() => setIsCritical(!isCritical)}>
          <input
            type="checkbox"
            checked={isCritical}
            onChange={(e) => setIsCritical(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-medium text-xs text-slate-900 dark:text-slate-100">
              <ShieldCheck size={14} className="text-amber-500" weight="fill" />
              <span>Mark as Critical Production Target</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              When enabled, downtime on this site immediately marks overall server health as Critical and raises an urgent incident.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Add &amp; Probe Now
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
