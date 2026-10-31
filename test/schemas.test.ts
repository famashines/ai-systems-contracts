import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import {
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
  PublishAgentVersionCommandPayloadV1,
  PublishPromptVersionCommandPayloadV1,
  Reason,
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
  callId: id,
  attempt: 1,
  model: "openai/gpt-4o-mini",
  agent: { agentId: id2, version: 1 },
  reservationId: id2,
};
const completed = {
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
  callId: id2,
  scopes: [month, { kind: "task", key: id2 }],
  worstCaseMicroUsd: 25_000,
};
const reserved = {
  reservationId: id,
  callId: id2,
  scopes: [month],
  amountMicroUsd: 25_000,
  expiresAt: now,
};
const refusal = {
  reservationId: id,
  callId: id2,
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
];

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
    ["submitted", "awaiting_approval", "cancelled"],
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
      { type: "delta", taskId: id, callId: id, i: 0, text: "Hel" },
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
      { type: "delta", taskId: id, callId: id, i: 1.5, text: "x" },
      { type: "delta", taskId: upperId, callId: id, i: 0, text: "x" },
      { type: "error", code: "oops", message: "x" },
      { type: "error", code: "internal", message: "x".repeat(1001) },
      { type: "delta", taskId: id, callId: id, i: -1, text: "x" },
      { type: "delta", taskId: id, callId: id, i: 0, text: "x".repeat(16385) },
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
      { i: 0, text: "" },
      { i: 7, text: "x".repeat(16384) },
    ],
    [
      { i: -1, text: "x" },
      { i: 1.5, text: "x" },
      { i: "0", text: "x" },
      { i: 0, text: "x".repeat(16385) },
      { i: 0 },
      { text: "x" },
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
      { conversationId: id, text: "Hi", intent: "new_task" },
    ],
  ],
  [
    "AgentReplyPostedEventPayloadV1",
    AgentReplyPostedEventPayloadV1,
    [reply, without(reply, "runId")],
    [
      { ...reply, sourceEventId: "x" },
      { ...reply, text: "" },
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
    [{ taskId: id, runId: id2, summary: "Done", costMicroUsd: 0 }],
    [
      ...badMoney.map((costMicroUsd) => ({
        taskId: id,
        runId: id2,
        summary: "Done",
        costMicroUsd,
      })),
      { taskId: id, runId: id2, summary: "", costMicroUsd: 1 },
      { taskId: id, runId: id2, summary: "Done" },
    ],
  ],
  [
    "RunFailedEventPayloadV1",
    RunFailedEventPayloadV1,
    [{ taskId: id, runId: id2, code: "budget_refused", reason: "Cap reached" }],
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
      { ...started, agent: { agentId: id2 } },
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
      { scope: month, hardCapMicroUsd: 20_000_000 },
      { scope: month, hardCapMicroUsd: 0, softCapMicroUsd: 0 },
    ],
    [
      ...badMoney.map((hardCapMicroUsd) => ({ scope: month, hardCapMicroUsd })),
      ...badMoney.map((softCapMicroUsd) => ({
        scope: month,
        hardCapMicroUsd: 1,
        softCapMicroUsd,
      })),
      { hardCapMicroUsd: 1 },
    ],
  ],
  [
    "BudgetSetEventPayloadV1",
    BudgetSetEventPayloadV1,
    [{ scope: month, hardCapMicroUsd: 20_000_000, softCapMicroUsd: 10 }],
    [{ scope: month, hardCapMicroUsd: 0.01 }],
  ],
  [
    "ReserveFundsRequestV1",
    ReserveFundsRequestV1,
    [
      reserve,
      { ...reserve, worstCaseMicroUsd: 0, maxDurationMs: 3600000 },
      { ...reserve, maxDurationMs: 1000 },
    ],
    [
      ...badMoney.map((worstCaseMicroUsd) => ({
        ...reserve,
        worstCaseMicroUsd,
      })),
      { ...reserve, scopes: [] },
      { ...reserve, scopes: Array.from({ length: 5 }, () => month) },
      { ...reserve, maxDurationMs: 999 },
      { ...reserve, maxDurationMs: 3600001 },
      { ...reserve, reservationId: upperId },
      { ...reserve, callId: undefined },
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
    "FundsReservedEventPayloadV1",
    FundsReservedEventPayloadV1,
    [reserved],
    [
      ...badMoney.map((amountMicroUsd) => ({ ...reserved, amountMicroUsd })),
      { ...reserved, scopes: [] },
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
  assert.equal(ReserveFundsRequestV1.parse(reserve).maxDurationMs, 600000);
});

test("deltaSubject gives delta.<taskId>.<callId>", () => {
  assert.equal(deltaSubject(id, id2), `delta.${id}.${id2}`);
});

test("rpc subjects start with rpc. so that no stream takes them", () => {
  assert.deepEqual(RpcSubject, {
    budgetReserve: "rpc.budget.reserve",
    budgetSettle: "rpc.budget.settle",
  });
});

test("the delta of a server message has the same rules as the core NATS body", () => {
  for (const body of [
    { i: 0, text: "x" },
    { i: -1, text: "x" },
    { i: 0, text: "x".repeat(16385) },
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
