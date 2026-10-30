import { z } from "zod";
import { EventEnvelopeV1 } from "./envelopes.ts";
import { TaskSubmittedEventPayloadV1 } from "./orchestration.ts";

export const eventRegistry = {
  "orchestration.TaskSubmitted": {
    schemaVersion: 1,
    payload: TaskSubmittedEventPayloadV1,
  },
} as const;

type Registry = typeof eventRegistry;
export type EventType = keyof Registry;
export const eventTypes = Object.keys(eventRegistry) as EventType[];

export type RegisteredEvent = {
  [T in EventType]: Omit<
    EventEnvelopeV1<z.infer<Registry[T]["payload"]>>,
    "type" | "schemaVersion"
  > & {
    type: T;
    schemaVersion: Registry[T]["schemaVersion"];
  };
}[EventType];

export const eventSchema = (type: EventType) => {
  const { schemaVersion, payload } = eventRegistry[type];
  return EventEnvelopeV1(payload).extend({
    type: z.literal(type),
    schemaVersion: z.literal(schemaVersion),
  });
};

export const RegisteredEvent = z.discriminatedUnion(
  "type",
  eventTypes.map(eventSchema) as [ReturnType<typeof eventSchema>],
) as unknown as z.ZodType<RegisteredEvent>;

export const parseEvent = (input: unknown): RegisteredEvent =>
  RegisteredEvent.parse(input);
