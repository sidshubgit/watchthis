"use client";

import React, { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";
import { CheckCircle, WarningCircle, Info, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toastMessage, clearToast } = useUiStore();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} weight="fill" />,
    error: <WarningCircle className="text-rose-500" size={20} weight="fill" />,
    info: <Info className="text-blue-500" size={20} weight="fill" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-200">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200",
          "backdrop-blur-md"
        )}
      >
        <div className="shrink-0">{icons[toastMessage.type]}</div>
        <div className="flex-1 font-medium">{toastMessage.text}</div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          aria-label="Dismiss toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
