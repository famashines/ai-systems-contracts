import { z } from "zod";
import { CapMicroUsd } from "./budget.ts";
import { Id, MicroUsd, ModelId, Reason } from "./common.ts";

export const LlmErrorClass = z.enum([
  "rate_limit",
  "timeout",
  "provider",
  "invalid",
  "budget_refused",
  "cancelled",
]);
export type LlmErrorClass = z.infer<typeof LlmErrorClass>;

export const FinishReason = z.enum([
  "stop",
  "length",
  "tool_calls",
  "content_filter",
]);
export type FinishReason = z.infer<typeof FinishReason>;

export const OutputText = z
  .string()
  .max(100000, { abort: true })
  .regex(/^[^\0]*$/);

const Tokens = z.int().nonnegative();
const callTotals = {
  callInputTokens: Tokens.exactOptional(),
  callOutputTokens: Tokens.exactOptional(),
  callCostMicroUsd: CapMicroUsd.exactOptional(),
};
type CallTotals = {
  callInputTokens?: number;
  callOutputTokens?: number;
  callCostMicroUsd?: number;
};
const totalsTogether = (call: CallTotals) =>
  [call.callInputTokens, call.callOutputTokens, call.callCostMicroUsd].every(
    (value) => value === undefined,
  ) ||
  [call.callInputTokens, call.callOutputTokens, call.callCostMicroUsd].every(
    (value) => value !== undefined,
  );
const totalsTogetherRule = {
  message:
    "callInputTokens, callOutputTokens and callCostMicroUsd come together",
  path: ["callCostMicroUsd"],
};
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
    text: OutputText,
    finishReason: FinishReason,
    inputTokens: Tokens,
    outputTokens: Tokens,
    cachedTokens: Tokens,
    costMicroUsd: MicroUsd,
    latencyMs: z.int().nonnegative(),
    bodyId: Id,
    ...callTotals,
  })
  .refine(totalsTogether, totalsTogetherRule)
  .describe(
    "The call is done: output text, tokens, cost in micro-USD, latency, and the id of the stored request and response. `callInputTokens`, `callOutputTokens` and `callCostMicroUsd` are the totals of all attempts of the call.",
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
    reservationId: Id.exactOptional(),
    ...callTotals,
  })
  .refine(totalsTogether, totalsTogetherRule)
  .refine(
    (call) =>
      call.nextModel === undefined || call.callCostMicroUsd === undefined,
    {
      message: "Only the final attempt has the call totals",
      path: ["callCostMicroUsd"],
    },
  )
  .describe(
    "One attempt failed. `nextModel` is the next model of the fallback chain; absent means that the call failed. The final attempt has the totals of all attempts of the call (`callInputTokens`, `callOutputTokens`, `callCostMicroUsd`).",
  );
export type CallFailedEventPayloadV1 = z.infer<typeof CallFailedEventPayloadV1>;
