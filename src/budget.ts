import { z } from "zod";
import { DurationMs, Id, MicroUsd, Reason, Timestamp } from "./common.ts";

export const RpcSubject = {
  budgetReserve: "rpc.budget.reserve",
  budgetSettle: "rpc.budget.settle",
} as const;
export type RpcSubject = (typeof RpcSubject)[keyof typeof RpcSubject];

export const BudgetMonth = z
  .string()
  .max(7, { abort: true })
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const IdScope = z.object({
  kind: z.literal(["project", "agent", "task"]),
  key: Id,
});

export const BudgetScope = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("month"), key: BudgetMonth }),
  IdScope,
]);
export type BudgetScope = z.infer<typeof BudgetScope>;

export const CapScope = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("month"), key: z.never().exactOptional() }),
  IdScope,
]);
export type CapScope = z.infer<typeof CapScope>;

export const CapMicroUsd = MicroUsd.max(1_000_000_000_000);

export const SetBudgetCommandPayloadV1 = z
  .object({
    scope: CapScope,
    hardCapMicroUsd: CapMicroUsd,
    softCapMicroUsd: CapMicroUsd.exactOptional(),
  })
  .refine(
    (budget) =>
      budget.softCapMicroUsd === undefined ||
      budget.softCapMicroUsd <= budget.hardCapMicroUsd,
    {
      message: "The soft cap is not above the hard cap",
      path: ["softCapMicroUsd"],
    },
  );
export type SetBudgetCommandPayloadV1 = z.infer<
  typeof SetBudgetCommandPayloadV1
>;

export const ReserveFundsRequestV1 = z.object({
  reservationId: Id,
  taskId: Id,
  agentId: Id,
  amountMicroUsd: MicroUsd,
  ttlMs: DurationMs.default(600000),
});
export type ReserveFundsRequestV1 = z.infer<typeof ReserveFundsRequestV1>;

export const ReserveFundsReplyV1 = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), reservationId: Id, expiresAt: Timestamp }),
  z.object({
    ok: z.literal(false),
    reservationId: Id,
    scope: BudgetScope,
    reason: Reason,
  }),
]);
export type ReserveFundsReplyV1 = z.infer<typeof ReserveFundsReplyV1>;

export const SettleReservationRequestV1 = z.object({
  reservationId: Id,
  actualMicroUsd: MicroUsd,
});
export type SettleReservationRequestV1 = z.infer<
  typeof SettleReservationRequestV1
>;

export const SettleReservationReplyV1 = z.discriminatedUnion("state", [
  z.object({
    state: z.literal(["settled", "already_settled"]),
    reservationId: Id,
    actualMicroUsd: MicroUsd,
  }),
  z.object({
    state: z.literal("expired"),
    reservationId: Id,
    amountMicroUsd: MicroUsd,
  }),
  z.object({ state: z.literal("unknown"), reservationId: Id }),
]);
export type SettleReservationReplyV1 = z.infer<typeof SettleReservationReplyV1>;

export const BudgetSetEventPayloadV1 = SetBudgetCommandPayloadV1.describe(
  "A cap for a scope: a hard amount and an optional soft amount. The month cap applies to every month.",
);
export type BudgetSetEventPayloadV1 = SetBudgetCommandPayloadV1;

const reservation = { reservationId: Id, taskId: Id, agentId: Id };

export const FundsReservedEventPayloadV1 = z
  .object({
    ...reservation,
    scopes: z.array(BudgetScope).min(1).max(4),
    amountMicroUsd: MicroUsd,
    expiresAt: Timestamp,
  })
  .describe("Money is held for a call. Answer to `rpc.budget.reserve`.");
export type FundsReservedEventPayloadV1 = z.infer<
  typeof FundsReservedEventPayloadV1
>;

export const ReservationRefusedEventPayloadV1 = z
  .object({
    ...reservation,
    scope: BudgetScope,
    amountMicroUsd: MicroUsd,
    reason: Reason,
  })
  .describe(
    "A scope has no room for the call. Answer to `rpc.budget.reserve`.",
  );
export type ReservationRefusedEventPayloadV1 = z.infer<
  typeof ReservationRefusedEventPayloadV1
>;

export const ReservationSettledEventPayloadV1 = z
  .object({
    reservationId: Id,
    reservedMicroUsd: MicroUsd,
    actualMicroUsd: MicroUsd,
  })
  .describe(
    "The real cost is booked in full, also above the reserved amount, and the rest of the hold is free.",
  );
export type ReservationSettledEventPayloadV1 = z.infer<
  typeof ReservationSettledEventPayloadV1
>;

export const ReservationExpiredEventPayloadV1 = z
  .object({ reservationId: Id, amountMicroUsd: MicroUsd })
  .describe(
    "No settle came in time. The full reserved amount is booked as spent.",
  );
export type ReservationExpiredEventPayloadV1 = z.infer<
  typeof ReservationExpiredEventPayloadV1
>;

export const ThresholdCrossedEventPayloadV1 = z
  .object({
    scope: BudgetScope,
    cap: z.enum(["soft", "hard"]),
    percent: z.literal([50, 80, 100]),
    spentMicroUsd: MicroUsd,
    capMicroUsd: CapMicroUsd,
  })
  .describe("Spend went over 50, 80 or 100% of a soft or hard cap.");
export type ThresholdCrossedEventPayloadV1 = z.infer<
  typeof ThresholdCrossedEventPayloadV1
>;

export const BudgetMonthV1 = z.object({
  month: BudgetMonth,
  capMicroUsd: CapMicroUsd,
  softCapMicroUsd: CapMicroUsd.exactOptional(),
  spentMicroUsd: MicroUsd,
  reservedMicroUsd: MicroUsd,
  remainingMicroUsd: MicroUsd,
  rev: z.int().nonnegative(),
});
export type BudgetMonthV1 = z.infer<typeof BudgetMonthV1>;
