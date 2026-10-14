"use client";

import React, { useState } from "react";
import { useTheme } from "@/providers/theme-provider";
import { useDemoStore } from "@/stores/demo-store";
import { useUiStore } from "@/stores/ui-store";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Select } from "@/components/ui/select";
import {
  Sun,
  Moon,
  Desktop,
  Lightning,
  ArrowClockwise,
  Broadcast,
  Pause,
  Play,
  Info,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    isSimulatedLive,
    setIsSimulatedLive,
    updateCadenceSeconds,
    setUpdateCadenceSeconds,
    simulateOutage,
    simulateRecovery,
    resetDemoData,
    isPerformingAction,
  } = useDemoStore();

  const { density, setDensity, showToast } = useUiStore();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetConfirm = async () => {
    await resetDemoData();
    setIsResetConfirmOpen(false);
    showToast("Baseline demo fixtures restored", "info");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Settings & Demo Orchestration"
        description="Configure workspace appearance, simulated polling frequencies, and interactive scenario testing."
      />

      {/* 1. Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance & Theme</CardTitle>
          <CardDescription>
            Personalize the interface color scheme and content display density.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Dark Mode", value: "dark", icon: Moon },
                { label: "Light Mode", value: "light", icon: Sun },
                { label: "System Sync", value: "system", icon: Desktop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() => setTheme(item.value as "light" | "dark" | "system")}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all gap-2",
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    <Icon size={20} weight={isSelected ? "fill" : "regular"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density Preference */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Layout Density
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                onClick={() => setDensity("comfortable")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium text-left transition-all",
                  density === "comfortable"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                  Comfortable (Default)
                </div>
                <div className="text-[11px] text-slate-500">
                  Generous whitespace and larger touch targets.
                </div>
              </button>

              <button
                onClick={() => setDensity("compact")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium text-left transition-all",
                  density === "compact"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                  Compact Density
                </div>
                <div className="text-[11px] text-slate-500">
                  Tighter rows for high-density monitor screens.
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Demo Behavior & Simulation Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Broadcast className="text-blue-500" size={20} weight="bold" />
            <CardTitle className="text-base font-semibold">
              Simulated Telemetry & Scenario Controller
            </CardTitle>
          </div>
          <CardDescription>
            Control the frequency of simulated checks and trigger deterministic operational scenarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active polling toggle & Cadence */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Simulated Heartbeat Polling
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Periodically refreshes probe timestamps and slight metric variations in-memory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={updateCadenceSeconds}
                onChange={(e) => setUpdateCadenceSeconds(Number(e.target.value))}
                className="w-32 h-9 text-xs"
              >
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 60s</option>
              </Select>

              <Button
                variant={isSimulatedLive ? "secondary" : "primary"}
                size="sm"
                onClick={() => setIsSimulatedLive(!isSimulatedLive)}
              >
                {isSimulatedLive ? (
                  <>
                    <Pause size={15} /> <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={15} /> <span>Resume</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Scenario Triggers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Deterministic Scenario Triggers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs mb-1">
                  <Lightning size={16} weight="fill" />
                  <span>Outage Simulation</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Triggers an HTTP 503 outage on aurora.example.test, opens a critical incident, and inserts timeline entries.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await simulateOutage("site-aurora");
                    showToast("Simulated outage triggered on aurora.example.test", "error");
                  }}
                  disabled={isPerformingAction}
                  className="w-full"
                >
                  Simulate Outage
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                  <ArrowClockwise size={16} weight="bold" />
                  <span>Recovery Simulation</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Restores HTTP 200 OK across affected sites, resolves open incidents, and logs verification notes in the timeline.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await simulateRecovery();
                    showToast("Simulated recovery completed", "success");
                  }}
                  disabled={isPerformingAction}
                  className="w-full"
                >
                  Simulate Recovery
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Baseline Data Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Reset Demo Environment
              </div>
              <div className="text-[11px] text-slate-500">
                Restores original deterministic website, incident, and timeline fixtures.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={isPerformingAction}
            >
              <ArrowClockwise size={15} />
              <span>Reset Baseline Fixtures</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Product & Phase 1 Disclaimer */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                watchthis Phase 1 — Frontend Architecture Blueprint
              </h4>
              <p className="leading-relaxed">
                This application represents the complete Phase 1 interactive frontend implementation. All server telemetry, website checks, incident lifecycles, and tasks operate via a typed in-memory mock repository.
              </p>
              <p>
                No real SSH connections, Linux agent daemons, external uptime probes, shell execution, or remote system restarts are executed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Demo Fixtures?"
        description="This will restore all simulated server telemetry, website health states, incidents, and timeline logs back to the initial baseline dataset."
        confirmLabel="Reset Baseline Data"
        isDestructive={true}
      />
    </div>
  );
}
