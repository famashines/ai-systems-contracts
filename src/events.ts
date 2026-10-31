import type { z } from "zod";
import { defineEvents, type EventsOf } from "./define-events.ts";
import { TaskSubmittedEventPayloadV1 } from "./orchestration.ts";

export const eventRegistry = Object.freeze({
  "orchestration.TaskSubmitted": Object.freeze({
    1: TaskSubmittedEventPayloadV1,
  }),
});

export type EventType = keyof typeof eventRegistry;
export type RegisteredEvent = EventsOf<typeof eventRegistry>;

const events = defineEvents(eventRegistry);

export const eventCatalog = events.catalog;
export const latest = events.latest;
export const RegisteredEvent: z.ZodType<RegisteredEvent> = events.schema;
export const parseEvent = events.parse;
