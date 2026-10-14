"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/stores/demo-store";
import { formatTimeOnly } from "@/lib/dates";
import { Broadcast, Play, Pause, ArrowClockwise, Lightning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function DemoModeIndicator() {
  const {
    isSimulatedLive,
    setIsSimulatedLive,
    lastSimulatedCheckAt,
    simulateOutage,
    simulateRecovery,
    resetDemoData,
    isPerformingAction,
  } = useDemoStore();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
          "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20"
        )}
        title="Simulated Monitoring Mode — Click for demo controls"
      >
        <span className="relative flex h-2 w-2">
          {isSimulatedLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        <span className="hidden sm:inline font-semibold">Simulated Monitoring</span>
        <span className="sm:hidden font-semibold">Demo</span>
        <span suppressHydrationWarning className="text-[11px] opacity-70 border-l border-blue-500/30 pl-1.5 tabular-nums">
          {formatTimeOnly(lastSimulatedCheckAt)}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 z-50 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                <Broadcast className="text-blue-500" size={16} weight="bold" />
                <span>Demo State Controls</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Phase 1 Mock
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
              All infrastructure metrics, website checks, and incidents in watchthis are simulated locally. No actual server commands or external network probes occur.
            </p>

            <div className="space-y-1.5">
              <button
                disabled={isPerformingAction}
                onClick={() => {
                  setIsSimulatedLive(!isSimulatedLive);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isSimulatedLive ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isSimulatedLive ? "Pause Simulated Polling" : "Resume Simulated Polling"}</span>
                </span>
                <span className="font-semibold">{isSimulatedLive ? "Active" : "Paused"}</span>
              </button>

              <button
                disabled={isPerformingAction}
                onClick={async () => {
                  const { probeLiveWebsites } = useDemoStore.getState();
                  await probeLiveWebsites();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors font-medium"
              >
                <ArrowClockwise size={14} weight="bold" />
                <span>Probe All 14 Sites Live Now</span>
              </button>

              <button
                disabled={isPerformingAction}
                onClick={async () => {
                  await simulateOutage("site-ajaypradeep");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Lightning size={14} weight="fill" />
                <span>Simulate Outage (ajaypradeep.in)</span>
              </button>

              <button
                disabled={isPerformingAction}
                onClick={async () => {
                  await simulateRecovery();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <ArrowClockwise size={14} weight="bold" />
                <span>Simulate Recovery (Resolve Open Outage)</span>
              </button>

              <button
                disabled={isPerformingAction}
                onClick={async () => {
                  await resetDemoData();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowClockwise size={14} />
                <span>Reset Baseline Fixtures</span>
              </button>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium"
              >
                More Demo Settings →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
