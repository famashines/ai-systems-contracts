import { z } from "zod";
import {
  DurationMs,
  Id,
  MicroUsd,
  ModelId,
  Reason,
  Timestamp,
} from "./common.ts";
import { ErrorCode } from "./errors.ts";

export const TaskMode = z.enum(["auto", "approval"]);
export type TaskMode = z.infer<typeof TaskMode>;

export const TaskText = z
  .string()
  .max(20000, { abort: true })
  .regex(/^(?=[^\0]*\S)[^\0]*$/);

export const ReplyText = z
  .string()
  .max(100000, { abort: true })
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
  .refine(
    (task) =>
      (task.conversationId === undefined) === (task.messageId === undefined),
    {
      message: "conversationId and messageId come together",
      path: ["messageId"],
    },
  )
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
  "blocked",
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
    summary: ReplyText,
    costMicroUsd: MicroUsd.describe(
      "The cost of the attempt that gave the answer. The cost of the task is the sum of the llm.* costs.",
    ),
  })
  .describe(
    "The run ended with a result summary and the cost of the attempt that gave it.",
  );
export type RunCompletedEventPayloadV1 = z.infer<
  typeof RunCompletedEventPayloadV1
>;

export const RunFailedEventPayloadV1 = z
  .object({ taskId: Id, runId: Id, code: ErrorCode, reason: Reason })
  .describe("The run ended with no result, with a code and a plain reason.");
export type RunFailedEventPayloadV1 = z.infer<typeof RunFailedEventPayloadV1>;

export const RunBlockedEventPayloadV1 = z
  .object({
    taskId: Id,
    runId: Id,
    code: ErrorCode.extract(["budget_refused", "runaway_stopped"]),
    reason: Reason,
  })
  .describe(
    "The run cannot go on until the owner acts: the budget refused a call, or a runaway rule stopped it.",
  );
export type RunBlockedEventPayloadV1 = z.infer<typeof RunBlockedEventPayloadV1>;

export const CallMessage = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(100000),
});
export type CallMessage = z.infer<typeof CallMessage>;

export const CallRequestedEventPayloadV1 = z
  .object({
    taskId: Id,
    callId: Id,
    agentId: Id,
    agentVersion: z.int().min(1),
    messages: z
      .array(CallMessage)
      .min(1)
      .max(50)
      .refine(
        (messages) =>
          new TextEncoder().encode(JSON.stringify(messages)).length <= 900000,
        { message: "All messages together have at most 900000 bytes as JSON" },
      ),
    models: z
      .array(ModelId)
      .min(1)
      .max(5)
      .refine((models) => new Set(models).size === models.length, {
        message: "Each model comes once",
      }),
    maxTokens: z.int().min(1).max(16384),
    maxDurationMs: DurationMs,
    maxCostMicroUsd: MicroUsd.exactOptional(),
  })
  .describe(
    "A request to ai-proxy for one LLM call: the rendered messages (inputs as data blocks), the model chain, and limits. ai-proxy reserves and settles each attempt.",
  );
export type CallRequestedEventPayloadV1 = z.infer<
  typeof CallRequestedEventPayloadV1
>;

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
