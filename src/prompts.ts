import { z } from "zod";
import { Id } from "./common.ts";

export const PromptName = z.string().min(1).max(200);

export const PromptText = z
  .string()
  .max(100000, { abort: true })
  .regex(/^(?=[^\0]*\S)[^\0]*$/);

export const PromptVariable = z
  .string()
  .max(64, { abort: true })
  .regex(/^[a-z][a-zA-Z0-9_]*$/);

export const PromptRef = z.object({ promptId: Id, version: z.int().min(1) });
export type PromptRef = z.infer<typeof PromptRef>;

export const CreatePromptCommandPayloadV1 = z.object({ name: PromptName });
export type CreatePromptCommandPayloadV1 = z.infer<
  typeof CreatePromptCommandPayloadV1
>;

export const PublishPromptVersionCommandPayloadV1 = z.object({
  promptId: Id,
  text: PromptText,
  variables: z.array(PromptVariable).max(50),
});
export type PublishPromptVersionCommandPayloadV1 = z.infer<
  typeof PublishPromptVersionCommandPayloadV1
>;

export const PromptCreatedEventPayloadV1 = z
  .object({ promptId: Id, name: PromptName })
  .describe("A new prompt.");
export type PromptCreatedEventPayloadV1 = z.infer<
  typeof PromptCreatedEventPayloadV1
>;

export const PromptVersionPublishedEventPayloadV1 =
  PublishPromptVersionCommandPayloadV1.extend({
    version: z.int().min(1),
  }).describe("A new immutable version of a prompt, with its variables.");
export type PromptVersionPublishedEventPayloadV1 = z.infer<
  typeof PromptVersionPublishedEventPayloadV1
>;
