import { z } from "zod";
import { Id, MicroUsd, ModelId } from "./common.ts";
import { PromptRef } from "./prompts.ts";

export const AgentName = z
  .string()
  .max(64, { abort: true })
  .regex(/^[a-z][a-z0-9-]*$/);

export const AgentRef = z.object({ agentId: Id, version: z.int().min(1) });
export type AgentRef = z.infer<typeof AgentRef>;

export const AgentLimits = z.object({
  maxCalls: z.int().min(1).max(1000),
  maxTokens: z.int().min(1).max(16384),
  maxCostMicroUsd: MicroUsd,
});
export type AgentLimits = z.infer<typeof AgentLimits>;

export const CreateAgentCommandPayloadV1 = z.object({ name: AgentName });
export type CreateAgentCommandPayloadV1 = z.infer<
  typeof CreateAgentCommandPayloadV1
>;

export const PublishAgentVersionCommandPayloadV1 = z.object({
  agentId: Id,
  prompt: PromptRef,
  models: z.array(ModelId).min(1).max(5),
  limits: AgentLimits,
});
export type PublishAgentVersionCommandPayloadV1 = z.infer<
  typeof PublishAgentVersionCommandPayloadV1
>;

export const ActivateAgentVersionCommandPayloadV1 = AgentRef;
export type ActivateAgentVersionCommandPayloadV1 = AgentRef;

export const SetAgentEnabledCommandPayloadV1 = z.object({
  agentId: Id,
  enabled: z.boolean(),
});
export type SetAgentEnabledCommandPayloadV1 = z.infer<
  typeof SetAgentEnabledCommandPayloadV1
>;

export const AgentCreatedEventPayloadV1 = z
  .object({ agentId: Id, name: AgentName })
  .describe("A new agent.");
export type AgentCreatedEventPayloadV1 = z.infer<
  typeof AgentCreatedEventPayloadV1
>;

export const AgentVersionPublishedEventPayloadV1 =
  PublishAgentVersionCommandPayloadV1.extend({
    version: z.int().min(1),
  }).describe(
    "A new immutable version of an agent: prompt version, models (default first, then the fallback chain), limits.",
  );
export type AgentVersionPublishedEventPayloadV1 = z.infer<
  typeof AgentVersionPublishedEventPayloadV1
>;

export const AgentVersionActivatedEventPayloadV1 = AgentRef.describe(
  "New runs use this version. A rollback is an activation of an older version.",
);
export type AgentVersionActivatedEventPayloadV1 = AgentRef;

const agent = z.object({ agentId: Id });

export const AgentEnabledEventPayloadV1 = agent.describe(
  "The agent is on. Plans can use it.",
);
export type AgentEnabledEventPayloadV1 = z.infer<
  typeof AgentEnabledEventPayloadV1
>;

export const AgentDisabledEventPayloadV1 = agent.describe(
  "The agent is off. No new plan uses it.",
);
export type AgentDisabledEventPayloadV1 = z.infer<
  typeof AgentDisabledEventPayloadV1
>;
