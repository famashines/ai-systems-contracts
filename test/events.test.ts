import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
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

test("the registry is frozen", () => {
  assert.equal(Object.isFrozen(eventRegistry), true);
  assert.equal(
    Object.isFrozen(eventRegistry["orchestration.TaskSubmitted"]),
    true,
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
