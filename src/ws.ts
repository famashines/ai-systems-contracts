import { z } from "zod";
import { Id } from "./common.ts";
import { ErrorCode } from "./errors.ts";

export const WsLimits = {
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
} as const;

export const Topic = z.union([
  z.enum(["tasks", "budget", "agents", "notifications"]),
  z.templateLiteral(["task:", Id]),
  z.templateLiteral(["conversation:", Id]),
]);
export type Topic = z.infer<typeof Topic>;

export const DeltaV1 = z.object({
  i: z.int().nonnegative(),
  text: z.string().max(16384),
});
export type DeltaV1 = z.infer<typeof DeltaV1>;

export const deltaSubject = (taskId: Id, callId: Id) =>
  `delta.${taskId}.${callId}` as const;

const Seq = z.int().nonnegative();
const Token = z.string().min(1).max(8192);
const Topics = z.array(Topic).min(1).max(WsLimits.maxTopics);

export const ClientMessageV1 = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("hello"),
    v: z.literal(1),
    token: Token,
    lastSeq: Seq.exactOptional(),
  }),
  z.strictObject({ type: z.literal("subscribe"), topics: Topics }),
  z.strictObject({ type: z.literal("unsubscribe"), topics: Topics }),
  z.strictObject({ type: z.literal("reauth"), token: Token }),
  z.strictObject({ type: z.literal("ping"), t: z.number() }),
  z.strictObject({ type: z.literal("pong"), t: z.number() }),
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
  z.object({ type: z.literal("unsubscribed"), topics: Topics }),
  z.object({
    type: z.literal("notice"),
    seq: z.int().positive(),
    topic: Topic,
    docId: z.string().min(1).max(200),
    rev: z.int().nonnegative(),
    commandId: Id.exactOptional(),
    data: z.unknown(),
  }),
  z.object({
    type: z.literal("delta"),
    taskId: Id,
    callId: Id,
    ...DeltaV1.shape,
  }),
  z.object({
    type: z.literal("resync"),
    reason: z.enum(["too_old"]),
  }),
  z.object({
    type: z.literal("error"),
    code: ErrorCode,
    message: z.string().max(1000),
  }),
  z.object({ type: z.literal("ping"), t: z.number() }),
  z.object({ type: z.literal("pong"), t: z.number() }),
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
