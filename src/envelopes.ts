import { z } from "zod";
import { Actor, Id, Timestamp } from "./common.ts";

export const MessageType = z
  .string()
  .regex(/^[a-z][a-zA-Z]*\.[A-Z][a-zA-Z0-9]*$/);
export const StreamId = z.string().regex(/^[a-z][a-z0-9]*-\S+$/);

export const EventEnvelopeV1 = <P extends z.ZodType>(payload: P) =>
  z.object({
    eventId: Id,
    type: MessageType,
    schemaVersion: z.int().min(1),
    streamId: StreamId,
    version: z.int().min(1),
    occurredAt: Timestamp,
    correlationId: Id,
    causationId: Id,
    actor: Actor,
    payload,
  });
export type EventEnvelopeV1<P = unknown> = Omit<
  z.infer<ReturnType<typeof EventEnvelopeV1<z.ZodUnknown>>>,
  "payload"
> & { payload: P };

export const CommandEnvelopeV1 = <P extends z.ZodType>(payload: P) =>
  z.object({
    commandId: Id,
    type: MessageType,
    expectedVersion: z.int().nonnegative().optional(),
    actor: Actor,
    payload,
  });
export type CommandEnvelopeV1<P = unknown> = Omit<
  z.infer<ReturnType<typeof CommandEnvelopeV1<z.ZodUnknown>>>,
  "payload"
> & { payload: P };
