import type { WebhookPayload } from "./stellar/types";

// ---------------------------------------------------------------------------
// URL validation — HTTPS only, block private/internal networks
// ---------------------------------------------------------------------------

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  ".local",
  ".internal",
];

function isPrivateIp(hostname: string): boolean {
  // 10.x.x.x
  if (/^10\./.test(hostname)) return true;
  // 172.16.0.0 – 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  // 192.168.x.x
  if (/^192\.168\./.test(hostname)) return true;
  // 169.254.x.x (link-local)
  if (/^169\.254\./.test(hostname)) return true;
  return false;
}

export function isValidCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTS.some((h) => hostname === h || hostname.endsWith(h))) {
      return false;
    }

    if (isPrivateIp(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fire-and-forget webhook delivery
// ---------------------------------------------------------------------------

export function sendWebhook(url: string, payload: WebhookPayload): void {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {
    // Silently swallow errors — fire and forget
  });
}
