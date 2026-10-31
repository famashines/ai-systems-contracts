import { z } from "zod";
import { Id } from "./common.ts";
import { TaskText } from "./orchestration.ts";

export const PostOwnerMessageCommandPayloadV1 = z.object({
  conversationId: Id,
  text: TaskText,
  taskId: Id.exactOptional(),
  newTask: z.boolean().default(false),
});
export type PostOwnerMessageCommandPayloadV1 = z.infer<
  typeof PostOwnerMessageCommandPayloadV1
>;

export const ConversationStartedEventPayloadV1 = z
  .object({ conversationId: Id })
  .describe("A new chat thread.");
export type ConversationStartedEventPayloadV1 = z.infer<
  typeof ConversationStartedEventPayloadV1
>;

const posted = { conversationId: Id, messageId: Id, text: TaskText };

export const OwnerMessagePostedEventPayloadV1 = z
  .discriminatedUnion("intent", [
    z.object({ ...posted, intent: z.literal("new_task") }),
    z.object({ ...posted, intent: z.literal(["steer", "answer"]), taskId: Id }),
  ])
  .describe(
    "The owner posted a message in a thread. `taskId` is present for `steer` and `answer`.",
  );
export type OwnerMessagePostedEventPayloadV1 = z.infer<
  typeof OwnerMessagePostedEventPayloadV1
>;

export const AgentReplyPostedEventPayloadV1 = z
  .object({
    conversationId: Id,
    messageId: Id,
    text: TaskText,
    taskId: Id,
    runId: Id.exactOptional(),
    sourceEventId: Id,
  })
  .describe(
    "An agent reply in a thread, made from the orchestration event `sourceEventId`.",
  );
export type AgentReplyPostedEventPayloadV1 = z.infer<
  typeof AgentReplyPostedEventPayloadV1
>;
