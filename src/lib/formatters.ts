export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatRate(bytesPerSec: number): string {
  if (bytesPerSec === 0) return "0 KB/s";
  const k = 1024;
  if (bytesPerSec < k * 1024) {
    return `${(bytesPerSec / k).toFixed(1)} KB/s`;
  }
  return `${(bytesPerSec / (k * k)).toFixed(2)} MB/s`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSec = seconds % 60;
    return remainingSec > 0 ? `${minutes}m ${remainingSec}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMin}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value)) return "0.0%";
  return `${value.toFixed(decimals)}%`;
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

export function formatHttpStatusCode(code: number | null): { text: string; category: "ok" | "redirect" | "client_err" | "server_err" | "unknown" } {
  if (!code) return { text: "No reply", category: "unknown" };
  if (code >= 200 && code < 300) return { text: `${code} OK`, category: "ok" };
  if (code >= 300 && code < 400) return { text: `${code} Redirect`, category: "redirect" };
  if (code >= 400 && code < 500) return { text: `${code} Error`, category: "client_err" };
  if (code >= 500) return { text: `${code} Server Error`, category: "server_err" };
  return { text: `${code}`, category: "unknown" };
}
