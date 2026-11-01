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
import { OutputText } from "./llm.ts";

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

const nonBlank = /^(?=[^\0]*\S)[^\0]*$/;
const jsonBytes = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).length;

export const SubtaskTitle = z
  .string()
  .max(200, { abort: true })
  .regex(nonBlank);

export const SubtaskInstructions = z
  .string()
  .max(4000, { abort: true })
  .regex(nonBlank);

export const ClarifyingQuestion = z
  .string()
  .max(1000, { abort: true })
  .regex(nonBlank);

export const PlanSubtask = z.object({
  subtaskId: Id,
  title: SubtaskTitle,
  instructions: SubtaskInstructions,
  agentId: Id,
  model: ModelId.exactOptional(),
  dependsOn: z
    .array(Id)
    .max(19)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Each dependency comes once",
    }),
  needsApproval: z.boolean(),
  estimatedCostMicroUsd: MicroUsd.exactOptional(),
  estimatedDurationMs: z.int().nonnegative().max(86400000).exactOptional(),
});
export type PlanSubtask = z.infer<typeof PlanSubtask>;

const hasCycle = (subtasks: PlanSubtask[]) => {
  const left = new Map(
    subtasks.map((subtask) => [subtask.subtaskId, subtask.dependsOn.length]),
  );
  const ready = subtasks.filter((subtask) => subtask.dependsOn.length === 0);
  let done = 0;
  for (const current of ready) {
    done += 1;
    for (const next of subtasks) {
      if (!next.dependsOn.includes(current.subtaskId)) continue;
      const count = (left.get(next.subtaskId) ?? 0) - 1;
      left.set(next.subtaskId, count);
      if (count === 0) ready.push(next);
    }
  }
  return done !== subtasks.length;
};

export const PlanSubtasks = z
  .array(PlanSubtask)
  .min(1)
  .max(20)
  .refine(
    (subtasks) =>
      new Set(subtasks.map((subtask) => subtask.subtaskId)).size ===
      subtasks.length,
    { message: "Each subtaskId comes once", abort: true },
  )
  .refine(
    (subtasks) => {
      const ids = new Set(subtasks.map((subtask) => subtask.subtaskId));
      return subtasks.every((subtask) =>
        subtask.dependsOn.every(
          (id) => id !== subtask.subtaskId && ids.has(id),
        ),
      );
    },
    { message: "A dependency is another subtask of the plan", abort: true },
  )
  .refine((subtasks) => !hasCycle(subtasks), {
    message: "The dependencies have no cycle",
    abort: true,
  })
  .refine((subtasks) => jsonBytes(subtasks) <= 200000, {
    message: "All subtasks together have at most 200000 bytes as JSON",
  });
export type PlanSubtasks = z.infer<typeof PlanSubtasks>;

const PlanVersion = z.int().min(1);
const TryNumber = z.int().min(1);

export const ClarificationRequestedEventPayloadV1 = z
  .object({
    taskId: Id,
    questions: z.array(ClarifyingQuestion).min(1).max(5),
  })
  .describe("The orchestrator needs answers before it plans.");
export type ClarificationRequestedEventPayloadV1 = z.infer<
  typeof ClarificationRequestedEventPayloadV1
>;

const ownerMessage = {
  taskId: Id,
  conversationId: Id,
  messageId: Id,
  text: TaskText,
};

export const ClarificationAnsweredEventPayloadV1 = z
  .object(ownerMessage)
  .describe(
    "The owner answered the clarifying questions with an `answer` message of the thread.",
  );
export type ClarificationAnsweredEventPayloadV1 = z.infer<
  typeof ClarificationAnsweredEventPayloadV1
>;

export const SteeringMessageAddedEventPayloadV1 = z
  .object(ownerMessage)
  .describe(
    "The owner sent a `steer` message for the task. Running subtasks get it at their next call.",
  );
export type SteeringMessageAddedEventPayloadV1 = z.infer<
  typeof SteeringMessageAddedEventPayloadV1
>;

const plan = { taskId: Id, planVersion: PlanVersion, subtasks: PlanSubtasks };

export const PlanProposedEventPayloadV1 = z
  .object(plan)
  .describe(
    "A plan with subtasks, dependencies (a DAG), agents, and cost and time estimates. `planVersion` goes up by 1 for each new plan of the task.",
  );
export type PlanProposedEventPayloadV1 = z.infer<
  typeof PlanProposedEventPayloadV1
>;

export const PlanEditedEventPayloadV1 = z
  .object(plan)
  .describe(
    "The owner changed the plan. It has the full new plan with the next `planVersion`.",
  );
export type PlanEditedEventPayloadV1 = z.infer<typeof PlanEditedEventPayloadV1>;

export const PlanApprovedEventPayloadV1 = z
  .object({ taskId: Id, planVersion: PlanVersion })
  .describe(
    "The plan of this version is approved: by the owner, or by the system in auto mode.",
  );
export type PlanApprovedEventPayloadV1 = z.infer<
  typeof PlanApprovedEventPayloadV1
>;

export const PlanRejectedEventPayloadV1 = z
  .object({ taskId: Id, planVersion: PlanVersion, reason: Reason })
  .describe("The owner rejected the plan with a reason. The task ends.");
export type PlanRejectedEventPayloadV1 = z.infer<
  typeof PlanRejectedEventPayloadV1
>;

const subtask = { taskId: Id, runId: Id, subtaskId: Id };

export const SubtaskQueuedEventPayloadV1 = z
  .object(subtask)
  .describe(
    "The subtask can start: its dependencies are done, or the owner retried it.",
  );
export type SubtaskQueuedEventPayloadV1 = z.infer<
  typeof SubtaskQueuedEventPayloadV1
>;

export const SubtaskWaitingEventPayloadV1 = z
  .object(subtask)
  .describe(
    "The subtask waits for its dependencies. A wait for the owner is `CheckpointOpened`.",
  );
export type SubtaskWaitingEventPayloadV1 = z.infer<
  typeof SubtaskWaitingEventPayloadV1
>;

export const SubtaskStartedEventPayloadV1 = z
  .object({
    ...subtask,
    tryNumber: TryNumber,
    callId: Id,
    agentId: Id,
    agentVersion: z.int().min(1),
  })
  .describe(
    "One try of the subtask starts with the LLM call `callId`. Its deltas come on `delta.<taskId>.<callId>`.",
  );
export type SubtaskStartedEventPayloadV1 = z.infer<
  typeof SubtaskStartedEventPayloadV1
>;

const Tokens = z.int().nonnegative();

export const SubtaskCompletedEventPayloadV1 = z
  .object({
    ...subtask,
    callId: Id,
    inputTokens: Tokens,
    outputTokens: Tokens,
    costMicroUsd: MicroUsd,
  })
  .describe(
    "The subtask is done. Its output is the text of `llm.CallCompleted` of `callId`. Tokens and cost are the totals of all its calls in this run.",
  );
export type SubtaskCompletedEventPayloadV1 = z.infer<
  typeof SubtaskCompletedEventPayloadV1
>;

export const SubtaskFailedEventPayloadV1 = z
  .object({ ...subtask, tryNumber: TryNumber, code: ErrorCode, reason: Reason })
  .describe(
    "One try of the subtask failed, with a code and a plain reason. `SubtaskRetrying` follows when a retry is left.",
  );
export type SubtaskFailedEventPayloadV1 = z.infer<
  typeof SubtaskFailedEventPayloadV1
>;

export const SubtaskRetryingEventPayloadV1 = z
  .object({ ...subtask, tryNumber: TryNumber, retryAt: Timestamp })
  .describe("The subtask starts try `tryNumber` at `retryAt` (backoff).");
export type SubtaskRetryingEventPayloadV1 = z.infer<
  typeof SubtaskRetryingEventPayloadV1
>;

export const SubtaskBlockedEventPayloadV1 = z
  .object({
    ...subtask,
    code: ErrorCode.extract(["budget_refused", "runaway_stopped", "forbidden"]),
    reason: Reason,
  })
  .describe(
    "The subtask cannot go on until the owner acts: the budget refused a call, a runaway rule stopped it, or a permission is missing.",
  );
export type SubtaskBlockedEventPayloadV1 = z.infer<
  typeof SubtaskBlockedEventPayloadV1
>;

export const SubtaskReassignedEventPayloadV1 = z
  .object({ ...subtask, agentId: Id, model: ModelId.exactOptional() })
  .describe(
    "The owner gave a subtask that is not running a different agent or model. No `model` means the model chain of the agent.",
  );
export type SubtaskReassignedEventPayloadV1 = z.infer<
  typeof SubtaskReassignedEventPayloadV1
>;

export const CheckpointOpenedEventPayloadV1 = z
  .object({ ...subtask, checkpointId: Id, reason: Reason })
  .describe(
    "The run waits for the owner to approve the start of a subtask. `reason` says why.",
  );
export type CheckpointOpenedEventPayloadV1 = z.infer<
  typeof CheckpointOpenedEventPayloadV1
>;

export const CheckpointDecision = z.enum(["approved", "refused"]);
export type CheckpointDecision = z.infer<typeof CheckpointDecision>;

export const CheckpointResolvedEventPayloadV1 = z
  .object({
    taskId: Id,
    runId: Id,
    checkpointId: Id,
    decision: CheckpointDecision,
    comment: Reason.exactOptional(),
  })
  .describe(
    "The owner approved or refused a checkpoint, with an optional comment.",
  );
export type CheckpointResolvedEventPayloadV1 = z.infer<
  typeof CheckpointResolvedEventPayloadV1
>;

const run = { taskId: Id, runId: Id };

export const RunPausedEventPayloadV1 = z
  .object(run)
  .describe(
    "The owner paused the run. No new call starts. Running calls finish.",
  );
export type RunPausedEventPayloadV1 = z.infer<typeof RunPausedEventPayloadV1>;

export const RunResumedEventPayloadV1 = z
  .object(run)
  .describe("The owner resumed the run.");
export type RunResumedEventPayloadV1 = z.infer<typeof RunResumedEventPayloadV1>;

export const RunCancelledEventPayloadV1 = z
  .object({ ...run, reason: Reason.exactOptional() })
  .describe(
    "The owner cancelled the run. Running calls stop and the task ends as `cancelled`.",
  );
export type RunCancelledEventPayloadV1 = z.infer<
  typeof RunCancelledEventPayloadV1
>;

export const TaskModeChangedEventPayloadV1 = z
  .object({ taskId: Id, mode: TaskMode })
  .describe("The owner changed the mode of the task: `auto` or `approval`.");
export type TaskModeChangedEventPayloadV1 = z.infer<
  typeof TaskModeChangedEventPayloadV1
>;

const planCommand = { taskId: Id, planVersion: PlanVersion };

export const ApprovePlanCommandPayloadV1 = z.object(planCommand);
export type ApprovePlanCommandPayloadV1 = z.infer<
  typeof ApprovePlanCommandPayloadV1
>;

export const EditPlanCommandPayloadV1 = z.object({
  ...planCommand,
  subtasks: PlanSubtasks,
});
export type EditPlanCommandPayloadV1 = z.infer<typeof EditPlanCommandPayloadV1>;

export const RejectPlanCommandPayloadV1 = z.object({
  ...planCommand,
  reason: Reason,
});
export type RejectPlanCommandPayloadV1 = z.infer<
  typeof RejectPlanCommandPayloadV1
>;

const taskCommand = z.object({ taskId: Id });

export const PauseRunCommandPayloadV1 = taskCommand;
export type PauseRunCommandPayloadV1 = z.infer<typeof PauseRunCommandPayloadV1>;

export const ResumeRunCommandPayloadV1 = taskCommand;
export type ResumeRunCommandPayloadV1 = z.infer<
  typeof ResumeRunCommandPayloadV1
>;

export const CancelRunCommandPayloadV1 = taskCommand.extend({
  reason: Reason.exactOptional(),
});
export type CancelRunCommandPayloadV1 = z.infer<
  typeof CancelRunCommandPayloadV1
>;

export const RetrySubtaskCommandPayloadV1 = taskCommand.extend({
  subtaskId: Id,
});
export type RetrySubtaskCommandPayloadV1 = z.infer<
  typeof RetrySubtaskCommandPayloadV1
>;

export const ReassignSubtaskCommandPayloadV1 = taskCommand.extend({
  subtaskId: Id,
  agentId: Id,
  model: ModelId.exactOptional(),
});
export type ReassignSubtaskCommandPayloadV1 = z.infer<
  typeof ReassignSubtaskCommandPayloadV1
>;

export const SetTaskModeCommandPayloadV1 = taskCommand.extend({
  mode: TaskMode,
});
export type SetTaskModeCommandPayloadV1 = z.infer<
  typeof SetTaskModeCommandPayloadV1
>;

export const ResolveCheckpointCommandPayloadV1 = taskCommand.extend({
  checkpointId: Id,
  decision: CheckpointDecision,
  comment: Reason.exactOptional(),
});
export type ResolveCheckpointCommandPayloadV1 = z.infer<
  typeof ResolveCheckpointCommandPayloadV1
>;

export const SubtaskStatus = z.enum([
  "queued",
  "waiting",
  "running",
  "retrying",
  "blocked",
  "failed",
  "done",
]);
export type SubtaskStatus = z.infer<typeof SubtaskStatus>;

export const SubtaskStateV1 = z.object({
  subtaskId: Id,
  status: SubtaskStatus,
  tries: z.int().nonnegative(),
  callId: Id.exactOptional(),
  startedAt: Timestamp.exactOptional(),
  endedAt: Timestamp.exactOptional(),
  retryAt: Timestamp.exactOptional(),
  inputTokens: Tokens,
  outputTokens: Tokens,
  costMicroUsd: MicroUsd,
  reason: Reason.exactOptional(),
});
export type SubtaskStateV1 = z.infer<typeof SubtaskStateV1>;

export const CheckpointV1 = z.object({
  checkpointId: Id,
  subtaskId: Id,
  reason: Reason,
  status: z.enum(["open", ...CheckpointDecision.options]),
  comment: Reason.exactOptional(),
  openedAt: Timestamp,
  resolvedAt: Timestamp.exactOptional(),
});
export type CheckpointV1 = z.infer<typeof CheckpointV1>;

export const TaskDetailV1 = z.object({
  taskId: Id,
  title: z.string().min(1).max(200),
  status: TaskStatus,
  mode: TaskMode,
  conversationId: Id.exactOptional(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  plan: z
    .object({ planVersion: PlanVersion, subtasks: PlanSubtasks })
    .exactOptional(),
  runId: Id.exactOptional(),
  subtasks: z.array(SubtaskStateV1).max(20),
  checkpoints: z.array(CheckpointV1).max(20),
  costMicroUsd: MicroUsd,
  reason: Reason.exactOptional(),
  rev: z.int().nonnegative(),
  asOf: z.int().min(1),
});
export type TaskDetailV1 = z.infer<typeof TaskDetailV1>;

export const TaskOutputV1 = z.object({
  taskId: Id,
  runId: Id,
  subtaskId: Id.exactOptional(),
  text: OutputText,
});
export type TaskOutputV1 = z.infer<typeof TaskOutputV1>;
