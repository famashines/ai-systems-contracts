import { z } from "zod";
import { Id, Timestamp } from "./common.ts";

export const TaskMode = z.enum(["auto", "approval"]);
export type TaskMode = z.infer<typeof TaskMode>;

export const TaskText = z
  .string()
  .max(20000)
  .regex(/^[^\0]*[^\0\s][^\0]*$/);

export const SubmitTaskCommandPayloadV1 = z.object({
  text: TaskText,
  mode: TaskMode.default("approval"),
});
export type SubmitTaskCommandPayloadV1 = z.infer<
  typeof SubmitTaskCommandPayloadV1
>;

export const TaskSubmittedEventPayloadV1 = z
  .object({
    taskId: Id,
    text: TaskText,
    mode: TaskMode,
  })
  .describe("The owner sent a task.");
export type TaskSubmittedEventPayloadV1 = z.infer<
  typeof TaskSubmittedEventPayloadV1
>;

export const TaskStatus = z.enum([
  "submitted",
  "clarifying",
  "planning",
  "awaiting_approval",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled",
  "rejected",
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskListItemV1 = z.object({
  taskId: Id,
  title: z.string().min(1).max(200),
  status: TaskStatus,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  rev: z.int().nonnegative(),
  asOf: z.int().min(1),
});
export type TaskListItemV1 = z.infer<typeof TaskListItemV1>;

export const TaskListResultV1 = z.object({
  items: z.array(TaskListItemV1),
  headSeq: z.int().nonnegative(),
});
export type TaskListResultV1 = z.infer<typeof TaskListResultV1>;
