import { z } from "zod";

export const Id = z.uuid();
export type Id = z.infer<typeof Id>;

export const Timestamp = z.iso.datetime();
export type Timestamp = z.infer<typeof Timestamp>;

export const MicroUsd = z.int().nonnegative();
export type MicroUsd = z.infer<typeof MicroUsd>;

export const ActorKind = z.enum(["owner", "agent", "system"]);
export type ActorKind = z.infer<typeof ActorKind>;

export const Actor = z.object({
  kind: ActorKind,
  id: z.string().min(1),
});
export type Actor = z.infer<typeof Actor>;
