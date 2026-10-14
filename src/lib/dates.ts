export function formatTimestamp(isoString: string | null): string {
  if (!isoString) return "Never";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "Invalid date";
  }
}

export function formatTimeOnly(isoString: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatDateOnly(isoString: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatRelativeTime(isoString: string | null, baseDate = new Date()): string {
  if (!isoString) return "Unknown";
  try {
    const date = new Date(isoString);
    const diffSec = Math.floor((baseDate.getTime() - date.getTime()) / 1000);

    if (diffSec < 0) {
      // Future date
      const futureSec = Math.abs(diffSec);
      if (futureSec < 60) return "in a few seconds";
      if (futureSec < 3600) return `in ${Math.floor(futureSec / 60)}m`;
      if (futureSec < 86400) return `in ${Math.floor(futureSec / 3600)}h`;
      return `in ${Math.floor(futureSec / 86400)}d`;
    }

    if (diffSec < 5) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return formatDateOnly(isoString);
  } catch {
    return "Unknown";
  }
}

export function getDaysUntil(isoString: string | null): number | null {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
