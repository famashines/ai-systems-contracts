import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import {
  Actor,
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
    ["tasks", "budget", "agents", "notifications", `task:${id}`],
    ["task", "task:1", "chat", `task:${upperId}`],
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
      { type: "resync", reason: "too_old" },
      { type: "resync", reason: "server_restart" },
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
      { type: "error", code: "oops", message: "x" },
      { type: "error", code: "internal", message: "x".repeat(1001) },
      { type: "delta", taskId: id, callId: id, i: -1, text: "x" },
      { type: "delta", taskId: id, callId: id, i: 0, text: "x".repeat(16385) },
    ],
  ],
  ["ErrorCode", ErrorCode, errorCodes, ["teapot"]],
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
