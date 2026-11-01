import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import {
  DeviceLocale,
  CallRef,
  CheckpointOutcome,
  CancelTaskCommandPayloadV1,
  CallCancelRequestedEventPayloadV1,
  CallSettledEventPayloadV1,
  CallKind,
  TaskCancelledEventPayloadV1,
  ApprovePlanCommandPayloadV1,
  CancelRunCommandPayloadV1,
  CheckpointOpenedEventPayloadV1,
  CheckpointResolvedEventPayloadV1,
  CheckpointV1,
  ClarificationAnsweredEventPayloadV1,
  ClarificationRequestedEventPayloadV1,
  ClarifyingQuestion,
  DevicePlatform,
  EditPlanCommandPayloadV1,
  PauseRunCommandPayloadV1,
  PlanApprovedEventPayloadV1,
  PlanEditedEventPayloadV1,
  PlanProposedEventPayloadV1,
  PlanRejectedEventPayloadV1,
  PlanSubtask,
  PlanSubtasks,
  PushDataV1,
  PushKind,
  PushToken,
  ReassignSubtaskCommandPayloadV1,
  RegisterDeviceCommandPayloadV1,
  RejectPlanCommandPayloadV1,
  ResolveCheckpointCommandPayloadV1,
  ResumeRunCommandPayloadV1,
  RetrySubtaskCommandPayloadV1,
  RunCancelledEventPayloadV1,
  RunPausedEventPayloadV1,
  RunResumedEventPayloadV1,
  SetTaskModeCommandPayloadV1,
  SteeringMessageAddedEventPayloadV1,
  SubtaskBlockedEventPayloadV1,
  SubtaskCompletedEventPayloadV1,
  SubtaskFailedEventPayloadV1,
  SubtaskInstructions,
  SubtaskQueuedEventPayloadV1,
  SubtaskReassignedEventPayloadV1,
  SubtaskRetryingEventPayloadV1,
  SubtaskStartedEventPayloadV1,
  SubtaskStateV1,
  SubtaskStatus,
  SubtaskTitle,
  SubtaskWaitingEventPayloadV1,
  TaskDetailV1,
  TaskModeChangedEventPayloadV1,
  TaskOutputV1,
  UnregisterDeviceCommandPayloadV1,
  ActiveAgentVersionResultV1,
  AgentListItemV1,
  AgentListResultV1,
  BudgetMonthV1,
  CallRequestedEventPayloadV1,
  CapScope,
  ConversationMessageV1,
  ConversationThreadResultV1,
  NoticeDataV1,
  RunBlockedEventPayloadV1,
  SettleReservationReplyV1,
  ActivateAgentVersionCommandPayloadV1,
  Actor,
  AgentCreatedEventPayloadV1,
  AgentDisabledEventPayloadV1,
  AgentLimits,
  AgentName,
  AgentReplyPostedEventPayloadV1,
  AgentVersionPublishedEventPayloadV1,
  BudgetMonth,
  BudgetScope,
  BudgetSetEventPayloadV1,
  CallCompletedEventPayloadV1,
  CallFailedEventPayloadV1,
  CallStartedEventPayloadV1,
  ConversationStartedEventPayloadV1,
  CreateAgentCommandPayloadV1,
  CreatePromptCommandPayloadV1,
  DeltaV1,
  deltaSubject,
  FundsReservedEventPayloadV1,
  MessageRefusedEventPayloadV1,
  ModelId,
  OutputText,
  OwnerMessagePostedEventPayloadV1,
  PostOwnerMessageCommandPayloadV1,
  PromptCreatedEventPayloadV1,
  PromptText,
  PromptVariable,
  PromptVersionPublishedEventPayloadV1,
  PromptVersionResultV1,
  PublishAgentVersionCommandPayloadV1,
  PublishPromptVersionCommandPayloadV1,
  Reason,
  ReplyText,
  ReservationExpiredEventPayloadV1,
  ReservationRefusedEventPayloadV1,
  ReservationSettledEventPayloadV1,
  ReserveFundsReplyV1,
  ReserveFundsRequestV1,
  RpcSubject,
  RunCompletedEventPayloadV1,
  RunFailedEventPayloadV1,
  RunStartedEventPayloadV1,
  SetAgentEnabledCommandPayloadV1,
  SetBudgetCommandPayloadV1,
  SettleReservationRequestV1,
  ThresholdCrossedEventPayloadV1,
  MessageType,
  TaskText,
  ClientMessageV1,
  CommandEnvelopeV1,
  ErrorCode,
  EventEnvelopeV1,
  Id,
  MicroUsd,
  ProblemJson,
  RegisteredEvent,
  ServerMessageV1,
  StreamId,
  SubmitTaskCommandPayloadV1,
  TaskListItemV1,
  TaskListResultV1,
  TaskStatus,
  TaskSubmittedEventPayloadV1,
  Timestamp,
  Topic,
  topicFromSubject,
  ViewMessageV1,
  ViewNoticeV1,
  viewSubject,
  ViewSubject,
  WsCloseCode,
  WsLimits,
} from "../src/index.ts";

const id = "0b9d3c4e-6f1a-4c2b-9d8e-7a6b5c4d3e2f";
const upperId = id.toUpperCase();
const now = "2026-10-31T09:15:00.000Z";
const actor = { kind: "owner", id: "owner-1" };
const item = {
  taskId: id,
  title: "Plan",
  status: "submitted",
  createdAt: now,
  updatedAt: now,
  rev: 1,
  asOf: 1,
};
const event = {
  eventId: id,
  type: "orchestration.TaskSubmitted",
  schemaVersion: 1,
  streamId: `task-${id}`,
  version: 1,
  occurredAt: now,
  correlationId: id,
  causationId: id,
  actor,
  payload: { taskId: id, text: "Write a plan", mode: "auto" },
};
const command = {
  commandId: id,
  type: "orchestration.SubmitTask",
  actor,
  payload: { text: "Hi" },
};
const notice = {
  type: "notice",
  seq: 6,
  topic: "tasks",
  docId: id,
  rev: 2,
  data: item,
};
const view = {
  topic: "tasks",
  docId: id,
  rev: 1,
  data: item,
  commandId: id,
};
const viewMessage = {
  ...event,
  type: "view.tasks",
  streamId: `tasks-${id}`,
  actor: { kind: "system", id: "projections" },
  payload: view,
};
const without = (value: object, key: string): unknown =>
  Object.fromEntries(Object.entries(value).filter(([name]) => name !== key));
const id2 = "5c1e8a7b-2d3f-4e6a-8b9c-0d1e2f3a4b5c";
const badMoney = [-1, 1.5, "1", null, Number.MAX_SAFE_INTEGER + 1];
const month = { kind: "month", key: "2026-10" };
const everyMonth = { kind: "month" };
const owned = { conversationId: id, messageId: id2, text: "Hi" };
const refused = {
  taskId: id,
  conversationId: id,
  messageId: id2,
  intent: "steer",
  reason: "The task has ended.",
};
const reply = {
  conversationId: id,
  messageId: id2,
  text: "Here is the plan.",
  taskId: id,
  runId: id,
  sourceEventId: id2,
};
const promptVersion = {
  promptId: id,
  text: "You are {{role}}.",
  variables: ["role", "taskText"],
  version: 1,
};
const limits = { maxCalls: 10, maxTokens: 4096, maxCostMicroUsd: 50_000 };
const agentVersion = {
  agentId: id,
  prompt: { promptId: id2, version: 1 },
  models: ["openai/gpt-4o-mini", "meta-llama/llama-3.1-8b-instruct:free"],
  limits,
  version: 2,
};
const started = {
  taskId: id2,
  callId: id,
  attempt: 1,
  model: "openai/gpt-4o-mini",
  agentId: id2,
  agentVersion: 1,
  reservationId: id2,
};
const completed = {
  taskId: id2,
  callId: id,
  attempt: 1,
  model: "openai/gpt-4o-mini",
  text: "Hello",
  finishReason: "stop",
  inputTokens: 120,
  outputTokens: 40,
  cachedTokens: 0,
  costMicroUsd: 140,
  latencyMs: 900,
  bodyId: id2,
};
const failed = {
  taskId: id2,
  callId: id,
  attempt: 1,
  model: "openai/gpt-4o-mini",
  errorClass: "rate_limit",
  reason: "Rate limit exceeded",
  costMicroUsd: 0,
  nextModel: "anthropic/claude-haiku-4.5",
};
const reserve = {
  reservationId: id,
  taskId: id2,
  agentId: id2,
  amountMicroUsd: 25_000,
};
const reserved = {
  reservationId: id,
  taskId: id2,
  agentId: id2,
  scopes: [month, { kind: "task", key: id2 }],
  amountMicroUsd: 25_000,
  expiresAt: now,
};
const refusal = {
  reservationId: id,
  taskId: id2,
  agentId: id2,
  scope: month,
  amountMicroUsd: 25_000,
  reason: "Monthly cap reached: 19.80 of 20.00 USD",
};
const threshold = {
  scope: month,
  cap: "hard",
  percent: 80,
  spentMicroUsd: 16_000_000,
  capMicroUsd: 20_000_000,
};
const errorCodes = [
  "validation_failed",
  "not_found",
  "conflict",
  "unauthorized",
  "forbidden",
  "rate_limited",
  "internal",
  "unavailable",
  "budget_refused",
  "method_not_allowed",
  "payload_too_large",
  "unsupported_media_type",
  "runaway_stopped",
  "empty_output",
  "subtask_failed",
];
const requested = {
  taskId: id,
  callId: id2,
  agentId: id2,
  agentVersion: 1,
  messages: [
    { role: "system", content: "You are the writer." },
    { role: "user", content: '<data source="owner">Hi</data>' },
  ],
  models: ["openai/gpt-4o-mini", "anthropic/claude-haiku-4.5"],
  maxTokens: 1024,
  maxDurationMs: 600000,
};
const shown = { messageId: id, text: "Hi", createdAt: now, rev: 1, asOf: 2 };
const agentItem = {
  agentId: id,
  name: "writer",
  enabled: true,
  activeVersion: 1,
  latestVersion: 2,
  rev: 3,
  asOf: 4,
};
const budgetMonth = {
  month: "2026-10",
  capMicroUsd: 20_000_000,
  spentMicroUsd: 1_500_000,
  reservedMicroUsd: 25_000,
  remainingMicroUsd: 18_475_000,
  overCapMicroUsd: 0,
  rev: 9,
  asOf: 12,
};

const id3 = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const subtaskA = {
  subtaskId: id,
  title: "Find sources",
  instructions: "Find three sources on X.",
  agentId: id3,
  dependsOn: [],
  needsApproval: false,
  estimatedCostMicroUsd: 20_000,
  estimatedDurationMs: 60_000,
};
const subtaskB = {
  subtaskId: id2,
  title: "Write the brief",
  instructions: "Write one page from the sources.",
  agentId: id3,
  model: "openai/gpt-4o-mini",
  dependsOn: [id],
  needsApproval: true,
};
const subtaskC = {
  subtaskId: id3,
  title: "Review",
  instructions: "Check the brief.",
  agentId: id,
  dependsOn: [id, id2],
  needsApproval: false,
};
const plan = [subtaskA, subtaskB, subtaskC];
const planned = { taskId: id, planVersion: 1, subtasks: plan };
const proposed = { ...planned, awaitsApproval: true };
const cap = 1_000_000_000_000;
const badCap = [...badMoney, cap + 1];
const answered = {
  taskId: id,
  conversationId: id2,
  messageId: id3,
  text: "Yes",
};
const onSubtask = { taskId: id, runId: id2, subtaskId: id3 };
const subtaskState = {
  subtaskId: id,
  status: "running",
  tries: 1,
  callId: id2,
  startedAt: now,
  inputTokens: 0,
  outputTokens: 0,
  costMicroUsd: 0,
};
const checkpoint = {
  checkpointId: id3,
  subtaskId: id2,
  reason: "The plan marks this subtask for approval.",
  status: "open",
  openedAt: now,
};
const detail = {
  taskId: id,
  title: "Brief on X",
  status: "running",
  mode: "approval",
  conversationId: id2,
  createdAt: now,
  updatedAt: now,
  plan: { planVersion: 2, subtasks: plan },
  runId: id2,
  subtasks: [subtaskState],
  checkpoints: [checkpoint],
  currentCall: { callId: id2, kind: "subtask", subtaskId: id },
  costMicroUsd: 1200,
  rev: 3,
  asOf: 7,
};
const m3Events: [string, unknown][] = [
  [
    "orchestration.ClarificationRequested",
    { taskId: id, questions: ["Which X?", "How long?"] },
  ],
  ["orchestration.ClarificationAnswered", answered],
  [
    "orchestration.SteeringMessageAdded",
    { ...answered, runId: id2, text: "Shorter" },
  ],
  ["orchestration.PlanProposed", proposed],
  ["orchestration.PlanEdited", { ...planned, planVersion: 2 }],
  ["orchestration.PlanApproved", { taskId: id, planVersion: 2 }],
  [
    "orchestration.PlanRejected",
    { taskId: id, planVersion: 1, reason: "Too expensive" },
  ],
  ["orchestration.SubtaskQueued", onSubtask],
  ["orchestration.SubtaskWaiting", onSubtask],
  [
    "orchestration.SubtaskStarted",
    { ...onSubtask, tryNumber: 1, callId: id, agentId: id, agentVersion: 2 },
  ],
  [
    "orchestration.SubtaskCompleted",
    {
      ...onSubtask,
      callId: id,
      text: "Three sources.",
      inputTokens: 120,
      outputTokens: 40,
      costMicroUsd: 140,
    },
  ],
  [
    "orchestration.SubtaskFailed",
    {
      ...onSubtask,
      tryNumber: 1,
      code: "unavailable",
      reason: "The model call failed.",
      inputTokens: 120,
      outputTokens: 0,
      costMicroUsd: 30,
    },
  ],
  [
    "orchestration.SubtaskRetrying",
    { ...onSubtask, tryNumber: 2, retryAt: now },
  ],
  [
    "orchestration.SubtaskBlocked",
    {
      ...onSubtask,
      code: "budget_refused",
      reason: "Monthly cap reached: 19.80 of 20.00 USD",
    },
  ],
  [
    "orchestration.SubtaskReassigned",
    { ...onSubtask, agentId: id, model: "openai/gpt-4o" },
  ],
  [
    "orchestration.CheckpointOpened",
    { ...onSubtask, checkpointId: id, reason: "Needs approval" },
  ],
  [
    "orchestration.CheckpointResolved",
    {
      taskId: id,
      runId: id2,
      checkpointId: id,
      decision: "refused",
      comment: "Not now",
    },
  ],
  ["orchestration.RunPaused", { taskId: id, runId: id2 }],
  ["orchestration.RunResumed", { taskId: id, runId: id2 }],
  ["orchestration.RunCancelled", { taskId: id, runId: id2, reason: "Stop" }],
  ["orchestration.TaskModeChanged", { taskId: id, mode: "auto" }],
  ["orchestration.TaskCancelled", { taskId: id, reason: "Not needed" }],
  [
    "orchestration.CallSettled",
    {
      taskId: id,
      callId: id2,
      kind: "subtask",
      subtaskId: id3,
      inputTokens: 120,
      outputTokens: 40,
      costMicroUsd: 140,
      text: "Three sources.",
    },
  ],
  ["orchestration.CallCancelRequested", { taskId: id, callId: id2 }],
];
const payloadOf = (type: string) =>
  m3Events.find(([name]) => name === type)?.[1] as Record<string, unknown>;

const cases: [string, z.ZodType, unknown[], unknown[]][] = [
  [
    "Id",
    Id,
    [id, crypto.randomUUID()],
    [
      "x",
      "",
      1,
      upperId,
      "0193f1d2-7c4a-7b2e-8d3f-6a5b4c3d2e1f",
      "0b9d3c4e-6f1a-1c2b-9d8e-7a6b5c4d3e2f",
      "0b9d3c4e-6f1a-4c2b-cd8e-7a6b5c4d3e2f",
    ],
  ],
  [
    "Timestamp",
    Timestamp,
    [now, "2026-10-31T09:15:00Z"],
    ["2026-10-31T09:15:00+01:00", "2026-10-31", 0],
  ],
  ["MicroUsd", MicroUsd, [0, 1_500_000], [-1, 1.5, "1"]],
  [
    "Actor",
    Actor,
    [
      actor,
      { kind: "agent", id: "researcher" },
      { kind: "system", id: "orchestration" },
    ],
    [
      { kind: "user", id: "a" },
      { kind: "owner", id: "" },
      { kind: "owner" },
      { kind: "owner", id: "a".repeat(201) },
    ],
  ],
  [
    "StreamId",
    StreamId,
    [`task-${id}`, "budget-month-2026-10"],
    ["task", "Task-1", `task-${"a".repeat(200)}`],
  ],
  [
    "EventEnvelopeV1",
    EventEnvelopeV1(z.object({ n: z.int() })),
    [{ ...event, payload: { n: 1 } }],
    [
      { ...event, payload: { n: "1" } },
      { ...event, type: "TaskSubmitted" },
      { ...event, streamId: "task" },
      { ...event, version: 0 },
      { ...event, schemaVersion: 0 },
      { ...event, occurredAt: "yesterday" },
      { ...event, eventId: upperId },
    ],
  ],
  [
    "CommandEnvelopeV1",
    CommandEnvelopeV1(SubmitTaskCommandPayloadV1),
    [
      command,
      { ...command, expectedVersion: 0 },
      { ...command, expectedVersion: 3 },
    ],
    [
      { ...command, commandId: "1" },
      { ...command, expectedVersion: -1 },
      { ...command, payload: { text: "" } },
    ],
  ],
  [
    "SubmitTaskCommandPayloadV1",
    SubmitTaskCommandPayloadV1,
    [
      { text: "Hi" },
      { text: "x".repeat(20000), mode: "auto" },
      { text: " line one\n\tline two " },
    ],
    [
      { text: "" },
      { text: "   \n\t" },
      { text: "a\0b" },
      { text: "x".repeat(20001) },
      { text: "Hi", mode: "manual" },
      {},
    ],
  ],
  [
    "TaskSubmittedEventPayloadV1",
    TaskSubmittedEventPayloadV1,
    [event.payload],
    [
      { taskId: id, text: "Hi" },
      { ...event.payload, taskId: "x" },
    ],
  ],
  [
    "TaskStatus",
    TaskStatus,
    ["submitted", "awaiting_approval", "blocked", "cancelled"],
    ["Submitted", "done"],
  ],
  [
    "TaskListItemV1",
    TaskListItemV1,
    [item],
    [
      { ...item, status: "x" },
      { ...item, rev: -1 },
      { ...item, title: "" },
      { ...item, title: "a".repeat(201) },
      { ...item, asOf: 0 },
      {
        taskId: id,
        title: "Plan",
        status: "submitted",
        createdAt: now,
        updatedAt: now,
        rev: 1,
      },
    ],
  ],
  [
    "TaskListResultV1",
    TaskListResultV1,
    [
      { items: [], headSeq: 0 },
      { items: [item], headSeq: 7 },
    ],
    [{ items: [{}], headSeq: 0 }, { items: [] }],
  ],
  [
    "Topic",
    Topic,
    [
      "tasks",
      "budget",
      "agents",
      "notifications",
      `task:${id}`,
      `conversation:${id}`,
    ],
    [
      "task",
      "task:1",
      "chat",
      `task:${upperId}`,
      `conversation:${upperId}`,
      "conversation:",
      `conversations:${id}`,
    ],
  ],
  [
    "ViewSubject",
    ViewSubject,
    [
      "view.tasks",
      "view.budget",
      "view.agents",
      "view.notifications",
      `view.task.${id}`,
      `view.conversation.${id}`,
    ],
    [
      `view.conversation.${upperId}`,
      "tasks",
      "view.task",
      `view.task:${id}`,
      `view.tasks.${id}`,
      "view.>",
    ],
  ],
  [
    "ViewNoticeV1",
    ViewNoticeV1,
    [
      view,
      { topic: `task:${id}`, docId: id, rev: 0, data: null },
      { topic: "budget", docId: "2026-10", rev: 3, data: { spent: 1 } },
    ],
    [
      { ...view, topic: "chat" },
      { ...view, docId: "" },
      { ...view, docId: "a".repeat(201) },
      { ...view, rev: -1 },
      { ...view, rev: 1.5 },
      { ...view, rev: Number.MAX_SAFE_INTEGER + 1 },
      { ...view, commandId: "x" },
      { topic: "tasks", rev: 1, data: item },
    ],
  ],
  [
    "ViewMessageV1",
    ViewMessageV1,
    [
      viewMessage,
      {
        ...viewMessage,
        type: `view.task.${id}`,
        payload: { ...view, topic: `task:${id}` },
      },
    ],
    [
      { ...viewMessage, type: "orchestration.TaskSubmitted" },
      { ...viewMessage, payload: { ...view, rev: -1 } },
      { ...viewMessage, payload: undefined },
    ],
  ],
  [
    "ClientMessageV1",
    ClientMessageV1,
    [
      { type: "hello", v: 1, token: "t" },
      { type: "hello", v: 1, token: "t".repeat(8192), lastSeq: 42 },
      { type: "subscribe", topics: ["tasks", `task:${id}`] },
      { type: "unsubscribe", topics: ["budget"] },
      { type: "reauth", token: "t2" },
      { type: "ping", t: 1 },
      { type: "pong", t: 1 },
    ],
    [
      { type: "hello", v: 2, token: "t" },
      { type: "hello", v: 1, token: "" },
      { type: "hello", v: 1, token: "t".repeat(8193) },
      { type: "hello", v: 1, token: "t", extra: true },
      { type: "reauth", token: "t".repeat(8193) },
      { type: "subscribe", topics: [] },
      { type: "subscribe", topics: Array.from({ length: 51 }, () => "tasks") },
      { type: "welcome", sessionId: id, headSeq: 0, heartbeatMs: 20000 },
      { type: "ping" },
      { type: "ping", t: 1, x: 1 },
    ],
  ],
  [
    "ServerMessageV1",
    ServerMessageV1,
    [
      { type: "welcome", sessionId: id, headSeq: 0, heartbeatMs: 20000 },
      { type: "subscribed", topics: ["tasks"], fromSeq: 5 },
      notice,
      { ...notice, commandId: id },
      { type: "delta", taskId: id, callId: id, attempt: 1, i: 0, text: "Hel" },
      { type: "unsubscribed", topics: ["budget", `conversation:${id}`] },
      { type: "resync", reason: "too_old" },
      { type: "error", code: "forbidden", message: "Topic is not allowed" },
      { type: "ping", t: 1 },
      { type: "pong", t: 1 },
    ],
    [
      { type: "hello", v: 1, token: "t" },
      { ...notice, seq: 0 },
      { ...notice, commandId: "x" },
      { ...notice, docId: "a".repeat(201) },
      { type: "resync", reason: "later" },
      { type: "resync", reason: "server_restart" },
      { type: "unsubscribed", topics: [] },
      { type: "unsubscribed", topics: ["chat"] },
      { type: "delta", taskId: id, callId: id, attempt: 1, i: 1.5, text: "x" },
      { type: "delta", taskId: id, callId: id, attempt: 0, i: 0, text: "x" },
      { type: "delta", taskId: id, callId: id, i: 0, text: "x" },
      {
        type: "delta",
        taskId: upperId,
        callId: id,
        attempt: 1,
        i: 0,
        text: "x",
      },
      { type: "error", code: "oops", message: "x" },
      { type: "error", code: "internal", message: "x".repeat(1001) },
      { type: "delta", taskId: id, callId: id, attempt: 1, i: -1, text: "x" },
      {
        type: "delta",
        taskId: id,
        callId: id,
        attempt: 1,
        i: 0,
        text: "x".repeat(16385),
      },
    ],
  ],
  ["ErrorCode", ErrorCode, errorCodes, ["teapot"]],
  ["Reason", Reason, ["x", "x".repeat(1000)], ["", "x".repeat(1001), 1]],
  [
    "ModelId",
    ModelId,
    [
      "openai/gpt-4o",
      "anthropic/claude-sonnet-4.5",
      "meta-llama/llama-3.1-8b-instruct:free",
      "openrouter/auto",
    ],
    [
      "gpt-4o",
      "/gpt",
      "openai/",
      "a/b/c",
      "openai/gpt 4o",
      `a/${"b".repeat(199)}`,
    ],
  ],
  [
    "DeltaV1",
    DeltaV1,
    [
      { attempt: 1, i: 0, text: "" },
      { attempt: 2, i: 7, text: "x".repeat(16384) },
    ],
    [
      { attempt: 1, i: -1, text: "x" },
      { attempt: 1, i: 1.5, text: "x" },
      { attempt: 1, i: "0", text: "x" },
      { attempt: 1, i: 0, text: "x".repeat(16385) },
      { attempt: 0, i: 0, text: "x" },
      { attempt: 1.5, i: 0, text: "x" },
      { i: 0, text: "x" },
      { attempt: 1, i: 0 },
      { attempt: 1, text: "x" },
    ],
  ],
  [
    "PostOwnerMessageCommandPayloadV1",
    PostOwnerMessageCommandPayloadV1,
    [
      { conversationId: id, text: "Hi" },
      { conversationId: id, text: "Go on", taskId: id2 },
      { conversationId: id, text: "New one", newTask: true },
      { conversationId: id, text: "New one", newTask: true, mode: "auto" },
    ],
    [
      { conversationId: id, text: "Hi", mode: "manual" },
      { text: "Hi" },
      { conversationId: upperId, text: "Hi" },
      { conversationId: id, text: " " },
      { conversationId: id, text: "x".repeat(20001) },
      { conversationId: id, text: "Hi", taskId: "x" },
      { conversationId: id, text: "Hi", newTask: "yes" },
    ],
  ],
  [
    "ConversationStartedEventPayloadV1",
    ConversationStartedEventPayloadV1,
    [{ conversationId: id }],
    [{}, { conversationId: upperId }],
  ],
  [
    "OwnerMessagePostedEventPayloadV1",
    OwnerMessagePostedEventPayloadV1,
    [
      { ...owned, intent: "new_task" },
      { ...owned, intent: "steer", taskId: id },
      { ...owned, intent: "answer", taskId: id },
      { ...owned, intent: "new_task", mode: "approval" },
    ],
    [
      { ...owned, intent: "new_task", mode: "manual" },
      { ...owned, intent: "steer" },
      { ...owned, intent: "answer" },
      { ...owned, intent: "chat", taskId: id },
      { ...owned, intent: "steer", taskId: "x" },
      { ...owned, intent: "new_task", text: "" },
      { ...owned, intent: "new_task", taskId: id },
      { conversationId: id, text: "Hi", intent: "new_task" },
    ],
  ],
  [
    "AgentReplyPostedEventPayloadV1",
    AgentReplyPostedEventPayloadV1,
    [reply, without(reply, "runId"), { ...reply, text: "x".repeat(100000) }],
    [
      { ...reply, sourceEventId: "x" },
      { ...reply, text: "" },
      { ...reply, text: " \n" },
      { ...reply, text: "a\0b" },
      { ...reply, text: "x".repeat(100001) },
      { ...reply, taskId: undefined },
    ],
  ],
  [
    "RunStartedEventPayloadV1",
    RunStartedEventPayloadV1,
    [{ taskId: id, runId: id2 }],
    [{ taskId: id }, { taskId: id, runId: upperId }],
  ],
  [
    "RunCompletedEventPayloadV1",
    RunCompletedEventPayloadV1,
    [
      { taskId: id, runId: id2, summary: "Done", costMicroUsd: 0 },
      { taskId: id, runId: id2, summary: "x".repeat(100000), costMicroUsd: 1 },
    ],
    [
      ...badMoney.map((costMicroUsd) => ({
        taskId: id,
        runId: id2,
        summary: "Done",
        costMicroUsd,
      })),
      { taskId: id, runId: id2, summary: "", costMicroUsd: 1 },
      { taskId: id, runId: id2, summary: "x".repeat(100001), costMicroUsd: 1 },
      { taskId: id, runId: id2, summary: "Done" },
    ],
  ],
  [
    "RunFailedEventPayloadV1",
    RunFailedEventPayloadV1,
    [
      { taskId: id, runId: id2, code: "budget_refused", reason: "Cap reached" },
      { taskId: id, runId: id2, code: "empty_output", reason: "No text" },
    ],
    [
      { taskId: id, runId: id2, code: "oops", reason: "x" },
      { taskId: id, runId: id2, code: "internal", reason: "" },
      { taskId: id, runId: id2, code: "internal" },
    ],
  ],
  [
    "MessageRefusedEventPayloadV1",
    MessageRefusedEventPayloadV1,
    [refused, { ...refused, intent: "answer" }],
    [
      { ...refused, intent: "new_task" },
      { ...refused, reason: "" },
      { ...refused, messageId: "x" },
    ],
  ],
  [
    "TaskSubmittedEventPayloadV1 from the chat",
    TaskSubmittedEventPayloadV1,
    [{ ...event.payload, conversationId: id, messageId: id2 }],
    [
      { ...event.payload, conversationId: "x" },
      { ...event.payload, messageId: upperId },
    ],
  ],
  [
    "PromptText",
    PromptText,
    ["x", "x".repeat(100000)],
    ["", " \n", "a\0b", "x".repeat(100001)],
  ],
  [
    "PromptVariable",
    PromptVariable,
    ["role", "taskText", "a_1"],
    ["", "Role", "1a", "a-b", "{{a}}", "a".repeat(65)],
  ],
  [
    "CreatePromptCommandPayloadV1",
    CreatePromptCommandPayloadV1,
    [{ name: "Writer system prompt" }],
    [{ name: "" }, { name: "x".repeat(201) }, {}],
  ],
  [
    "PublishPromptVersionCommandPayloadV1",
    PublishPromptVersionCommandPayloadV1,
    [{ promptId: id, text: "Hi", variables: [] }],
    [
      { promptId: id, text: "Hi" },
      { promptId: id, text: "Hi", variables: ["Bad"] },
      {
        promptId: id,
        text: "Hi",
        variables: Array.from({ length: 51 }, () => "a"),
      },
    ],
  ],
  [
    "PromptCreatedEventPayloadV1",
    PromptCreatedEventPayloadV1,
    [{ promptId: id, name: "Writer" }],
    [{ promptId: "x", name: "Writer" }, { promptId: id }],
  ],
  [
    "PromptVersionPublishedEventPayloadV1",
    PromptVersionPublishedEventPayloadV1,
    [promptVersion],
    [
      { ...promptVersion, version: 0 },
      { ...promptVersion, version: 1.5 },
      { ...promptVersion, text: "" },
      { ...promptVersion, version: undefined },
    ],
  ],
  [
    "AgentName",
    AgentName,
    ["orchestrator", "writer", "code-reviewer-2"],
    ["", "Writer", "2nd", "a_b", "a b", "a".repeat(65)],
  ],
  [
    "AgentLimits",
    AgentLimits,
    [limits, { maxCalls: 1000, maxTokens: 16384, maxCostMicroUsd: 0 }],
    [
      ...badMoney.map((maxCostMicroUsd) => ({ ...limits, maxCostMicroUsd })),
      { ...limits, maxCalls: 0 },
      { ...limits, maxCalls: 1001 },
      { ...limits, maxTokens: 0 },
      { ...limits, maxTokens: 16385 },
    ],
  ],
  [
    "CreateAgentCommandPayloadV1",
    CreateAgentCommandPayloadV1,
    [{ name: "writer" }],
    [{ name: "Writer" }, {}],
  ],
  [
    "PublishAgentVersionCommandPayloadV1",
    PublishAgentVersionCommandPayloadV1,
    [without(agentVersion, "version")],
    [
      { ...agentVersion, models: [] },
      {
        ...agentVersion,
        models: Array.from({ length: 6 }, () => "openai/gpt-4o"),
      },
      { ...agentVersion, models: ["gpt-4o"] },
      { ...agentVersion, prompt: { promptId: id2 } },
      { ...agentVersion, prompt: { promptId: id2, version: 0 } },
      { ...agentVersion, limits: undefined },
    ],
  ],
  [
    "AgentVersionPublishedEventPayloadV1",
    AgentVersionPublishedEventPayloadV1,
    [agentVersion],
    [
      { ...agentVersion, version: 0 },
      { ...agentVersion, agentId: upperId },
    ],
  ],
  [
    "ActivateAgentVersionCommandPayloadV1",
    ActivateAgentVersionCommandPayloadV1,
    [{ agentId: id, version: 1 }],
    [{ agentId: id }, { agentId: id, version: 0 }],
  ],
  [
    "SetAgentEnabledCommandPayloadV1",
    SetAgentEnabledCommandPayloadV1,
    [
      { agentId: id, enabled: true },
      { agentId: id, enabled: false },
    ],
    [{ agentId: id }, { agentId: id, enabled: "true" }],
  ],
  [
    "AgentCreatedEventPayloadV1",
    AgentCreatedEventPayloadV1,
    [{ agentId: id, name: "writer" }],
    [{ agentId: id, name: "" }],
  ],
  [
    "AgentDisabledEventPayloadV1",
    AgentDisabledEventPayloadV1,
    [{ agentId: id }],
    [{}, { agentId: "x" }],
  ],
  [
    "CallStartedEventPayloadV1",
    CallStartedEventPayloadV1,
    [started, { ...started, attempt: 2 }],
    [
      { ...started, attempt: 0 },
      { ...started, model: "gpt" },
      { ...started, reservationId: "x" },
      { ...started, agentVersion: 0 },
      { ...started, taskId: "x" },
    ],
  ],
  [
    "CallCompletedEventPayloadV1",
    CallCompletedEventPayloadV1,
    [
      completed,
      { ...completed, text: "", finishReason: "length", costMicroUsd: 0 },
      { ...completed, text: "x".repeat(100000) },
    ],
    [
      ...badMoney.map((costMicroUsd) => ({ ...completed, costMicroUsd })),
      { ...completed, text: "x".repeat(100001) },
      { ...completed, text: "a\0b" },
      { ...completed, finishReason: "error" },
      { ...completed, inputTokens: -1 },
      { ...completed, outputTokens: 1.5 },
      { ...completed, cachedTokens: undefined },
      { ...completed, latencyMs: -1 },
      { ...completed, bodyId: upperId },
    ],
  ],
  [
    "CallFailedEventPayloadV1",
    CallFailedEventPayloadV1,
    [
      failed,
      without({ ...failed, errorClass: "invalid" }, "nextModel"),
      without({ ...failed, errorClass: "cancelled" }, "nextModel"),
      {
        ...failed,
        errorClass: "budget_refused",
        reservationId: id,
        bodyId: id2,
        inputTokens: 120,
        outputTokens: 0,
      },
    ],
    [
      ...badMoney.map((costMicroUsd) => ({ ...failed, costMicroUsd })),
      { ...failed, reservationId: "x" },
      { ...failed, inputTokens: -1 },
      { ...failed, errorClass: "auth" },
      { ...failed, reason: "" },
      { ...failed, nextModel: "x" },
    ],
  ],
  [
    "BudgetMonth",
    BudgetMonth,
    ["2026-10", "2027-01", "2026-12"],
    ["2026-13", "2026-00", "2026-1", "26-10", "2026-10-01", "2026/10"],
  ],
  [
    "BudgetScope",
    BudgetScope,
    [
      month,
      { kind: "task", key: id },
      { kind: "agent", key: id },
      { kind: "project", key: id },
    ],
    [
      { kind: "month", key: id },
      { kind: "task", key: "2026-10" },
      { kind: "year", key: "2026" },
      { kind: "task", key: upperId },
      { kind: "month" },
    ],
  ],
  [
    "SetBudgetCommandPayloadV1",
    SetBudgetCommandPayloadV1,
    [
      { scope: everyMonth, hardCapMicroUsd: 20_000_000 },
      { scope: everyMonth, hardCapMicroUsd: 0, softCapMicroUsd: 0 },
      { scope: { kind: "task", key: id }, hardCapMicroUsd: 1_000_000_000_000 },
    ],
    [
      ...badMoney.map((hardCapMicroUsd) => ({
        scope: everyMonth,
        hardCapMicroUsd,
      })),
      ...badMoney.map((softCapMicroUsd) => ({
        scope: everyMonth,
        hardCapMicroUsd: 1,
        softCapMicroUsd,
      })),
      { scope: everyMonth, hardCapMicroUsd: 1_000_000_000_001 },
      { scope: { kind: "task" }, hardCapMicroUsd: 1 },
      { hardCapMicroUsd: 1 },
    ],
  ],
  [
    "BudgetSetEventPayloadV1",
    BudgetSetEventPayloadV1,
    [{ scope: everyMonth, hardCapMicroUsd: 20_000_000, softCapMicroUsd: 10 }],
    [{ scope: everyMonth, hardCapMicroUsd: 0.01 }],
  ],
  [
    "ReserveFundsRequestV1",
    ReserveFundsRequestV1,
    [
      reserve,
      { ...reserve, amountMicroUsd: 0, ttlMs: 3600000 },
      { ...reserve, ttlMs: 1000 },
    ],
    [
      ...badMoney.map((amountMicroUsd) => ({ ...reserve, amountMicroUsd })),
      { ...reserve, ttlMs: 999 },
      { ...reserve, ttlMs: 3600001 },
      { ...reserve, ttlMs: 1.5 },
      { ...reserve, reservationId: upperId },
      { ...reserve, taskId: undefined },
      { ...reserve, agentId: "x" },
    ],
  ],
  [
    "ReserveFundsReplyV1",
    ReserveFundsReplyV1,
    [
      { ok: true, reservationId: id, expiresAt: now },
      { ok: false, reservationId: id, scope: month, reason: "Cap reached" },
    ],
    [
      { ok: true, reservationId: id },
      { ok: false, reservationId: id, scope: month },
      { ok: "true", reservationId: id, expiresAt: now },
      { ok: true, reservationId: "x", expiresAt: now },
    ],
  ],
  [
    "SettleReservationRequestV1",
    SettleReservationRequestV1,
    [
      { reservationId: id, actualMicroUsd: 0 },
      { reservationId: id, actualMicroUsd: 1_500_000 },
    ],
    [
      ...badMoney.map((actualMicroUsd) => ({
        reservationId: id,
        actualMicroUsd,
      })),
      { actualMicroUsd: 1 },
    ],
  ],
  [
    "SettleReservationReplyV1",
    SettleReservationReplyV1,
    [
      { state: "settled", reservationId: id, actualMicroUsd: 140 },
      { state: "already_settled", reservationId: id, actualMicroUsd: 140 },
      { state: "expired", reservationId: id, amountMicroUsd: 25_000 },
      { state: "unknown", reservationId: id },
    ],
    [
      { state: "settled", reservationId: id },
      { state: "expired", reservationId: id },
      { state: "settled", reservationId: id, actualMicroUsd: 1.5 },
      { state: "lost", reservationId: id },
      { state: "unknown" },
    ],
  ],
  [
    "CapScope",
    CapScope,
    [everyMonth, { kind: "agent", key: id }],
    [month, { kind: "agent" }, { kind: "month", key: id }],
  ],
  [
    "BudgetMonthV1",
    BudgetMonthV1,
    [
      budgetMonth,
      { ...budgetMonth, softCapMicroUsd: 10_000_000 },
      { ...budgetMonth, capMicroUsd: null, remainingMicroUsd: 0 },
      {
        ...budgetMonth,
        spentMicroUsd: 20_000_140,
        remainingMicroUsd: 0,
        overCapMicroUsd: 140,
      },
    ],
    [
      ...badMoney.map((spentMicroUsd) => ({ ...budgetMonth, spentMicroUsd })),
      ...badMoney.map((remainingMicroUsd) => ({
        ...budgetMonth,
        remainingMicroUsd,
      })),
      { ...budgetMonth, capMicroUsd: 1_000_000_000_001 },
      ...badMoney
        .filter((value) => value !== null)
        .map((capMicroUsd) => ({ ...budgetMonth, capMicroUsd })),
      ...badMoney.map((overCapMicroUsd) => ({
        ...budgetMonth,
        overCapMicroUsd,
      })),
      without(budgetMonth, "capMicroUsd"),
      without(budgetMonth, "overCapMicroUsd"),
      without(budgetMonth, "asOf"),
      { ...budgetMonth, asOf: 0 },
      { ...budgetMonth, month: "2026-13" },
      { ...budgetMonth, rev: -1 },
    ],
  ],
  [
    "CallRequestedEventPayloadV1",
    CallRequestedEventPayloadV1,
    [
      requested,
      { ...requested, models: ["openai/gpt-4o"], maxTokens: 16384 },
      { ...requested, maxCostMicroUsd: 50_000 },
      { ...requested, kind: "plan" },
      { ...requested, kind: "subtask", subtaskId: id },
      {
        ...requested,
        messages: [{ role: "assistant", content: "x".repeat(100000) }],
      },
    ],
    [
      { ...requested, messages: [] },
      { ...requested, messages: [{ role: "tool", content: "x" }] },
      { ...requested, messages: [{ role: "user", content: "" }] },
      {
        ...requested,
        messages: [{ role: "user", content: "x".repeat(100001) }],
      },
      {
        ...requested,
        messages: Array.from({ length: 51 }, () => ({
          role: "user",
          content: "x",
        })),
      },
      { ...requested, models: [] },
      { ...requested, models: ["gpt"] },
      { ...requested, maxTokens: 0 },
      { ...requested, maxTokens: 16385 },
      { ...requested, maxDurationMs: 999 },
      ...badMoney.map((maxCostMicroUsd) => ({ ...requested, maxCostMicroUsd })),
      { ...requested, agentVersion: 0 },
      { ...requested, taskId: upperId },
      without(requested, "maxDurationMs"),
    ],
  ],
  [
    "RunBlockedEventPayloadV1",
    RunBlockedEventPayloadV1,
    [
      { taskId: id, runId: id2, code: "budget_refused", reason: "Cap reached" },
      { taskId: id, runId: id2, code: "runaway_stopped", reason: "Loop" },
      {
        taskId: id,
        runId: id2,
        code: "subtask_failed",
        reason: "Try 3 failed",
      },
    ],
    [
      { taskId: id, runId: id2, code: "internal", reason: "x" },
      { taskId: id, runId: id2, code: "budget_refused", reason: "" },
      { taskId: id, code: "budget_refused", reason: "x" },
    ],
  ],
  [
    "ConversationMessageV1",
    ConversationMessageV1,
    [
      { ...shown, role: "owner", intent: "new_task" },
      { ...shown, role: "owner", intent: "steer", taskId: id2 },
      { ...shown, role: "agent", taskId: id2 },
      { ...shown, role: "agent", taskId: id2, costMicroUsd: 140 },
    ],
    [
      { ...shown, role: "owner" },
      { ...shown, role: "agent" },
      { ...shown, role: "agent", taskId: id2, costMicroUsd: 1.5 },
      { ...shown, role: "agent", taskId: id2, costMicroUsd: -1 },
      { ...shown, role: "system", taskId: id2 },
      { ...shown, role: "owner", intent: "new_task", text: "" },
      { ...shown, role: "owner", intent: "new_task", asOf: 0 },
      { ...shown, role: "owner", intent: "new_task", createdAt: "now" },
    ],
  ],
  [
    "ConversationThreadResultV1",
    ConversationThreadResultV1,
    [
      { items: [], headSeq: 0 },
      { items: [{ ...shown, role: "agent", taskId: id2 }], headSeq: 3 },
    ],
    [{ items: [{}], headSeq: 0 }, { items: [] }],
  ],
  [
    "AgentListItemV1",
    AgentListItemV1,
    [
      agentItem,
      { agentId: id, name: "writer", enabled: false, rev: 0, asOf: 1 },
    ],
    [
      { ...agentItem, enabled: "yes" },
      { ...agentItem, activeVersion: 0 },
      { ...agentItem, name: "Writer" },
      without(agentItem, "asOf"),
    ],
  ],
  [
    "AgentListResultV1",
    AgentListResultV1,
    [{ items: [agentItem], headSeq: 1 }],
    [{ items: [{}], headSeq: 1 }, { items: [agentItem] }],
  ],
  [
    "ActiveAgentVersionResultV1",
    ActiveAgentVersionResultV1,
    [{ ...agentVersion, name: "writer", enabled: true }],
    [
      agentVersion,
      { ...agentVersion, name: "writer", enabled: true, version: 0 },
      { ...agentVersion, name: "writer", enabled: "true" },
    ],
  ],
  [
    "PromptVersionResultV1",
    PromptVersionResultV1,
    [{ ...promptVersion, name: "Writer" }],
    [promptVersion, { ...promptVersion, name: "" }],
  ],
  [
    "FundsReservedEventPayloadV1",
    FundsReservedEventPayloadV1,
    [reserved],
    [
      ...badMoney.map((amountMicroUsd) => ({ ...reserved, amountMicroUsd })),
      { ...reserved, scopes: [] },
      { ...reserved, scopes: [everyMonth] },
      { ...reserved, taskId: "x" },
      { ...reserved, expiresAt: "soon" },
    ],
  ],
  [
    "ReservationRefusedEventPayloadV1",
    ReservationRefusedEventPayloadV1,
    [refusal],
    [
      { ...refusal, reason: "" },
      { ...refusal, scope: { kind: "month", key: "2026-13" } },
      { ...refusal, amountMicroUsd: -5 },
    ],
  ],
  [
    "ReservationSettledEventPayloadV1",
    ReservationSettledEventPayloadV1,
    [
      { reservationId: id, reservedMicroUsd: 25_000, actualMicroUsd: 140 },
      { reservationId: id, reservedMicroUsd: 100, actualMicroUsd: 102 },
    ],
    badMoney.map((actualMicroUsd) => ({
      reservationId: id,
      reservedMicroUsd: 1,
      actualMicroUsd,
    })),
  ],
  [
    "ReservationExpiredEventPayloadV1",
    ReservationExpiredEventPayloadV1,
    [{ reservationId: id, amountMicroUsd: 25_000 }],
    badMoney.map((amountMicroUsd) => ({ reservationId: id, amountMicroUsd })),
  ],
  [
    "ThresholdCrossedEventPayloadV1",
    ThresholdCrossedEventPayloadV1,
    [
      threshold,
      { ...threshold, cap: "soft", percent: 50 },
      { ...threshold, percent: 100 },
    ],
    [
      { ...threshold, percent: 90 },
      { ...threshold, percent: "80" },
      { ...threshold, cap: "medium" },
      ...badMoney.map((spentMicroUsd) => ({ ...threshold, spentMicroUsd })),
    ],
  ],
  [
    "ProblemJson",
    ProblemJson,
    [
      {
        type: "about:blank",
        title: "Not found",
        status: 404,
        code: "not_found",
      },
      {
        type: "about:blank",
        title: "Payload too large",
        status: 413,
        code: "payload_too_large",
      },
      {
        type: "https://ai.famashines.com/problems/conflict",
        title: "Conflict",
        status: 409,
        detail: "Changed by another action",
        instance: "/api/tasks/1",
        code: "conflict",
      },
    ],
    [
      { type: "about:blank", title: "OK", status: 200, code: "internal" },
      { type: "about:blank", title: "Not found", status: 404 },
    ],
  ],
  [
    "SubtaskTitle",
    SubtaskTitle,
    ["Write", "a".repeat(200)],
    ["", " \n", "a\0b", "a".repeat(201), 1],
  ],
  [
    "SubtaskInstructions",
    SubtaskInstructions,
    ["Do it", "a".repeat(4000)],
    ["", "\t", "a\0b", "a".repeat(4001)],
  ],
  [
    "ClarifyingQuestion",
    ClarifyingQuestion,
    ["Which X?", "a".repeat(1000)],
    ["", " ", "a\0", "a".repeat(1001)],
  ],
  [
    "PlanSubtask",
    PlanSubtask,
    [subtaskA, subtaskB, { ...subtaskA, estimatedCostMicroUsd: 0 }],
    [
      without(subtaskA, "needsApproval"),
      without(subtaskA, "instructions"),
      { ...subtaskA, subtaskId: upperId },
      { ...subtaskA, agentId: "writer" },
      { ...subtaskA, model: "gpt" },
      { ...subtaskA, dependsOn: [upperId] },
      { ...subtaskA, dependsOn: Array.from({ length: 20 }, () => id2) },
      { ...subtaskA, estimatedDurationMs: -1 },
      { ...subtaskA, estimatedDurationMs: 86400001 },
      ...badCap.map((money) => ({
        ...subtaskA,
        estimatedCostMicroUsd: money,
      })),
    ],
  ],
  [
    "PlanSubtasks",
    PlanSubtasks,
    [plan, [subtaskA]],
    [[], [subtaskA, { ...subtaskB, title: "" }]],
  ],
  [
    "ClarificationRequestedEventPayloadV1",
    ClarificationRequestedEventPayloadV1,
    [payloadOf("orchestration.ClarificationRequested")],
    [
      { taskId: id, questions: [] },
      { taskId: id, questions: Array.from({ length: 6 }, () => "Why?") },
      { taskId: id, questions: [""] },
      { questions: ["Why?"] },
    ],
  ],
  [
    "ClarificationAnsweredEventPayloadV1",
    ClarificationAnsweredEventPayloadV1,
    [answered, { ...answered, text: "x".repeat(20000) }],
    [
      { ...answered, text: "" },
      { ...answered, text: "x".repeat(20001) },
      without(answered, "messageId"),
      { ...answered, conversationId: upperId },
    ],
  ],
  [
    "SteeringMessageAddedEventPayloadV1",
    SteeringMessageAddedEventPayloadV1,
    [{ ...answered, runId: id2 }],
    [
      { ...answered, runId: id2, text: " " },
      without({ ...answered, runId: id2 }, "taskId"),
      answered,
    ],
  ],
  [
    "PlanProposedEventPayloadV1",
    PlanProposedEventPayloadV1,
    [proposed, { ...proposed, awaitsApproval: false }],
    [
      { ...proposed, planVersion: 0 },
      { ...proposed, subtasks: [] },
      without(proposed, "planVersion"),
      planned,
      { ...proposed, awaitsApproval: "yes" },
    ],
  ],
  [
    "PlanEditedEventPayloadV1",
    PlanEditedEventPayloadV1,
    [{ ...planned, planVersion: 3 }],
    [{ ...planned, subtasks: [{ ...subtaskA, agentId: "x" }] }],
  ],
  [
    "PlanApprovedEventPayloadV1",
    PlanApprovedEventPayloadV1,
    [{ taskId: id, planVersion: 1 }],
    [{ taskId: id }, { taskId: id, planVersion: 1.5 }],
  ],
  [
    "PlanRejectedEventPayloadV1",
    PlanRejectedEventPayloadV1,
    [payloadOf("orchestration.PlanRejected")],
    [
      { taskId: id, planVersion: 1 },
      { taskId: id, planVersion: 1, reason: "" },
      { taskId: id, planVersion: 1, reason: "x".repeat(1001) },
    ],
  ],
  [
    "SubtaskQueuedEventPayloadV1",
    SubtaskQueuedEventPayloadV1,
    [onSubtask],
    [without(onSubtask, "runId"), { ...onSubtask, subtaskId: "s1" }],
  ],
  [
    "SubtaskWaitingEventPayloadV1",
    SubtaskWaitingEventPayloadV1,
    [onSubtask],
    [without(onSubtask, "subtaskId")],
  ],
  [
    "SubtaskStartedEventPayloadV1",
    SubtaskStartedEventPayloadV1,
    [payloadOf("orchestration.SubtaskStarted")],
    [
      { ...payloadOf("orchestration.SubtaskStarted"), tryNumber: 0 },
      { ...payloadOf("orchestration.SubtaskStarted"), agentVersion: 0 },
      without(payloadOf("orchestration.SubtaskStarted"), "callId"),
    ],
  ],
  [
    "SubtaskCompletedEventPayloadV1",
    SubtaskCompletedEventPayloadV1,
    [payloadOf("orchestration.SubtaskCompleted")],
    [
      ...badCap.map((money) => ({
        ...payloadOf("orchestration.SubtaskCompleted"),
        costMicroUsd: money,
      })),
      { ...payloadOf("orchestration.SubtaskCompleted"), inputTokens: -1 },
      without(payloadOf("orchestration.SubtaskCompleted"), "text"),
      {
        ...payloadOf("orchestration.SubtaskCompleted"),
        text: "x".repeat(100001),
      },
      without(payloadOf("orchestration.SubtaskCompleted"), "callId"),
    ],
  ],
  [
    "SubtaskFailedEventPayloadV1",
    SubtaskFailedEventPayloadV1,
    [payloadOf("orchestration.SubtaskFailed")],
    [
      { ...payloadOf("orchestration.SubtaskFailed"), code: "oops" },
      { ...payloadOf("orchestration.SubtaskFailed"), reason: "" },
      without(payloadOf("orchestration.SubtaskFailed"), "tryNumber"),
      without(payloadOf("orchestration.SubtaskFailed"), "costMicroUsd"),
      ...badCap.map((money) => ({
        ...payloadOf("orchestration.SubtaskFailed"),
        costMicroUsd: money,
      })),
    ],
  ],
  [
    "SubtaskRetryingEventPayloadV1",
    SubtaskRetryingEventPayloadV1,
    [payloadOf("orchestration.SubtaskRetrying")],
    [
      { ...payloadOf("orchestration.SubtaskRetrying"), retryAt: "soon" },
      without(payloadOf("orchestration.SubtaskRetrying"), "retryAt"),
    ],
  ],
  [
    "SubtaskBlockedEventPayloadV1",
    SubtaskBlockedEventPayloadV1,
    [
      payloadOf("orchestration.SubtaskBlocked"),
      { ...payloadOf("orchestration.SubtaskBlocked"), code: "forbidden" },
      { ...payloadOf("orchestration.SubtaskBlocked"), code: "runaway_stopped" },
    ],
    [
      { ...payloadOf("orchestration.SubtaskBlocked"), code: "internal" },
      without(payloadOf("orchestration.SubtaskBlocked"), "reason"),
    ],
  ],
  [
    "SubtaskReassignedEventPayloadV1",
    SubtaskReassignedEventPayloadV1,
    [
      payloadOf("orchestration.SubtaskReassigned"),
      { ...onSubtask, agentId: id },
    ],
    [
      { ...onSubtask, agentId: id, model: "x" },
      { ...onSubtask, model: "openai/gpt-4o" },
    ],
  ],
  [
    "CheckpointOpenedEventPayloadV1",
    CheckpointOpenedEventPayloadV1,
    [
      payloadOf("orchestration.CheckpointOpened"),
      { ...payloadOf("orchestration.CheckpointOpened"), deadline: now },
    ],
    [
      { ...payloadOf("orchestration.CheckpointOpened"), deadline: "soon" },
      without(payloadOf("orchestration.CheckpointOpened"), "subtaskId"),
      without(payloadOf("orchestration.CheckpointOpened"), "reason"),
    ],
  ],
  [
    "CheckpointResolvedEventPayloadV1",
    CheckpointResolvedEventPayloadV1,
    [
      payloadOf("orchestration.CheckpointResolved"),
      { taskId: id, runId: id2, checkpointId: id, decision: "approved" },
      { taskId: id, runId: id2, checkpointId: id, decision: "expired" },
    ],
    [
      { taskId: id, runId: id2, checkpointId: id, decision: "maybe" },
      {
        taskId: id,
        runId: id2,
        checkpointId: id,
        decision: "approved",
        comment: "",
      },
    ],
  ],
  [
    "RunPausedEventPayloadV1",
    RunPausedEventPayloadV1,
    [{ taskId: id, runId: id2 }],
    [{ taskId: id }],
  ],
  [
    "RunResumedEventPayloadV1",
    RunResumedEventPayloadV1,
    [{ taskId: id, runId: id2 }],
    [{ runId: id2 }],
  ],
  [
    "RunCancelledEventPayloadV1",
    RunCancelledEventPayloadV1,
    [{ taskId: id, runId: id2 }, payloadOf("orchestration.RunCancelled")],
    [{ taskId: id }, { taskId: id, runId: id2, reason: "" }],
  ],
  [
    "TaskModeChangedEventPayloadV1",
    TaskModeChangedEventPayloadV1,
    [
      { taskId: id, mode: "auto" },
      { taskId: id, mode: "approval" },
    ],
    [{ taskId: id, mode: "manual" }, { taskId: id }],
  ],
  [
    "ApprovePlanCommandPayloadV1",
    ApprovePlanCommandPayloadV1,
    [{ taskId: id, planVersion: 1 }],
    [{ taskId: id, planVersion: 0 }, { planVersion: 1 }],
  ],
  [
    "EditPlanCommandPayloadV1",
    EditPlanCommandPayloadV1,
    [planned],
    [
      { taskId: id, planVersion: 1 },
      { ...planned, subtasks: [] },
    ],
  ],
  [
    "RejectPlanCommandPayloadV1",
    RejectPlanCommandPayloadV1,
    [{ taskId: id, planVersion: 1, reason: "No" }],
    [{ taskId: id, planVersion: 1 }],
  ],
  [
    "PauseRunCommandPayloadV1",
    PauseRunCommandPayloadV1,
    [{ taskId: id }],
    [{}, { taskId: upperId }],
  ],
  [
    "ResumeRunCommandPayloadV1",
    ResumeRunCommandPayloadV1,
    [{ taskId: id }],
    [{ taskId: "x" }],
  ],
  [
    "CancelRunCommandPayloadV1",
    CancelRunCommandPayloadV1,
    [{ taskId: id }, { taskId: id, reason: "Changed my mind" }],
    [{ taskId: id, reason: "" }, {}],
  ],
  [
    "RetrySubtaskCommandPayloadV1",
    RetrySubtaskCommandPayloadV1,
    [{ taskId: id, subtaskId: id2 }],
    [{ taskId: id }, { taskId: id, subtaskId: "s1" }],
  ],
  [
    "ReassignSubtaskCommandPayloadV1",
    ReassignSubtaskCommandPayloadV1,
    [
      { taskId: id, subtaskId: id2, agentId: id3 },
      { taskId: id, subtaskId: id2, agentId: id3, model: "openai/gpt-4o" },
    ],
    [
      { taskId: id, subtaskId: id2 },
      { taskId: id, subtaskId: id2, agentId: id3, model: "gpt" },
    ],
  ],
  [
    "SetTaskModeCommandPayloadV1",
    SetTaskModeCommandPayloadV1,
    [{ taskId: id, mode: "auto" }],
    [{ taskId: id, mode: "fast" }, { mode: "auto" }],
  ],
  [
    "ResolveCheckpointCommandPayloadV1",
    ResolveCheckpointCommandPayloadV1,
    [
      { taskId: id, checkpointId: id2, decision: "approved" },
      { taskId: id, checkpointId: id2, decision: "refused", comment: "No" },
    ],
    [
      { taskId: id, checkpointId: id2 },
      { taskId: id, checkpointId: id2, decision: "open" },
      { taskId: id, checkpointId: id2, decision: "expired" },
      {
        taskId: id,
        checkpointId: id2,
        decision: "refused",
        comment: "x".repeat(1001),
      },
    ],
  ],
  [
    "SubtaskStatus",
    SubtaskStatus,
    [
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
    ],
    ["completed", "Running", "paused"],
  ],
  [
    "SubtaskStateV1",
    SubtaskStateV1,
    [
      subtaskState,
      {
        ...subtaskState,
        status: "retrying",
        retryAt: now,
        endedAt: now,
        reason: "Timeout",
      },
      {
        subtaskId: id,
        status: "waiting",
        tries: 0,
        inputTokens: 0,
        outputTokens: 0,
        costMicroUsd: 0,
      },
    ],
    [
      { ...subtaskState, status: "x" },
      { ...subtaskState, tries: -1 },
      { ...subtaskState, startedAt: "now" },
      { ...subtaskState, costMicroUsd: 1.5 },
      { ...subtaskState, costMicroUsd: cap + 1 },
      without(subtaskState, "costMicroUsd"),
    ],
  ],
  [
    "CheckpointV1",
    CheckpointV1,
    [
      checkpoint,
      { ...checkpoint, status: "approved", resolvedAt: now, comment: "Fine" },
      { ...checkpoint, status: "expired", deadline: now, resolvedAt: now },
    ],
    [
      { ...checkpoint, status: "closed" },
      without(checkpoint, "openedAt"),
      without(checkpoint, "subtaskId"),
    ],
  ],
  [
    "TaskDetailV1",
    TaskDetailV1,
    [
      detail,
      {
        taskId: id,
        title: "Brief",
        status: "clarifying",
        mode: "auto",
        createdAt: now,
        updatedAt: now,
        subtasks: [],
        currentCall: null,
        checkpoints: [],
        costMicroUsd: 0,
        rev: 0,
        asOf: 1,
      },
      { ...detail, currentCall: { callId: id2, kind: "plan" } },
      { ...detail, status: "blocked", reason: "Monthly cap reached" },
    ],
    [
      { ...detail, status: "done" },
      { ...detail, mode: "manual" },
      { ...detail, plan: { planVersion: 0, subtasks: plan } },
      { ...detail, subtasks: Array.from({ length: 21 }, () => subtaskState) },
      { ...detail, checkpoints: Array.from({ length: 21 }, () => checkpoint) },
      ...badCap.map((money) => ({ ...detail, costMicroUsd: money })),
      { ...detail, asOf: 0 },
      without(detail, "subtasks"),
      without(detail, "currentCall"),
      { ...detail, currentCall: { callId: id2, kind: "task" } },
      {
        ...detail,
        plan: {
          planVersion: 1,
          subtasks: Array.from({ length: 21 }, () => subtaskA),
        },
      },
    ],
  ],
  [
    "TaskOutputV1",
    TaskOutputV1,
    [
      { taskId: id, runId: id2, subtaskId: id3, text: "Output" },
      { taskId: id, runId: id2, text: "The result" },
      { taskId: id, runId: id2, text: "" },
    ],
    [
      { taskId: id, runId: id2, text: "a\0" },
      { taskId: id, runId: id2, text: "x".repeat(100001) },
      { taskId: id, text: "x" },
    ],
  ],
  [
    "TaskCancelledEventPayloadV1",
    TaskCancelledEventPayloadV1,
    [{ taskId: id }, payloadOf("orchestration.TaskCancelled")],
    [{}, { taskId: id, reason: "" }],
  ],
  [
    "CallKind",
    CallKind,
    ["plan", "aggregate", "check", "subtask"],
    ["task", "Plan"],
  ],
  [
    "CallSettledEventPayloadV1",
    CallSettledEventPayloadV1,
    [
      payloadOf("orchestration.CallSettled"),
      {
        taskId: id,
        callId: id2,
        kind: "plan",
        inputTokens: 0,
        outputTokens: 0,
        costMicroUsd: cap,
      },
    ],
    [
      ...badCap.map((money) => ({
        ...payloadOf("orchestration.CallSettled"),
        costMicroUsd: money,
      })),
      { ...payloadOf("orchestration.CallSettled"), kind: "task" },
      { ...payloadOf("orchestration.CallSettled"), text: "a\0" },
      without(payloadOf("orchestration.CallSettled"), "inputTokens"),
    ],
  ],
  [
    "CallCancelRequestedEventPayloadV1",
    CallCancelRequestedEventPayloadV1,
    [{ taskId: id, callId: id2 }],
    [{ taskId: id }, { taskId: id, callId: upperId }],
  ],
  [
    "CancelTaskCommandPayloadV1",
    CancelTaskCommandPayloadV1,
    [{ taskId: id }, { taskId: id, reason: "Not needed" }],
    [{}, { taskId: id, reason: "" }],
  ],
  [
    "CheckpointOutcome",
    CheckpointOutcome,
    ["approved", "refused", "expired"],
    ["open", "Approved"],
  ],
  [
    "CallRef",
    CallRef,
    [
      { callId: id, kind: "aggregate" },
      { callId: id, kind: "subtask", subtaskId: id2 },
    ],
    [{ callId: id }, { callId: "x", kind: "plan" }],
  ],
  ["DeviceLocale", DeviceLocale, ["en", "de", "ur"], ["fr", "EN", "en-US"]],
  ["DevicePlatform", DevicePlatform, ["android"], ["ios", "web"]],
  [
    "PushToken",
    PushToken,
    ["dGVzdA:APA91bH-x_y.z", "a".repeat(4096)],
    ["", "a b", "a\n", "a".repeat(4097), "\u00e4"],
  ],
  [
    "RegisterDeviceCommandPayloadV1",
    RegisterDeviceCommandPayloadV1,
    [
      {
        deviceId: id,
        platform: "android",
        token: "dGVzdA:APA91b",
        locale: "en",
      },
      { deviceId: id, platform: "android", token: "t", locale: "ur" },
    ],
    [
      { deviceId: id, platform: "android", token: "t" },
      { deviceId: id, platform: "android", token: "t", locale: "fr" },
      { deviceId: id, platform: "ios", token: "t", locale: "de" },
      { deviceId: id, platform: "android" },
      { deviceId: upperId, platform: "android", token: "t" },
    ],
  ],
  [
    "UnregisterDeviceCommandPayloadV1",
    UnregisterDeviceCommandPayloadV1,
    [{ deviceId: id }],
    [{}, { deviceId: "x" }],
  ],
  [
    "PushKind",
    PushKind,
    ["completed", "failed", "approval_needed", "budget"],
    ["done", "approval"],
  ],
  [
    "PushDataV1",
    PushDataV1,
    [
      { kind: "completed", taskId: id },
      { kind: "failed", taskId: id },
      { kind: "approval_needed", taskId: id },
      { kind: "budget" },
    ],
    [
      { kind: "completed" },
      { kind: "budget", taskId: id },
      { kind: "done", taskId: id },
      { kind: "failed", taskId: "x" },
    ],
  ],
  [
    "RegisteredEvent",
    RegisteredEvent,
    [event],
    [{ ...event, type: "orchestration.Unknown" }],
  ],
];

for (const [name, schema, valid, invalid] of cases) {
  describe(name, () => {
    const roundTrip = z.fromJSONSchema(z.toJSONSchema(schema, { io: "input" }));
    test("accepts valid examples", () => {
      for (const value of valid)
        assert.equal(
          schema.safeParse(value).success,
          true,
          JSON.stringify(value),
        );
    });
    test("rejects invalid examples", () => {
      for (const value of invalid)
        assert.equal(
          schema.safeParse(value).success,
          false,
          JSON.stringify(value),
        );
    });
    test("JSON Schema round trip keeps the rules", () => {
      for (const value of valid)
        assert.equal(
          roundTrip.safeParse(value).success,
          true,
          JSON.stringify(value),
        );
      for (const value of invalid)
        assert.equal(
          roundTrip.safeParse(value).success,
          false,
          JSON.stringify(value),
        );
    });
  });
}

test("SubmitTask mode is approval by default", () => {
  assert.equal(
    SubmitTaskCommandPayloadV1.parse({ text: "Hi" }).mode,
    "approval",
  );
});

test("expectedVersion and other optional fields refuse an explicit undefined", () => {
  assert.equal(
    CommandEnvelopeV1(SubmitTaskCommandPayloadV1).safeParse({
      ...command,
      expectedVersion: undefined,
    }).success,
    false,
  );
  assert.equal(
    ClientMessageV1.safeParse({
      type: "hello",
      v: 1,
      token: "t",
      lastSeq: undefined,
    }).success,
    false,
  );
});

test("envelopes and payloads strip unknown keys", () => {
  const parsed = EventEnvelopeV1(TaskSubmittedEventPayloadV1).parse({
    ...event,
    _id: id,
    publishedAt: now,
    payload: { ...event.payload, extra: 1 },
  });
  assert.equal("_id" in parsed, false);
  assert.equal("publishedAt" in parsed, false);
  assert.equal("extra" in parsed.payload, false);
});

test("close codes match ARCHITECTURE 10.2", () => {
  assert.deepEqual(WsCloseCode, {
    badMessage: 4400,
    auth: 4401,
    forbiddenTopic: 4403,
    slowConsumer: 4408,
    rateLimit: 4429,
    serverRestart: 1012,
  });
});

test("WebSocket limits match ARCHITECTURE 10.2", () => {
  assert.deepEqual(WsLimits, {
    clientFrameBytes: 65536,
    clientFramesPerSecond: 20,
    helloTimeoutMs: 5000,
    pingIntervalMs: 20000,
    pongTimeoutMs: 10000,
    dropDeltasOverBytes: 1048576,
    closeOverBytes: 4194304,
    reconnectMinMs: 1000,
    reconnectMaxMs: 30000,
    maxTopics: 50,
  });
});

test("long untrusted strings are checked in linear time", () => {
  const inputs: [z.ZodType, string][] = [
    [TaskText, "a".repeat(20000) + "\0"],
    [TaskText, "a".repeat(19999) + "\0"],
    [TaskText, "a".repeat(200000) + "\0"],
    [StreamId, "a".repeat(200000)],
    [MessageType, "a." + "A".repeat(200000) + "!"],
    [Id, "0".repeat(200000)],
    [Topic, "task:" + "0".repeat(200000)],
    [ViewSubject, "view.task." + "0".repeat(200000)],
    [PromptText, "a".repeat(200000) + "\0"],
    [ReplyText, "a".repeat(100000) + "\0"],
    [OutputText, "a".repeat(99999) + "\0"],
    [OutputText, "a".repeat(200000) + "\0"],
    [ReplyText, "a".repeat(200000) + "\0"],
    [PromptVariable, "a".repeat(200000) + "!"],
    [ModelId, "a".repeat(200000)],
    [AgentName, "a".repeat(200000) + "!"],
    [BudgetMonth, "2".repeat(200000)],
    [SubtaskTitle, "a".repeat(200000) + "\0"],
    [SubtaskInstructions, "a".repeat(200000) + "\0"],
    [ClarifyingQuestion, "a".repeat(200000) + "\0"],
    [PushToken, "a".repeat(200000) + " "],
  ];
  for (const [schema, value] of inputs) {
    const start = performance.now();
    assert.equal(schema.safeParse(value).success, false);
    const ms = performance.now() - start;
    assert.ok(
      ms < 50,
      `${String(value.length)} chars took ${ms.toFixed(1)} ms`,
    );
  }
});

test("viewSubject and topicFromSubject map each topic form both ways", () => {
  const pairs: [Topic, string][] = [
    ["tasks", "view.tasks"],
    ["budget", "view.budget"],
    ["agents", "view.agents"],
    ["notifications", "view.notifications"],
    [`task:${id}`, `view.task.${id}`],
    [`conversation:${id}`, `view.conversation.${id}`],
  ];
  for (const [topic, subject] of pairs) {
    assert.equal(viewSubject(topic), subject);
    assert.equal(topicFromSubject(subject), topic);
  }
});

test("topicFromSubject refuses a subject that is not a view subject", () => {
  for (const subject of [
    "tasks",
    "view.",
    "view.chat",
    `view.task.${id}.x`,
    `view.conversation.${id}.x`,
  ]) {
    assert.throws(() => topicFromSubject(subject), z.ZodError, subject);
  }
});

test("ViewMessageV1 refuses a type that is not the subject of the topic", () => {
  const result = ViewMessageV1.safeParse({
    ...viewMessage,
    type: `view.task.${id}`,
  });
  assert.ok(!result.success);
  assert.deepEqual(
    result.error.issues.map((issue) => issue.path),
    [["type"]],
  );
  assert.equal(
    ViewMessageV1.safeParse({
      ...viewMessage,
      payload: { ...view, topic: "budget" },
    }).success,
    false,
  );
});

test("PostOwnerMessage newTask is false by default", () => {
  assert.equal(
    PostOwnerMessageCommandPayloadV1.parse({ conversationId: id, text: "Hi" })
      .newTask,
    false,
  );
});

test("a reservation holds for 10 minutes by default", () => {
  assert.equal(ReserveFundsRequestV1.parse(reserve).ttlMs, 600000);
});

test("deltaSubject gives delta.<taskId>.<callId>", () => {
  assert.equal(deltaSubject(id, id2), `delta.${id}.${id2}`);
});

test("deltaSubject refuses a value that is not an Id", () => {
  const pairs: [string, string][] = [
    ["x", id],
    [id, upperId],
    [`${id}.>`, id],
    [id, "*"],
  ];
  for (const [taskId, callId] of pairs)
    assert.throws(() => deltaSubject(taskId, callId), z.ZodError);
});

const refusedAt = (schema: z.ZodType, value: unknown, path: string) => {
  const result = schema.safeParse(value);
  assert.ok(!result.success, JSON.stringify(value));
  assert.deepEqual(
    result.error.issues.map((issue) => issue.path.join(".")),
    [path],
  );
};

test("a soft cap above the hard cap is refused", () => {
  for (const schema of [SetBudgetCommandPayloadV1, BudgetSetEventPayloadV1])
    refusedAt(
      schema,
      { scope: everyMonth, hardCapMicroUsd: 10, softCapMicroUsd: 11 },
      "softCapMicroUsd",
    );
});

test("a message for a new task has no taskId", () => {
  refusedAt(
    PostOwnerMessageCommandPayloadV1,
    { conversationId: id, text: "Hi", taskId: id2, newTask: true },
    "taskId",
  );
});

test("conversationId and messageId of a task come together", () => {
  refusedAt(
    TaskSubmittedEventPayloadV1,
    { ...event.payload, conversationId: id },
    "messageId",
  );
  refusedAt(
    TaskSubmittedEventPayloadV1,
    { ...event.payload, messageId: id },
    "messageId",
  );
});

test("prompt variables and models come once", () => {
  refusedAt(
    PublishPromptVersionCommandPayloadV1,
    { promptId: id, text: "Hi", variables: ["a", "b", "a"] },
    "variables",
  );
  refusedAt(
    PublishAgentVersionCommandPayloadV1,
    { ...agentVersion, models: ["a/b", "a/b"] },
    "models",
  );
  refusedAt(
    CallRequestedEventPayloadV1,
    { ...requested, models: ["a/b", "c/d", "a/b"] },
    "models",
  );
});

const jsonBytes = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).length;

const messagesAtLimit = (char: string) => {
  const width = jsonBytes(char) - 2;
  const full = { role: "user", content: char.repeat(100000) };
  const count = Math.ceil(900000 / (width * 100000)) - 1;
  const head = Array.from({ length: count }, () => full);
  const rest = 900000 - jsonBytes([...head, { role: "user", content: "" }]);
  return [
    ...head,
    {
      role: "user",
      content: char.repeat(Math.floor(rest / width)) + "x".repeat(rest % width),
    },
  ];
};

test("the messages of a call have at most 900000 bytes as JSON", () => {
  for (const char of ["x", "\u4e2d", "\u0001", "\ud83d\ude00", "\ud800"]) {
    const messages = messagesAtLimit(char);
    assert.equal(jsonBytes(messages), 900000, JSON.stringify(char));
    assert.equal(
      CallRequestedEventPayloadV1.safeParse({ ...requested, messages }).success,
      true,
      JSON.stringify(char),
    );
    const last = messages.at(-1) ?? { role: "user", content: "" };
    refusedAt(
      CallRequestedEventPayloadV1,
      {
        ...requested,
        messages: [
          ...messages.slice(0, -1),
          { ...last, content: last.content + "x" },
        ],
      },
      "messages",
    );
  }
  refusedAt(
    CallRequestedEventPayloadV1,
    {
      ...requested,
      messages: Array.from({ length: 2 }, () => ({
        role: "user",
        content: "\u0001".repeat(100000),
      })),
    },
    "messages",
  );
});

test("the largest valid events and notices stay under the NATS limit of 1 MiB", () => {
  const worst = "\u0001".repeat(100000);
  const events = [
    {
      type: "orchestration.CallRequested",
      payload: { ...requested, messages: messagesAtLimit("\u0001") },
    },
    { type: "llm.CallCompleted", payload: { ...completed, text: worst } },
    {
      type: "conversation.AgentReplyPosted",
      payload: { ...reply, text: worst },
    },
    {
      type: "orchestration.RunCompleted",
      payload: { taskId: id, runId: id2, summary: worst, costMicroUsd: 1 },
    },
    {
      type: "prompts.PromptVersionPublished",
      payload: { ...promptVersion, text: worst },
    },
    {
      type: "conversation.OwnerMessagePosted",
      payload: { ...owned, text: worst.slice(0, 20000), intent: "new_task" },
    },
  ];
  for (const sample of events) {
    const value = { ...event, ...sample };
    assert.equal(RegisteredEvent.safeParse(value).success, true, sample.type);
    assert.ok(jsonBytes(value) < 1048576, sample.type);
  }
  const notice = {
    ...viewMessage,
    type: `view.conversation.${id}`,
    payload: {
      ...view,
      topic: `conversation:${id}`,
      data: { ...shown, role: "agent", taskId: id2, text: worst },
    },
  };
  assert.equal(ViewMessageV1.safeParse(notice).success, true);
  assert.equal(
    NoticeDataV1.conversation.safeParse(notice.payload.data).success,
    true,
  );
  assert.ok(jsonBytes(notice) < 1048576);
});

test("the notice data of each read model topic is its item schema", () => {
  assert.deepEqual(Object.keys(NoticeDataV1), [
    "tasks",
    "task",
    "budget",
    "agents",
    "conversation",
  ]);
  assert.equal(NoticeDataV1.tasks.safeParse(item).success, true);
  assert.equal(NoticeDataV1.task.safeParse(detail).success, true);
  assert.equal(NoticeDataV1.budget.safeParse(budgetMonth).success, true);
  assert.equal(NoticeDataV1.agents.safeParse(agentItem).success, true);
  assert.equal(
    NoticeDataV1.conversation.safeParse({
      ...shown,
      role: "agent",
      taskId: id2,
    }).success,
    true,
  );
});

test("rpc subjects start with rpc. so that no stream takes them", () => {
  assert.deepEqual(RpcSubject, {
    budgetReserve: "rpc.budget.reserve",
    budgetSettle: "rpc.budget.settle",
  });
});

test("the delta of a server message has the same rules as the core NATS body", () => {
  for (const body of [
    { attempt: 1, i: 0, text: "x" },
    { attempt: 1, i: -1, text: "x" },
    { attempt: 0, i: 0, text: "x" },
    { attempt: 1, i: 0, text: "x".repeat(16385) },
  ])
    assert.equal(
      ServerMessageV1.safeParse({
        type: "delta",
        taskId: id,
        callId: id2,
        ...body,
      }).success,
      DeltaV1.safeParse(body).success,
      JSON.stringify(body),
    );
});

test("parseEvent reads every M3 orchestration event", () => {
  for (const [type, payload] of m3Events) {
    const parsed = RegisteredEvent.parse({ ...event, type, payload });
    assert.equal(parsed.type, type);
  }
});

test("a plan is a DAG of known subtasks that each come once", () => {
  const ok = [
    plan,
    [
      subtaskA,
      { ...subtaskC, dependsOn: [id] },
      { ...subtaskB, dependsOn: [id3] },
    ],
  ];
  for (const subtasks of ok)
    assert.equal(PlanSubtasks.safeParse(subtasks).success, true);
  const refused: unknown[] = [
    [subtaskA, { ...subtaskB, subtaskId: id }],
    [subtaskA, { ...subtaskB, dependsOn: [id3] }],
    [{ ...subtaskA, dependsOn: [id] }],
    [
      { ...subtaskA, dependsOn: [id2] },
      { ...subtaskB, dependsOn: [id] },
    ],
    [
      subtaskA,
      { ...subtaskB, dependsOn: [id, id3] },
      { ...subtaskC, dependsOn: [id2] },
    ],
    Array.from({ length: 21 }, () => ({
      ...subtaskA,
      subtaskId: crypto.randomUUID(),
    })),
  ];
  for (const subtasks of refused) {
    refusedAt(PlanSubtasks, subtasks, "");
    for (const schema of [
      PlanProposedEventPayloadV1,
      PlanEditedEventPayloadV1,
      EditPlanCommandPayloadV1,
    ])
      refusedAt(schema, { ...proposed, subtasks }, "subtasks");
  }
  refusedAt(PlanSubtask, { ...subtaskC, dependsOn: [id, id] }, "dependsOn");
});

const worstPlan = () => {
  const ids = Array.from({ length: 20 }, () => crypto.randomUUID());
  const subtasks = ids.map((subtaskId, index) => ({
    subtaskId,
    title: "\u0001".repeat(200),
    instructions: "x",
    agentId: id,
    model: `a/${"b".repeat(198)}`,
    dependsOn: ids.slice(0, Math.min(index, 19)),
    needsApproval: true,
    estimatedCostMicroUsd: cap,
    estimatedDurationMs: 86400000,
  }));
  const each = Math.floor((200000 - jsonBytes(subtasks)) / 20 / 6);
  for (const subtask of subtasks) subtask.instructions += "\u0001".repeat(each);
  const last = subtasks.at(-1);
  if (last) last.instructions += "x".repeat(200000 - jsonBytes(subtasks));
  return subtasks;
};

test("all subtasks of a plan have at most 200000 bytes as JSON", () => {
  const subtasks = worstPlan();
  assert.equal(jsonBytes(subtasks), 200000);
  assert.equal(PlanSubtasks.safeParse(subtasks).success, true);
  const last = subtasks.at(-1);
  if (last) last.instructions += "x";
  refusedAt(PlanSubtasks, subtasks, "");
});

test("the largest valid M3 events and the task detail notice stay under 1 MiB", () => {
  const worst = "\u0001".repeat(1000);
  const output = "\u0001".repeat(100000);
  const events = [
    {
      type: "orchestration.PlanProposed",
      payload: { ...proposed, subtasks: worstPlan() },
    },
    {
      type: "orchestration.ClarificationRequested",
      payload: {
        taskId: id,
        questions: Array.from({ length: 5 }, () => worst),
      },
    },
    {
      type: "orchestration.SteeringMessageAdded",
      payload: { ...answered, runId: id2, text: "\u0001".repeat(20000) },
    },
    {
      type: "orchestration.SubtaskCompleted",
      payload: {
        ...payloadOf("orchestration.SubtaskCompleted"),
        text: output,
        costMicroUsd: cap,
      },
    },
    {
      type: "orchestration.CallSettled",
      payload: {
        ...payloadOf("orchestration.CallSettled"),
        text: output,
        costMicroUsd: cap,
      },
    },
  ];
  for (const sample of events) {
    const value = { ...event, ...sample };
    assert.equal(RegisteredEvent.safeParse(value).success, true, sample.type);
    assert.ok(jsonBytes(value) < 1048576, sample.type);
  }
  const ids = Array.from({ length: 20 }, () => crypto.randomUUID());
  const data = {
    ...detail,
    title: worst.slice(0, 200),
    plan: {
      planVersion: Number.MAX_SAFE_INTEGER,
      subtasks: ids.map((subtaskId, index) => ({
        subtaskId,
        title: worst.slice(0, 200),
        instructions: "\u0001".repeat(4000),
        agentId: id,
        model: `a/${"b".repeat(198)}`,
        dependsOn: ids.slice(0, Math.min(index, 19)),
        needsApproval: true,
        estimatedCostMicroUsd: cap,
        estimatedDurationMs: 86400000,
      })),
    },
    currentCall: { callId: id, kind: "subtask", subtaskId: id2 },
    subtasks: ids.map((subtaskId) => ({
      ...subtaskState,
      subtaskId,
      status: "awaiting_approval",
      tries: Number.MAX_SAFE_INTEGER,
      endedAt: now,
      retryAt: now,
      inputTokens: Number.MAX_SAFE_INTEGER,
      outputTokens: Number.MAX_SAFE_INTEGER,
      costMicroUsd: cap,
      reason: worst,
    })),
    checkpoints: ids.map((subtaskId) => ({
      ...checkpoint,
      checkpointId: subtaskId,
      subtaskId,
      reason: worst,
      status: "expired",
      comment: worst,
      deadline: now,
      resolvedAt: now,
    })),
    costMicroUsd: cap,
    reason: worst,
    rev: Number.MAX_SAFE_INTEGER,
    asOf: Number.MAX_SAFE_INTEGER,
  };
  const notice = {
    ...viewMessage,
    type: `view.task.${id}`,
    payload: { ...view, topic: `task:${id}`, data },
  };
  assert.equal(NoticeDataV1.task.safeParse(data).success, true);
  assert.equal(ViewMessageV1.safeParse(notice).success, true);
  assert.ok(jsonBytes(notice) < 1048576, String(jsonBytes(notice)));
});

test("the JSON Schema of a plan does not have the rules that are only in zod", () => {
  const cyclic = [
    { ...subtaskA, dependsOn: [id2] },
    { ...subtaskB, dependsOn: [id] },
  ];
  const json = z.fromJSONSchema(z.toJSONSchema(PlanSubtasks, { io: "input" }));
  assert.equal(json.safeParse(cyclic).success, true);
  assert.equal(PlanSubtasks.safeParse(cyclic).success, false);
});

test("the task detail keeps only the latest checkpoint of each subtask", () => {
  refusedAt(
    TaskDetailV1,
    {
      ...detail,
      checkpoints: [checkpoint, { ...checkpoint, checkpointId: id }],
    },
    "checkpoints",
  );
});

test("subtaskId comes with the call kind subtask only", () => {
  const settled = payloadOf("orchestration.CallSettled");
  for (const [schema, value] of [
    [CallSettledEventPayloadV1, without(settled, "subtaskId")],
    [CallSettledEventPayloadV1, { ...settled, kind: "check" }],
    [CallRequestedEventPayloadV1, { ...requested, subtaskId: id }],
    [CallRequestedEventPayloadV1, { ...requested, kind: "subtask" }],
    [
      CallRequestedEventPayloadV1,
      { ...requested, kind: "plan", subtaskId: id },
    ],
    [CallRef, { callId: id, kind: "subtask" }],
  ] as [z.ZodType, unknown][])
    refusedAt(schema, value, "subtaskId");
});

test("a message with a taskId has no mode", () => {
  refusedAt(
    PostOwnerMessageCommandPayloadV1,
    { conversationId: id, text: "Go on", taskId: id2, mode: "auto" },
    "mode",
  );
});

test("a new task message keeps its mode, and other intents have none", () => {
  const parsed = OwnerMessagePostedEventPayloadV1.parse({
    ...owned,
    intent: "steer",
    taskId: id,
    mode: "auto",
  });
  assert.equal("mode" in parsed, false);
  assert.deepEqual(
    OwnerMessagePostedEventPayloadV1.parse({
      ...owned,
      intent: "new_task",
      mode: "auto",
    }),
    { ...owned, intent: "new_task", mode: "auto" },
  );
});
