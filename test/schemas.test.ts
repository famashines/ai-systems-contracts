import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import {
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
  rev: 9,
};

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
    ],
    [
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
    ],
    [
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
    [failed, without({ ...failed, errorClass: "invalid" }, "nextModel")],
    [
      ...badMoney.map((costMicroUsd) => ({ ...failed, costMicroUsd })),
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
    [budgetMonth, { ...budgetMonth, softCapMicroUsd: 10_000_000 }],
    [
      ...badMoney.map((spentMicroUsd) => ({ ...budgetMonth, spentMicroUsd })),
      ...badMoney.map((remainingMicroUsd) => ({
        ...budgetMonth,
        remainingMicroUsd,
      })),
      { ...budgetMonth, capMicroUsd: 1_000_000_000_001 },
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
    [ReplyText, "a".repeat(200000) + "\0"],
    [PromptVariable, "a".repeat(200000) + "!"],
    [ModelId, "a".repeat(200000)],
    [AgentName, "a".repeat(200000) + "!"],
    [BudgetMonth, "2".repeat(200000)],
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

test("the messages of a call have at most 400000 characters together", () => {
  const message = { role: "user", content: "x".repeat(100000) };
  assert.equal(
    CallRequestedEventPayloadV1.safeParse({
      ...requested,
      messages: Array.from({ length: 4 }, () => message),
    }).success,
    true,
  );
  refusedAt(
    CallRequestedEventPayloadV1,
    {
      ...requested,
      messages: [
        ...Array.from({ length: 4 }, () => message),
        { role: "user", content: "x" },
      ],
    },
    "messages",
  );
});

test("the notice data of each read model topic is its item schema", () => {
  assert.deepEqual(Object.keys(NoticeDataV1), [
    "tasks",
    "budget",
    "agents",
    "conversation",
  ]);
  assert.equal(NoticeDataV1.tasks.safeParse(item).success, true);
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
