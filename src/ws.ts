import { z } from "zod";
import { Id } from "./common.ts";
import { ErrorCode } from "./errors.ts";

export const MAX_TOPICS = 50;

export const Topic = z.union([
  z.enum(["tasks", "budget", "agents", "notifications"]),
  z.templateLiteral(["task:", z.uuid()]),
]);
export type Topic = z.infer<typeof Topic>;

const Seq = z.int().nonnegative();
const Topics = z.array(Topic).min(1).max(MAX_TOPICS);
const Ping = z.object({ type: z.literal("ping"), t: z.number() });
const Pong = z.object({ type: z.literal("pong"), t: z.number() });

export const ClientMessageV1 = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hello"),
    v: z.literal(1),
    token: z.string().min(1),
    lastSeq: Seq.optional(),
  }),
  z.object({ type: z.literal("subscribe"), topics: Topics }),
  z.object({ type: z.literal("unsubscribe"), topics: Topics }),
  z.object({ type: z.literal("reauth"), token: z.string().min(1) }),
  Ping,
  Pong,
]);
export type ClientMessageV1 = z.infer<typeof ClientMessageV1>;

export const ServerMessageV1 = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("welcome"),
    sessionId: Id,
    headSeq: Seq,
    heartbeatMs: z.int().positive(),
  }),
  z.object({ type: z.literal("subscribed"), topics: Topics, fromSeq: Seq }),
  z.object({
    type: z.literal("notice"),
    seq: z.int().positive(),
    topic: Topic,
    docId: z.string().min(1),
    rev: z.int().nonnegative(),
    data: z.unknown(),
  }),
  z.object({
    type: z.literal("delta"),
    taskId: Id,
    callId: Id,
    i: z.int().nonnegative(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("resync"),
    reason: z.enum(["too_old", "server_restart"]),
  }),
  z.object({ type: z.literal("error"), code: ErrorCode, message: z.string() }),
  Ping,
  Pong,
]);
export type ServerMessageV1 = z.infer<typeof ServerMessageV1>;

export const WsCloseCode = {
  badMessage: 4400,
  auth: 4401,
  forbiddenTopic: 4403,
  slowConsumer: 4408,
  rateLimit: 4429,
  serverRestart: 1012,
} as const;
export type WsCloseCode = (typeof WsCloseCode)[keyof typeof WsCloseCode];
