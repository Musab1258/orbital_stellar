<<<<<<< feature/370-configurable-backoff-strategies
2
 
import type {
3
 
  NormalizedEvent,
4
 
  Watcher,
5
 
  WatcherNotification,
6
 
} from "@orbital/pulse-core";
7
 
import { createHmac, timingSafeEqual } from "crypto";
8
 
​
9
 
import { DeadLetterStore } from "./MemoryDeadLetterStore.js";
10
 
import type { Tracer, VerifyWebhookOptions, WebhookConfig } from "./types.js";
11
 
import { DEFAULT_MAX_AGE_MS, DEFAULT_CLOCK_SKEW_MS } from "./types.js";
12
 
export { DeadLetterStore } from "./MemoryDeadLetterStore.js";
13
 
export { NOOP_WEBHOOK_METRICS, CountingWebhookMetrics } from "./metrics.js";
14
 
export type { WebhookMetrics } from "./types.js";
15
 
export { PostgresDeadLetterStore } from "./PostgresDeadLetterStore.js";
16
 
export { RedisRetryQueue } from "./RedisRetryQueue.js";
17
 
export { verifyWebhookEdge, verifyWebhookEdgeRaw } from "./edge.js";
18
 
export type { DeadLetterEntry, DeadLetterFilter as MemoryDeadLetterFilter } from "./MemoryDeadLetterStore.js";
19
 
export type { DeadLetterFilter, DeadLetterInput, DeadLetterRecord, PgLike } from "./PostgresDeadLetterStore.js";
20
 
export type { RedisLike, RedisRetryQueueOptions } from "./RedisRetryQueue.js";
21
 
export type { RetryQueue, RetryRecord } from "./RetryQueue.js";
22
 
export type { Span, Tracer, VerifierSignatureVersion, VerifyWebhookOptions, WebhookConfig } from "./types.js";
23
 
​
24
 
/**
25
 
 * Payload for the `raw` field of a `webhook.failed` event.
26
 
 */
27
 
export type WebhookFailureRaw = {
28
 
  /** Summary of the error that caused delivery to fail. */
29
 
  error: string;
30
 
  /** The target URL that failed delivery. */
31
 
  url: string;
32
 
  /** Total number of attempts made before giving up. */
33
 
  attempts: number;
34
 
  /** The original event that we tried to deliver. */
35
 
  originalEvent: NormalizedEvent;
36
 
};
37
 
​
38
 
/**
39
 
 * Payload for the `raw` field of a `webhook.dropped` event.
40
 
 */
41
 
export type WebhookDroppedRaw = {
42
 
  /** The reason the webhook was dropped. Currently only `retry_cap_exceeded`. */
43
 
  reason: "retry_cap_exceeded";
44
 
  /** The target URL that was dropped. */
45
 
  url: string;
46
 
  /** The `maxConcurrentRetries` limit that was hit. */
47
 
  maxConcurrentRetries: number;
48
 
  /** The original event that was dropped. */
49
 
  originalEvent: NormalizedEvent;
50
 
};
