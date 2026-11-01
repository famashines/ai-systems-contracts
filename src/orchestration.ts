import { z } from "zod";
import {
  DurationMs,
  Id,
  MicroUsd,
  ModelId,
  Reason,
  Timestamp,
} from "./common.ts";
import { CapMicroUsd } from "./budget.ts";
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
    code: ErrorCode.extract([
      "budget_refused",
      "runaway_stopped",
      "forbidden",
      "subtask_failed",
    ]),
    reason: Reason,
  })
  .describe(
    "The run cannot go on until the owner acts: the budget refused a call, a runaway rule stopped it, a permission is missing, or a subtask failed.",
  );
export type RunBlockedEventPayloadV1 = z.infer<typeof RunBlockedEventPayloadV1>;

export const CallMessage = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(100000),
});
export type CallMessage = z.infer<typeof CallMessage>;

export const CallKind = z.enum(["plan", "aggregate", "check", "subtask"]);
export type CallKind = z.infer<typeof CallKind>;

const subtaskOfKind = (call: { kind?: CallKind; subtaskId?: string }) =>
  (call.kind === "subtask") === (call.subtaskId !== undefined);
const subtaskOfKindRule = {
  message: "subtaskId is present only for the kind subtask",
  path: ["subtaskId"],
};

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
    kind: CallKind.exactOptional(),
    subtaskId: Id.exactOptional(),
  })
  .refine(subtaskOfKind, subtaskOfKindRule)
  .describe(
    "A request to ai-proxy for one LLM call: the rendered messages (inputs as data blocks), the model chain, and limits. ai-proxy reserves and settles each attempt. `kind` says what the call is for; `subtaskId` is present for the kind `subtask`. M2 calls have no `kind`.",
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
      abort: true,
    }),
  needsApproval: z.boolean(),
  estimatedCostMicroUsd: CapMicroUsd.exactOptional(),
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
const Tokens = z.int().nonnegative();
const usage = {
  inputTokens: Tokens,
  outputTokens: Tokens,
  costMicroUsd: CapMicroUsd,
};

export const ClarificationRequestedEventPayloadV1 = z
  .object({
    taskId: Id,
    questions: z.array(ClarifyingQuestion).min(1).max(5),
  })
  .describe(
    "The orchestrator needs answers before it plans. Only a task with a `conversationId` asks questions.",
  );
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
  .object({ ...ownerMessage, runId: Id })
  .describe(
    "The owner sent a `steer` message during the run. Only subtasks that have not started get it. M3 has no re-plan.",
  );
export type SteeringMessageAddedEventPayloadV1 = z.infer<
  typeof SteeringMessageAddedEventPayloadV1
>;

const plan = { taskId: Id, planVersion: PlanVersion, subtasks: PlanSubtasks };

export const PlanProposedEventPayloadV1 = z
  .object({ ...plan, awaitsApproval: z.boolean() })
  .describe(
    "A plan with subtasks, dependencies (a DAG), agents, and cost and time estimates. `planVersion` goes up by 1 for each new plan of the task. `awaitsApproval` is false in auto mode, where `PlanApproved` follows.",
  );
export type PlanProposedEventPayloadV1 = z.infer<
  typeof PlanProposedEventPayloadV1
>;

export const PlanEditedEventPayloadV1 = z
  .object(plan)
  .describe(
    "The owner changed the plan. It has the full new plan with the next `planVersion`, and the estimates of orchestration.",
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
    "The subtask can start: its dependencies are done, or the owner retried it. A retry starts the count of tries again.",
  );
export type SubtaskQueuedEventPayloadV1 = z.infer<
  typeof SubtaskQueuedEventPayloadV1
>;

export const SubtaskWaitingEventPayloadV1 = z
  .object(subtask)
  .describe(
    "The subtask waits for its dependencies. It is not a wait for the owner: that is `CheckpointOpened`.",
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

export const SubtaskCompletedEventPayloadV1 = z
  .object({ ...subtask, callId: Id, text: OutputText, ...usage })
  .describe(
    "The subtask is done with the output `text` of the call `callId`. Tokens and cost are the values of that call.",
  );
export type SubtaskCompletedEventPayloadV1 = z.infer<
  typeof SubtaskCompletedEventPayloadV1
>;

export const SubtaskFailedEventPayloadV1 = z
  .object({
    ...subtask,
    tryNumber: TryNumber,
    code: ErrorCode,
    reason: Reason,
    ...usage,
  })
  .describe(
    "One try of the subtask failed, with a code, a plain reason, and the tokens and cost of the try. `SubtaskRetrying` follows when a try is left, else `RunBlocked` with the code `subtask_failed`.",
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
    "The subtask cannot go on until the owner acts: the budget refused a call, a runaway rule stopped it, or a permission is missing. `RunBlocked` with the same code follows.",
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
  .object({
    ...subtask,
    checkpointId: Id,
    reason: Reason,
    deadline: Timestamp.exactOptional(),
  })
  .describe(
    "The run waits for the owner to approve the start of a subtask. Orchestration writes the `reason`: Approval needed for <subtask title>. After `deadline` the checkpoint expires.",
  );
export type CheckpointOpenedEventPayloadV1 = z.infer<
  typeof CheckpointOpenedEventPayloadV1
>;

export const CheckpointDecision = z.enum(["approved", "refused"]);
export type CheckpointDecision = z.infer<typeof CheckpointDecision>;

export const CheckpointOutcome = z.enum([
  ...CheckpointDecision.options,
  "expired",
]);
export type CheckpointOutcome = z.infer<typeof CheckpointOutcome>;

export const CheckpointResolvedEventPayloadV1 = z
  .object({
    taskId: Id,
    runId: Id,
    checkpointId: Id,
    decision: CheckpointOutcome,
    comment: Reason.exactOptional(),
  })
  .describe(
    "The owner approved or refused a checkpoint, with an optional comment, or the system closed it at its deadline (`expired`). A refused or expired checkpoint fails its subtask, and the run goes blocked.",
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
  .describe("The run goes on after a pause or a block.");
export type RunResumedEventPayloadV1 = z.infer<typeof RunResumedEventPayloadV1>;

export const RunCancelledEventPayloadV1 = z
  .object({ ...run, reason: Reason.exactOptional() })
  .describe(
    "The owner cancelled the run. `CallCancelRequested` stops the running calls, and the task ends as `cancelled`.",
  );
export type RunCancelledEventPayloadV1 = z.infer<
  typeof RunCancelledEventPayloadV1
>;

export const TaskCancelledEventPayloadV1 = z
  .object({ taskId: Id, reason: Reason.exactOptional() })
  .describe(
    "The owner cancelled a task that has no run (status `submitted`, `clarifying` or `planning`). `CallCancelRequested` stops the running orchestrator call, and the task ends as `cancelled`.",
  );
export type TaskCancelledEventPayloadV1 = z.infer<
  typeof TaskCancelledEventPayloadV1
>;

export const TaskModeChangedEventPayloadV1 = z
  .object({ taskId: Id, mode: TaskMode })
  .describe("The owner changed the mode of the task: `auto` or `approval`.");
export type TaskModeChangedEventPayloadV1 = z.infer<
  typeof TaskModeChangedEventPayloadV1
>;

export const CallSettledEventPayloadV1 = z
  .object({
    taskId: Id,
    callId: Id,
    kind: CallKind,
    subtaskId: Id.exactOptional(),
    ...usage,
    text: OutputText.exactOptional(),
  })
  .refine(subtaskOfKind, subtaskOfKindRule)
  .describe(
    "A call of the task has its final outcome: completed, failed or cancelled. Tokens and cost are the totals of all its attempts, and `text` is its output when it gave one. The cost of the task is the sum of these costs.",
  );
export type CallSettledEventPayloadV1 = z.infer<
  typeof CallSettledEventPayloadV1
>;

export const CallCancelRequestedEventPayloadV1 = z
  .object({ taskId: Id, callId: Id })
  .describe(
    "Orchestration asks ai-proxy to stop a call. ai-proxy ends it with `llm.CallFailed` and the class `cancelled`. A `CallRequested` for the same `callId` that comes later gets the same answer, with no reserve.",
  );
export type CallCancelRequestedEventPayloadV1 = z.infer<
  typeof CallCancelRequestedEventPayloadV1
>;

const planCommand = { taskId: Id, planVersion: PlanVersion };

export const ApprovePlanCommandPayloadV1 = z.object(planCommand);
export type ApprovePlanCommandPayloadV1 = z.infer<
  typeof ApprovePlanCommandPayloadV1
>;

export const EditPlanCommandPayloadV1 = z
  .object({ ...planCommand, subtasks: PlanSubtasks })
  .describe(
    "Orchestration makes its own estimates and ignores the estimates in this command.",
  );
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

export const CancelTaskCommandPayloadV1 = CancelRunCommandPayloadV1;
export type CancelTaskCommandPayloadV1 = CancelRunCommandPayloadV1;

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
  "waiting",
  "queued",
  "awaiting_approval",
  "running",
  "retrying",
  "blocked",
  "failed",
  "done",
  "cancelled",
  "skipped",
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
  ...usage,
  reason: Reason.exactOptional(),
});
export type SubtaskStateV1 = z.infer<typeof SubtaskStateV1>;

export const CheckpointV1 = z.object({
  checkpointId: Id,
  subtaskId: Id,
  reason: Reason,
  status: z.enum(["open", ...CheckpointOutcome.options]),
  comment: Reason.exactOptional(),
  openedAt: Timestamp,
  deadline: Timestamp.exactOptional(),
  resolvedAt: Timestamp.exactOptional(),
});
export type CheckpointV1 = z.infer<typeof CheckpointV1>;

export const CallRef = z.object({
  callId: Id,
  kind: CallKind.exclude(["subtask"]),
});
export type CallRef = z.infer<typeof CallRef>;

export const TaskDetailV1 = z.object({
  taskId: Id,
  title: z.string().min(1).max(200),
  status: TaskStatus,
  mode: TaskMode,
  conversationId: Id.exactOptional(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  plan: z
    .object({
      planVersion: PlanVersion,
      subtasks: z.array(PlanSubtask).max(20),
    })
    .exactOptional(),
  runId: Id.exactOptional(),
  currentCall: CallRef.nullable(),
  subtasks: z.array(SubtaskStateV1).max(20),
  checkpoints: z
    .array(CheckpointV1)
    .max(20)
    .refine(
      (checkpoints) =>
        new Set(checkpoints.map((checkpoint) => checkpoint.subtaskId)).size ===
        checkpoints.length,
      { message: "Only the latest checkpoint of each subtask" },
    ),
  costMicroUsd: CapMicroUsd,
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
