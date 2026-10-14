"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/theme-provider";
import { useUiStore } from "@/stores/ui-store";
import { DemoModeIndicator } from "@/components/shared/demo-mode-indicator";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Plus,
  List,
} from "@phosphor-icons/react";

const routeTitles: Record<string, string> = {
  "/": "Command Center",
  "/server": "Server Health",
  "/websites": "Websites Inventory",
  "/timeline": "Live Ops Timeline",
  "/tasks": "Operational Tasks",
  "/incidents": "Incidents & Outages",
  "/settings": "Settings & Demo Controls",
};

export function TopBar() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { openRecordTask, setIsMobileNavOpen } = useUiStore();

  const title =
    routeTitles[pathname] ||
    (pathname.startsWith("/websites/")
      ? "Website Detail"
      : pathname.startsWith("/incidents/")
      ? "Incident Investigation"
      : pathname.startsWith("/tasks/")
      ? "Task Detail"
      : "watchthis");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <List size={20} weight="bold" />
        </button>
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            watchthis /
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 ml-1">
            {title}
          </span>
        </div>
      </div>

      {/* Right: Actions, Demo Indicator, Theme, Quick Record */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DemoModeIndicator />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} weight="bold" />
          ) : (
            <Moon size={18} weight="bold" />
          )}
        </button>

        {/* Primary Action: Record Task */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => openRecordTask()}
          className="shadow-sm"
        >
          <Plus size={16} weight="bold" />
          <span className="hidden sm:inline">Record Task</span>
          <span className="sm:hidden">Task</span>
        </Button>
      </div>
    </header>
  );
}
