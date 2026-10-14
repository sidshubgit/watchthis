"use client";

import React, { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockRepository } from "@/mocks/repository/mock-repository";
import { useDemoStore } from "@/stores/demo-store";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 10, // 10 seconds
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  const { isSimulatedLive, updateCadenceSeconds } = useDemoStore();
  // Track if a probe is already running to prevent overlap
  const isProbing = useRef(false);

  // Invalidate queries when repository data changes
  useEffect(() => {
    const unsubscribe = mockRepository.subscribe(() => {
      queryClient.invalidateQueries();
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Real-time live probing: hit the actual /api/websites/probe endpoint on every tick
  useEffect(() => {
    if (!isSimulatedLive) return;

    // Fire an immediate probe on mount so the dashboard is live right away
    const runProbe = async () => {
      if (isProbing.current) return;
      isProbing.current = true;
      try {
        await mockRepository.probeAllWebsites();
      } catch (err) {
        console.warn("Background probe error:", err);
      } finally {
        isProbing.current = false;
      }
    };

    // Small delay on initial load so the page can render first
    const initialTimer = setTimeout(() => runProbe(), 1500);

    const interval = setInterval(() => {
      runProbe();
    }, updateCadenceSeconds * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isSimulatedLive, updateCadenceSeconds]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
