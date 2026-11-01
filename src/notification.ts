import { z } from "zod";
import { Id } from "./common.ts";

export const DevicePlatform = z.enum(["android"]);
export type DevicePlatform = z.infer<typeof DevicePlatform>;

export const PushToken = z
  .string()
  .max(4096, { abort: true })
  .regex(/^[\x21-\x7e]+$/);

export const RegisterDeviceCommandPayloadV1 = z.object({
  deviceId: Id,
  platform: DevicePlatform,
  token: PushToken,
});
export type RegisterDeviceCommandPayloadV1 = z.infer<
  typeof RegisterDeviceCommandPayloadV1
>;

export const UnregisterDeviceCommandPayloadV1 = z.object({ deviceId: Id });
export type UnregisterDeviceCommandPayloadV1 = z.infer<
  typeof UnregisterDeviceCommandPayloadV1
>;

export const PushKind = z.enum([
  "completed",
  "failed",
  "approval_needed",
  "budget",
]);
export type PushKind = z.infer<typeof PushKind>;

export const PushDataV1 = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal(["completed", "failed", "approval_needed"]),
    taskId: Id,
  }),
  z.object({ kind: z.literal("budget"), taskId: z.never().exactOptional() }),
]);
export type PushDataV1 = z.infer<typeof PushDataV1>;
