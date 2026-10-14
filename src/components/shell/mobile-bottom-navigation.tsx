"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Globe,
  ClockCounterClockwise,
  CheckSquareOffset,
  DotsThreeCircle,
  HardDrives,
  WarningCircle,
  Gear,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { isMobileNavOpen, setIsMobileNavOpen } = useUiStore();

  const mainTabs = [
    { label: "Home", href: "/", icon: House, exact: true },
    { label: "Websites", href: "/websites", icon: Globe },
    { label: "Timeline", href: "/timeline", icon: ClockCounterClockwise },
    { label: "Tasks", href: "/tasks", icon: CheckSquareOffset },
  ];

  const moreItems = [
    { label: "Server Health", href: "/server", icon: HardDrives },
    { label: "Incidents & Outages", href: "/incidents", icon: WarningCircle },
    { label: "Settings & Demo Controls", href: "/settings", icon: Gear },
  ];

  return (
    <>
      {/* Mobile Bottom Fixed Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {mainTabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors min-h-[44px]",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              <span className="mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors min-h-[44px]",
            isMobileNavOpen || pathname === "/server" || pathname === "/incidents" || pathname === "/settings"
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <DotsThreeCircle size={20} weight="regular" />
          <span className="mt-1">More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="flex-1"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-2xl p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Navigation & Views
              </span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
