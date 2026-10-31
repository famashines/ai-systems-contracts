import { z } from "zod";

export const Id = z.stringFormat(
  "uuid",
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);
export type Id = z.infer<typeof Id>;

export const Timestamp = z.iso.datetime();
export type Timestamp = z.infer<typeof Timestamp>;

export const MicroUsd = z.int().nonnegative();
export type MicroUsd = z.infer<typeof MicroUsd>;

export const ActorKind = z.enum(["owner", "agent", "system"]);
export type ActorKind = z.infer<typeof ActorKind>;

export const Actor = z.object({
  kind: ActorKind,
  id: z.string().min(1).max(200),
});
export type Actor = z.infer<typeof Actor>;
