import { AI_LIMITS } from "@/lib/ai/gemini-config";
import { AIServiceError } from "@/lib/ai/types/ai.types";

interface RateWindowEntry {
  timestamps: number[];
  recentSignatures: Map<string, number>;
}

/**
 * Per-instance rate limit and duplicate-request prevention store.
 * Note: On Vercel serverless functions, in-memory state is scoped to the warm lambda instance.
 * For multi-region distributed rate limiting, connect an external KV/Upstash store.
 */
const rateStore = new Map<string, RateWindowEntry>();

export function resetRateLimitStore(): void {
  rateStore.clear();
}

export function checkRateLimitAndDedup(
  clientKey: string,
  requestSignature: string,
  now: number = Date.now()
): void {
  const key = clientKey || "anonymous";
  let entry = rateStore.get(key);

  if (!entry) {
    entry = {
      timestamps: [],
      recentSignatures: new Map(),
    };
    rateStore.set(key, entry);
  }

  // Prune expired timestamps outside the rate limit window
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < AI_LIMITS.RATE_LIMIT_WINDOW_MS
  );

  // Prune expired duplicate signatures
  for (const [sig, ts] of entry.recentSignatures.entries()) {
    if (now - ts >= AI_LIMITS.DEDUP_WINDOW_MS) {
      entry.recentSignatures.delete(sig);
    }
  }

  // Check duplicate request within dedup window
  const lastSameReq = entry.recentSignatures.get(requestSignature);
  if (lastSameReq !== undefined && now - lastSameReq < AI_LIMITS.DEDUP_WINDOW_MS) {
    throw new AIServiceError(
      "DUPLICATE_REQUEST",
      "An identical AI request is already being processed. Please wait a moment.",
      429
    );
  }

  // Check window rate limit
  if (entry.timestamps.length >= AI_LIMITS.RATE_LIMIT_MAX_REQUESTS) {
    throw new AIServiceError(
      "RATE_LIMITED",
      `Too many AI requests (${AI_LIMITS.RATE_LIMIT_MAX_REQUESTS} per minute maximum). Please wait a moment before trying again.`,
      429
    );
  }

  entry.timestamps.push(now);
  entry.recentSignatures.set(requestSignature, now);
}

