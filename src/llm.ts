import { z } from "zod";
import { Id, MicroUsd, ModelId, Reason } from "./common.ts";

export const LlmErrorClass = z.enum([
  "rate_limit",
  "timeout",
  "provider",
  "invalid",
  "budget_refused",
]);
export type LlmErrorClass = z.infer<typeof LlmErrorClass>;

export const FinishReason = z.enum([
  "stop",
  "length",
  "tool_calls",
  "content_filter",
]);
export type FinishReason = z.infer<typeof FinishReason>;

const Tokens = z.int().nonnegative();
const attempt = {
  taskId: Id,
  callId: Id,
  attempt: z.int().min(1),
  model: ModelId,
};

export const CallStartedEventPayloadV1 = z
  .object({
    ...attempt,
    agentId: Id,
    agentVersion: z.int().min(1),
    reservationId: Id,
  })
  .describe(
    "One attempt of a call starts on one model, with its own reservation.",
  );
export type CallStartedEventPayloadV1 = z.infer<
  typeof CallStartedEventPayloadV1
>;

export const CallCompletedEventPayloadV1 = z
  .object({
    ...attempt,
    text: z.string().max(100000),
    finishReason: FinishReason,
    inputTokens: Tokens,
    outputTokens: Tokens,
    cachedTokens: Tokens,
    costMicroUsd: MicroUsd,
    latencyMs: z.int().nonnegative(),
    bodyId: Id,
  })
  .describe(
    "The call is done: output text, tokens, cost in micro-USD, latency, and the id of the stored request and response.",
  );
export type CallCompletedEventPayloadV1 = z.infer<
  typeof CallCompletedEventPayloadV1
>;

export const CallFailedEventPayloadV1 = z
  .object({
    ...attempt,
    errorClass: LlmErrorClass,
    reason: Reason,
    costMicroUsd: MicroUsd,
    nextModel: ModelId.exactOptional(),
    inputTokens: Tokens.exactOptional(),
    outputTokens: Tokens.exactOptional(),
    bodyId: Id.exactOptional(),
  })
  .describe(
    "One attempt failed. `nextModel` is the next model of the fallback chain; absent means that the call failed.",
  );
export type CallFailedEventPayloadV1 = z.infer<typeof CallFailedEventPayloadV1>;
