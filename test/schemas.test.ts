import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import {
  Actor,
  ClientMessageV1,
  CommandEnvelopeV1,
  ErrorCode,
  EventEnvelopeV1,
  Id,
  MicroUsd,
  ProblemJson,
  RegisteredEvent,
  ServerMessageV1,
  SubmitTaskCommandPayloadV1,
  TaskListItemV1,
  TaskListResultV1,
  TaskStatus,
  TaskSubmittedEventPayloadV1,
  Timestamp,
  Topic,
  WsCloseCode,
} from "../src/index.ts";

const id = "0b9d3c4e-6f1a-4c2b-9d8e-7a6b5c4d3e2f";
const now = "2026-10-31T09:15:00.000Z";
const actor = { kind: "owner", id: "owner-1" };
const item = {
  taskId: id,
  title: "Plan",
  status: "submitted",
  createdAt: now,
  updatedAt: now,
  rev: 1,
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

const cases: [string, z.ZodType, unknown[], unknown[]][] = [
  ["Id", Id, [id], ["x", "", 1]],
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
    [{ kind: "user", id: "a" }, { kind: "owner", id: "" }, { kind: "owner" }],
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
    ],
  ],
  [
    "CommandEnvelopeV1",
    CommandEnvelopeV1(SubmitTaskCommandPayloadV1),
    [
      {
        commandId: id,
        type: "orchestration.SubmitTask",
        actor,
        payload: { text: "Hi" },
      },
      {
        commandId: id,
        type: "orchestration.SubmitTask",
        expectedVersion: 0,
        actor,
        payload: { text: "Hi" },
      },
    ],
    [
      {
        commandId: "1",
        type: "orchestration.SubmitTask",
        actor,
        payload: { text: "Hi" },
      },
      {
        commandId: id,
        type: "orchestration.SubmitTask",
        expectedVersion: -1,
        actor,
        payload: { text: "Hi" },
      },
      {
        commandId: id,
        type: "orchestration.SubmitTask",
        actor,
        payload: { text: "" },
      },
    ],
  ],
  [
    "SubmitTaskCommandPayloadV1",
    SubmitTaskCommandPayloadV1,
    [{ text: "Hi" }, { text: "x".repeat(20000), mode: "auto" }],
    [
      { text: "" },
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
    ["task", "task:1", "chat"],
  ],
  [
    "ClientMessageV1",
    ClientMessageV1,
    [
      { type: "hello", v: 1, token: "t" },
      { type: "hello", v: 1, token: "t", lastSeq: 42 },
      { type: "subscribe", topics: ["tasks", `task:${id}`] },
      { type: "unsubscribe", topics: ["budget"] },
      { type: "reauth", token: "t2" },
      { type: "ping", t: 1 },
      { type: "pong", t: 1 },
    ],
    [
      { type: "hello", v: 2, token: "t" },
      { type: "hello", v: 1, token: "" },
      { type: "subscribe", topics: [] },
      { type: "subscribe", topics: Array.from({ length: 51 }, () => "tasks") },
      { type: "welcome", sessionId: id, headSeq: 0, heartbeatMs: 20000 },
      { type: "ping" },
    ],
  ],
  [
    "ServerMessageV1",
    ServerMessageV1,
    [
      { type: "welcome", sessionId: id, headSeq: 0, heartbeatMs: 20000 },
      { type: "subscribed", topics: ["tasks"], fromSeq: 5 },
      { type: "notice", seq: 6, topic: "tasks", docId: id, rev: 2, data: item },
      { type: "delta", taskId: id, callId: id, i: 0, text: "Hel" },
      { type: "resync", reason: "too_old" },
      { type: "resync", reason: "server_restart" },
      { type: "error", code: "forbidden", message: "Topic is not allowed" },
      { type: "ping", t: 1 },
      { type: "pong", t: 1 },
    ],
    [
      { type: "hello", v: 1, token: "t" },
      { type: "notice", seq: 0, topic: "tasks", docId: id, rev: 2, data: {} },
      { type: "resync", reason: "later" },
      { type: "error", code: "oops", message: "x" },
      { type: "delta", taskId: id, callId: id, i: -1, text: "x" },
    ],
  ],
  [
    "ErrorCode",
    ErrorCode,
    [
      "validation_failed",
      "not_found",
      "conflict",
      "unauthorized",
      "forbidden",
      "rate_limited",
      "internal",
      "unavailable",
      "budget_refused",
    ],
    ["teapot"],
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

test("close codes match ARCHITECTURE 10.2", () => {
  assert.deepEqual(
    Object.values(WsCloseCode).sort(),
    [1012, 4400, 4401, 4403, 4408, 4429],
  );
});
