"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  HardDrives,
  Globe,
  ClockCounterClockwise,
  CheckSquareOffset,
  WarningCircle,
  Gear,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchServer } from "@/mocks/api/server-api";
import { fetchIncidents } from "@/mocks/api/incident-api";
import { fetchTasks } from "@/mocks/api/task-api";

export function DesktopSidebar() {
  const pathname = usePathname();

  const { data: server } = useQuery({
    queryKey: ["server"],
    queryFn: () => fetchServer(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const activeIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;
  const pendingTasksCount = tasks.filter((t) => t.status === "planned" || t.status === "in_progress").length;

  const navItems = [
    {
      label: "Command Center",
      href: "/",
      icon: House,
      exact: true,
    },
    {
      label: "Server Health",
      href: "/server",
      icon: HardDrives,
    },
    {
      label: "Websites",
      href: "/websites",
      icon: Globe,
    },
    {
      label: "Live Ops Timeline",
      href: "/timeline",
      icon: ClockCounterClockwise,
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: CheckSquareOffset,
      count: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      label: "Incidents",
      href: "/incidents",
      icon: WarningCircle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Gear,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-xl h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20">
          <span className="text-base tracking-tighter">wt</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
              watchthis
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              v1.0
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Personal Ops Center
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Monitoring
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group select-none",
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  weight={isActive ? "fill" : "regular"}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    item.badgeColor || "bg-blue-500 text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && !item.badge && (
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.2 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Monitored Host Footer Card */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <Link
          href="/server"
          className="block p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
              {server?.name || "serverforcloud"}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{server?.operatingSystem ? "Ubuntu 24.04" : "Ubuntu Linux"}</span>
            <span className="font-mono text-[10px]">{server?.ipAddress || "156.238.99.48"}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
