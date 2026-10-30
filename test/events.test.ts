import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { eventTypes, parseEvent } from "../src/index.ts";

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

test("parseEvent returns a typed event", () => {
  const parsed = parseEvent(event);
  assert.equal(parsed.type, "orchestration.TaskSubmitted");
  assert.equal(parsed.payload.mode, "approval");
});

test("parseEvent rejects an unknown type", () => {
  assert.throws(
    () => parseEvent({ ...event, type: "orchestration.Unknown" }),
    (error: unknown) =>
      error instanceof z.ZodError && error.issues[0]?.path[0] === "type",
  );
});

test("parseEvent rejects a bad payload", () => {
  assert.throws(
    () =>
      parseEvent({ ...event, payload: { ...event.payload, mode: "manual" } }),
    (error: unknown) =>
      error instanceof z.ZodError &&
      error.issues[0]?.path.join(".") === "payload.mode",
  );
});

test("parseEvent rejects a wrong schemaVersion", () => {
  assert.throws(() => parseEvent({ ...event, schemaVersion: 2 }), z.ZodError);
});

test("parseEvent rejects a bad envelope", () => {
  assert.throws(() => parseEvent({ ...event, eventId: "x" }), z.ZodError);
  assert.throws(() => parseEvent(null), z.ZodError);
});

test("registry types use the <context>.<EventName> form", () => {
  for (const type of eventTypes)
    assert.match(type, /^[a-z][a-zA-Z]*\.[A-Z][a-zA-Z0-9]*$/);
});
