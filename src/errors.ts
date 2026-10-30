import { z } from "zod";

export const ErrorCode = z.enum([
  "validation_failed",
  "not_found",
  "conflict",
  "unauthorized",
  "forbidden",
  "rate_limited",
  "internal",
  "unavailable",
  "budget_refused",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const ProblemJson = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.int().min(400).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: ErrorCode,
});
export type ProblemJson = z.infer<typeof ProblemJson>;
