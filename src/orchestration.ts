import { z } from "zod";
import { Id, MicroUsd, Reason, Timestamp } from "./common.ts";
import { ErrorCode } from "./errors.ts";

export const TaskMode = z.enum(["auto", "approval"]);
export type TaskMode = z.infer<typeof TaskMode>;

export const TaskText = z
  .string()
  .max(20000, { abort: true })
  .regex(/^(?=[^\0]*\S)[^\0]*$/);

export const SubmitTaskCommandPayloadV1 = z.object({
  text: TaskText,
  mode: TaskMode.default("approval"),
});
export type SubmitTaskCommandPayloadV1 = z.infer<
  typeof SubmitTaskCommandPayloadV1
>;

export const TaskSubmittedEventPayloadV1 = z
  .object({
    taskId: Id,
    text: TaskText,
    mode: TaskMode,
    conversationId: Id.exactOptional(),
    messageId: Id.exactOptional(),
  })
  .describe(
    "The owner sent a task. `conversationId` and `messageId` are present when it comes from the chat.",
  );
export type TaskSubmittedEventPayloadV1 = z.infer<
  typeof TaskSubmittedEventPayloadV1
>;

export const TaskStatus = z.enum([
  "submitted",
  "clarifying",
  "planning",
  "awaiting_approval",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled",
  "rejected",
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskListItemV1 = z.object({
  taskId: Id,
  title: z.string().min(1).max(200),
  status: TaskStatus,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  rev: z.int().nonnegative(),
  asOf: z.int().min(1),
});
export type TaskListItemV1 = z.infer<typeof TaskListItemV1>;

export const TaskListResultV1 = z.object({
  items: z.array(TaskListItemV1),
  headSeq: z.int().nonnegative(),
});
export type TaskListResultV1 = z.infer<typeof TaskListResultV1>;

export const RunStartedEventPayloadV1 = z
  .object({ taskId: Id, runId: Id })
  .describe("Execution of the approved plan starts.");
export type RunStartedEventPayloadV1 = z.infer<typeof RunStartedEventPayloadV1>;

export const RunCompletedEventPayloadV1 = z
  .object({
    taskId: Id,
    runId: Id,
    summary: TaskText,
    costMicroUsd: MicroUsd,
  })
  .describe("The run ended with a result summary and its total cost.");
export type RunCompletedEventPayloadV1 = z.infer<
  typeof RunCompletedEventPayloadV1
>;

export const RunFailedEventPayloadV1 = z
  .object({ taskId: Id, runId: Id, code: ErrorCode, reason: Reason })
  .describe("The run ended with no result, with a code and a plain reason.");
export type RunFailedEventPayloadV1 = z.infer<typeof RunFailedEventPayloadV1>;

export const MessageRefusedEventPayloadV1 = z
  .object({
    taskId: Id,
    conversationId: Id,
    messageId: Id,
    intent: z.enum(["steer", "answer"]),
    reason: Reason,
  })
  .describe(
    "A `steer` or `answer` message for a task that cannot take it, with the reason.",
  );
export type MessageRefusedEventPayloadV1 = z.infer<
  typeof MessageRefusedEventPayloadV1
>;
