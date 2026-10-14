import { NextRequest, NextResponse } from "next/server";

// Known error page signatures to detect "soft 200" failures
// (e.g. WordPress DB errors, PHP fatal errors, specific Cloudflare error pages)
// IMPORTANT: Keep these specific — overly generic strings cause false positives.
// e.g. "cloudflare" alone matches healthy sites that use Cloudflare as a CDN.
const ERROR_SIGNATURES: string[] = [
  // ── WordPress / MySQL ──────────────────────────────────────────────────────
  "error establishing a database connection",
  "database connection error",
  "too many connections",
  "unable to connect to database",
  "mysql server has gone away",
  "access denied for user",

  // ── PHP fatal errors (specific enough to be unambiguous) ──────────────────
  "php fatal error",
  "fatal error: uncaught",
  "call to undefined function",

  // ── Cloudflare specific ERROR pages only (not CDN-proxied healthy sites) ──
  // Cloudflare error pages contain the Ray ID string + one of these codes.
  // A healthy site served via Cloudflare does NOT contain these strings.
  "sorry, you have been blocked",           // CF 1020 Access Denied
  "this website is using a security service", // CF bot challenge pages
  "ray id:</span>",                          // CF error page footer marker
  "cloudflare ray id:",                      // plaintext CF error footer
  "error 521: web server is down",
  "error 522: connection timed out",
  "error 523: origin is unreachable",
  "error 524: a timeout occurred",
  "error 525: ssl handshake failed",
  "error 526: invalid ssl certificate",
  "error 530",                               // CF 530 = origin DNS error

  // ── Generic server-level error pages ─────────────────────────────────────
  "500 internal server error</title>",       // Anchored to <title> to avoid body text matches
  "502 bad gateway</title>",
  "503 service unavailable</title>",
  "504 gateway timeout</title>",
];

// HTTP status code → ServiceStatus
function classifyByStatus(httpStatus: number): "healthy" | "degraded" | "down" {
  if (httpStatus >= 200 && httpStatus < 400) return "healthy";
  if (httpStatus >= 400 && httpStatus < 500) return "degraded";
  return "down";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let res: Response;
    try {
      // Always use GET so we can read the response body for content-based checks
      res = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; WatchThis-Monitor/2.0; +https://watchthis.vercel.app)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Cache-Control": "no-cache",
        },
        // Don't follow redirects indefinitely
        redirect: "follow",
      });
    } catch {
      // Network-level failure (DNS, timeout, connection refused)
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      return NextResponse.json({
        url: targetUrl,
        status: "down",
        httpStatusCode: null,
        responseTimeMs: duration,
        errorType: "network_error",
        errorDetail: "Connection failed or timed out",
        checkedAt: new Date().toISOString(),
      });
    }

    clearTimeout(timeout);
    const duration = Date.now() - startTime;

    const httpStatus = res.status;
    let status = classifyByStatus(httpStatus);
    let errorType: string | null = null;
    let errorDetail: string | null = null;
    let bodySnippet: string | null = null;

    // For 2xx responses, read body to detect "soft errors"
    // (pages that return 200 OK but have error content, like WordPress DB errors)
    if (httpStatus >= 200 && httpStatus < 300) {
      try {
        // Read up to ~32KB to check for error signatures
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/html") || contentType.includes("text/plain") || contentType === "") {
          const bodyText = await res.text();
          const bodyLower = bodyText.toLowerCase().substring(0, 32768);
          bodySnippet = bodyText.substring(0, 500).trim() || null;

          for (const sig of ERROR_SIGNATURES) {
            if (bodyLower.includes(sig)) {
              status = "down";
              errorType = "content_error";
              errorDetail = `Page returned HTTP ${httpStatus} but body contains error: "${sig}"`;
              break;
            }
          }
        }
      } catch {
        // Body read failed — still treat HTTP status as source of truth
      }
    } else if (httpStatus >= 500) {
      errorType = "server_error";
      errorDetail = `HTTP ${httpStatus} received`;
    } else if (httpStatus >= 400) {
      errorType = "client_error";
      errorDetail = `HTTP ${httpStatus} received`;
    }

    return NextResponse.json({
      url: targetUrl,
      status,
      httpStatusCode: httpStatus,
      responseTimeMs: duration,
      errorType,
      errorDetail,
      bodySnippet: errorType === "content_error" ? bodySnippet : null,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const duration = Date.now() - startTime;
    return NextResponse.json({
      url: targetUrl,
      status: "down",
      httpStatusCode: null,
      responseTimeMs: duration,
      errorType: "probe_error",
      errorDetail: err instanceof Error ? err.message : "Unknown probe failure",
      checkedAt: new Date().toISOString(),
    });
  }
}
