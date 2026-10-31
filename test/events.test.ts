import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { defineEvents } from "../src/define-events.ts";
import {
  eventCatalog,
  eventRegistry,
  latest,
  parseEvent,
  TaskSubmittedEventPayloadV1,
} from "../src/index.ts";

const id = "0b9d3c4e-6f1a-4c2b-9d8e-7a6b5c4d3e2f";
const event = {
  eventId: id,
  type: "orchestration.TaskSubmitted",
  schemaVersion: 1,
  streamId: `task-${id}`,
  version: 1,
  occurredAt: "2026-10-31T09:15:00.000Z",
  correlationId: id,
  causationId: id,
  actor: { kind: "owner", id: "owner-1" },
  payload: { taskId: id, text: "Write a plan", mode: "approval" },
};
const firstIssuePath = (input: unknown) => {
  try {
    parseEvent(input);
  } catch (error) {
    if (error instanceof z.ZodError) return error.issues[0]?.path.join(".");
  }
  return "no error";
};

test("parseEvent returns a typed event", () => {
  const parsed = parseEvent(event);
  assert.equal(parsed.type, "orchestration.TaskSubmitted");
  assert.equal(parsed.schemaVersion, 1);
  assert.equal(parsed.payload.mode, "approval");
});

test("parseEvent strips the stored document fields", () => {
  const parsed = parseEvent({ ...event, _id: id, publishedAt: null });
  assert.equal("_id" in parsed, false);
  assert.equal("publishedAt" in parsed, false);
});

test("parseEvent rejects an unknown type", () => {
  assert.equal(
    firstIssuePath({ ...event, type: "orchestration.Unknown" }),
    "type",
  );
});

test("parseEvent rejects a schemaVersion that is not in the registry", () => {
  assert.equal(firstIssuePath({ ...event, schemaVersion: 2 }), "schemaVersion");
});

test("parseEvent rejects a bad payload", () => {
  assert.equal(
    firstIssuePath({ ...event, payload: { ...event.payload, mode: "manual" } }),
    "payload.mode",
  );
});

test("parseEvent rejects a bad envelope", () => {
  assert.equal(firstIssuePath({ ...event, eventId: "x" }), "eventId");
  assert.throws(() => parseEvent(null), z.ZodError);
});

test("the registry and each of its entries are frozen", () => {
  assert.equal(Object.isFrozen(eventRegistry), true);
  for (const versions of Object.values(eventRegistry))
    assert.equal(Object.isFrozen(versions), true);
});

test("parseEvent reads the events of each M2 context", () => {
  const samples = [
    {
      type: "conversation.OwnerMessagePosted",
      streamId: `conversation-${id}`,
      payload: {
        conversationId: id,
        messageId: id,
        text: "Hi",
        intent: "answer",
        taskId: id,
      },
    },
    {
      type: "llm.CallFailed",
      streamId: `call-${id}`,
      payload: {
        callId: id,
        attempt: 1,
        model: "openai/gpt-4o",
        errorClass: "timeout",
        reason: "No answer",
        costMicroUsd: 0,
      },
    },
    {
      type: "budget.ReservationExpired",
      streamId: "budget-month-2026-10",
      payload: { reservationId: id, amountMicroUsd: 25000 },
    },
    {
      type: "agents.AgentEnabled",
      streamId: `agent-${id}`,
      payload: { agentId: id },
    },
    {
      type: "prompts.PromptCreated",
      streamId: `prompt-${id}`,
      payload: { promptId: id, name: "Writer" },
    },
    {
      type: "orchestration.RunStarted",
      streamId: `task-${id}`,
      payload: { taskId: id, runId: id },
    },
  ];
  for (const sample of samples)
    assert.equal(parseEvent({ ...event, ...sample }).type, sample.type);
});

test("parseEvent refuses a steer message with no taskId", () => {
  assert.throws(
    () =>
      parseEvent({
        ...event,
        type: "conversation.OwnerMessagePosted",
        payload: {
          conversationId: id,
          messageId: id,
          text: "Hi",
          intent: "steer",
        },
      }),
    z.ZodError,
  );
});

test("latest gives the highest schemaVersion of a type", () => {
  const entry = latest("orchestration.TaskSubmitted");
  assert.equal(entry.schemaVersion, 1);
  assert.equal(entry.payload, TaskSubmittedEventPayloadV1);
});

test("catalog types use the <context>.<EventName> form", () => {
  for (const { type, schemaVersion } of eventCatalog) {
    assert.match(type, /^[a-z][a-zA-Z]*\.[A-Z][a-zA-Z0-9]*$/);
    assert.ok(Number.isInteger(schemaVersion) && schemaVersion >= 1);
  }
});

const fixture = defineEvents(
  Object.freeze({
    "test.Alpha": Object.freeze({
      1: z.object({ a: z.string() }),
      2: z.object({ a: z.string(), b: z.int() }),
    }),
    "test.Beta": Object.freeze({ 1: z.object({ c: z.boolean() }) }),
  }),
);
const base = { ...event, streamId: `test-${id}` };

test("a registry with two types and two versions parses each version", () => {
  const v1 = fixture.parse({
    ...base,
    type: "test.Alpha",
    schemaVersion: 1,
    payload: { a: "x" },
  });
  const v2 = fixture.parse({
    ...base,
    type: "test.Alpha",
    schemaVersion: 2,
    payload: { a: "x", b: 2 },
  });
  const beta = fixture.parse({
    ...base,
    type: "test.Beta",
    schemaVersion: 1,
    payload: { c: true },
  });
  assert.equal(v1.schemaVersion, 1);
  if (v2.type === "test.Alpha" && v2.schemaVersion === 2)
    assert.equal(v2.payload.b, 2);
  else assert.fail("expected test.Alpha v2");
  if (beta.type === "test.Beta") assert.equal(beta.payload.c, true);
  else assert.fail("expected test.Beta");
});

test("a registry with two versions checks the payload of the stated version", () => {
  assert.throws(
    () =>
      fixture.parse({
        ...base,
        type: "test.Alpha",
        schemaVersion: 2,
        payload: { a: "x" },
      }),
    z.ZodError,
  );
  assert.throws(
    () =>
      fixture.parse({
        ...base,
        type: "test.Beta",
        schemaVersion: 2,
        payload: { c: true },
      }),
    z.ZodError,
  );
});

test("a registry with two versions has a full catalog and the right latest", () => {
  assert.deepEqual(
    fixture.catalog.map(
      ({ type, schemaVersion }) => `${type}.v${String(schemaVersion)}`,
    ),
    ["test.Alpha.v1", "test.Alpha.v2", "test.Beta.v1"],
  );
  assert.equal(fixture.latest("test.Alpha").schemaVersion, 2);
  assert.equal(fixture.latest("test.Beta").schemaVersion, 1);
});
