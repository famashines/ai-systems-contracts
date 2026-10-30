import { z } from "zod";
import { EventEnvelopeV1 } from "./envelopes.ts";
import { TaskSubmittedEventPayloadV1 } from "./orchestration.ts";

export const eventRegistry = Object.freeze({
  "orchestration.TaskSubmitted": Object.freeze({
    1: TaskSubmittedEventPayloadV1,
  }),
});

type Registry = typeof eventRegistry;
export type EventType = keyof Registry;

export type RegisteredEvent = {
  [T in EventType]: {
    [V in keyof Registry[T]]: Omit<
      EventEnvelopeV1<z.output<Registry[T][V]>>,
      "type" | "schemaVersion"
    > & { type: T; schemaVersion: V };
  }[keyof Registry[T]];
}[EventType];

const envelope = (type: string, schemaVersion: number, payload: z.ZodType) =>
  EventEnvelopeV1(payload).extend({
    type: z.literal(type),
    schemaVersion: z.literal(schemaVersion),
  });

export const eventCatalog = Object.entries(eventRegistry).flatMap(
  ([type, versions]) =>
    Object.entries(versions).map(([version, payload]) => ({
      type,
      schemaVersion: Number(version),
      payload,
      schema: envelope(type, Number(version), payload),
    })),
);

export const latest = (type: EventType) =>
  eventCatalog
    .filter((entry) => entry.type === type)
    .reduce((a, b) => (b.schemaVersion > a.schemaVersion ? b : a));

const oneOf = <T extends z.core.$ZodTypeDiscriminable>(
  key: string,
  options: T[],
) => z.discriminatedUnion(key, options as [T, ...T[]]);

const looseEvent: z.ZodType<EventEnvelopeV1> = oneOf(
  "type",
  [...Map.groupBy(eventCatalog, (entry) => entry.type).values()].map(
    (entries) =>
      oneOf(
        "schemaVersion",
        entries.map((entry) => entry.schema),
      ),
  ),
);

export const RegisteredEvent = looseEvent as z.ZodType<RegisteredEvent>;

export const parseEvent = (input: unknown): RegisteredEvent =>
  RegisteredEvent.parse(input);
