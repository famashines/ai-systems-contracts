import { z } from "zod";
import { Id, MicroUsd, Timestamp } from "./common.ts";
import { ReplyText, TaskMode, TaskText } from "./orchestration.ts";

export const MessageIntent = z.enum(["new_task", "steer", "answer"]);
export type MessageIntent = z.infer<typeof MessageIntent>;

export const PostOwnerMessageCommandPayloadV1 = z
  .object({
    conversationId: Id,
    text: TaskText,
    taskId: Id.exactOptional(),
    newTask: z.boolean().default(false),
    mode: TaskMode.exactOptional(),
  })
  .refine((message) => !(message.newTask && message.taskId !== undefined), {
    message: "A new task has no taskId",
    path: ["taskId"],
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
    z.object({
      ...posted,
      intent: z.literal("new_task"),
      taskId: z.never().exactOptional(),
      mode: TaskMode.exactOptional(),
    }),
    z.object({ ...posted, intent: z.literal(["steer", "answer"]), taskId: Id }),
  ])
  .describe(
    "The owner posted a message in a thread. `taskId` is present for `steer` and `answer`, and absent for `new_task`. `mode` is the mode of a new task; absent means `approval`.",
  );
export type OwnerMessagePostedEventPayloadV1 = z.infer<
  typeof OwnerMessagePostedEventPayloadV1
>;

export const AgentReplyPostedEventPayloadV1 = z
  .object({
    conversationId: Id,
    messageId: Id,
    text: ReplyText,
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

const shown = {
  messageId: Id,
  text: ReplyText,
  createdAt: Timestamp,
  rev: z.int().nonnegative(),
  asOf: z.int().min(1),
};

export const ConversationMessageV1 = z.discriminatedUnion("role", [
  z.object({
    ...shown,
    role: z.literal("owner"),
    intent: MessageIntent,
    taskId: Id.exactOptional(),
  }),
  z.object({
    ...shown,
    role: z.literal("agent"),
    taskId: Id,
    costMicroUsd: MicroUsd.exactOptional(),
  }),
]);
export type ConversationMessageV1 = z.infer<typeof ConversationMessageV1>;

export const ConversationThreadResultV1 = z.object({
  items: z.array(ConversationMessageV1),
  headSeq: z.int().nonnegative(),
});
export type ConversationThreadResultV1 = z.infer<
  typeof ConversationThreadResultV1
>;
