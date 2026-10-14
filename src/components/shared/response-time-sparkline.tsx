import React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  isDown?: boolean;
}

export function ResponseTimeSparkline({
  data,
  width = 72,
  height = 20,
  className,
  isDown = false,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="w-[72px] h-[20px] bg-slate-100 dark:bg-slate-800/40 rounded" />;
  }

  const strokeColor = isDown
    ? "#f43f5e"
    : "#3b82f6";

  const max = Math.max(...data, 10);
  const min = Math.min(...data.filter((v) => v > 0), 0);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const normalized = val === 0 ? 0 : (val - min) / range;
      const y = height - 4 - normalized * (height - 8) + 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("inline-flex items-center", className)} title={`Recent latency trend`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* End dot */}
        {data.length > 0 && (
          <circle
            cx={(width - 4) + 2}
            cy={
              data[data.length - 1] === 0
                ? height - 2
                : height - 4 - ((data[data.length - 1] - min) / range) * (height - 8) + 2
            }
            r="2"
            fill={strokeColor}
          />
        )}
      </svg>
    </div>
  );
}
