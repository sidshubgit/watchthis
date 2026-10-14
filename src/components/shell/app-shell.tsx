"use client";

import React, { Suspense } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { TopBar } from "./top-bar";
import { MobileBottomNavigation } from "./mobile-bottom-navigation";
import { TaskRecorderDialog } from "../tasks/task-recorder-dialog";
import { AddWebsiteDialog } from "../websites/add-website-dialog";
import { ToastContainer } from "../ui/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Left Sidebar */}
      <Suspense fallback={<aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800" />}>
        <DesktopSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 dark:border-slate-800" />}>
          <TopBar />
        </Suspense>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading view...</div>}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Mobile Navigation */}
      <Suspense fallback={null}>
        <MobileBottomNavigation />
      </Suspense>

      {/* Global Task Creation Modal */}
      <Suspense fallback={null}>
        <TaskRecorderDialog />
      </Suspense>

      {/* Global Add Website Modal */}
      <Suspense fallback={null}>
        <AddWebsiteDialog />
      </Suspense>

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
}
