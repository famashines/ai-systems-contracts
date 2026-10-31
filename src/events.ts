import type { z } from "zod";
import {
  AgentCreatedEventPayloadV1,
  AgentDisabledEventPayloadV1,
  AgentEnabledEventPayloadV1,
  AgentVersionActivatedEventPayloadV1,
  AgentVersionPublishedEventPayloadV1,
} from "./agents.ts";
import {
  BudgetSetEventPayloadV1,
  FundsReservedEventPayloadV1,
  ReservationExpiredEventPayloadV1,
  ReservationRefusedEventPayloadV1,
  ReservationSettledEventPayloadV1,
  ThresholdCrossedEventPayloadV1,
} from "./budget.ts";
import {
  AgentReplyPostedEventPayloadV1,
  ConversationStartedEventPayloadV1,
  OwnerMessagePostedEventPayloadV1,
} from "./conversation.ts";
import { defineEvents, type EventsOf } from "./define-events.ts";
import {
  CallCompletedEventPayloadV1,
  CallFailedEventPayloadV1,
  CallStartedEventPayloadV1,
} from "./llm.ts";
import {
  CallRequestedEventPayloadV1,
  MessageRefusedEventPayloadV1,
  RunCompletedEventPayloadV1,
  RunFailedEventPayloadV1,
  RunBlockedEventPayloadV1,
  RunStartedEventPayloadV1,
  TaskSubmittedEventPayloadV1,
} from "./orchestration.ts";
import {
  PromptCreatedEventPayloadV1,
  PromptVersionPublishedEventPayloadV1,
} from "./prompts.ts";

export const eventRegistry = Object.freeze({
  "orchestration.TaskSubmitted": Object.freeze({
    1: TaskSubmittedEventPayloadV1,
  }),
  "orchestration.RunStarted": Object.freeze({ 1: RunStartedEventPayloadV1 }),
  "orchestration.RunCompleted": Object.freeze({
    1: RunCompletedEventPayloadV1,
  }),
  "orchestration.RunFailed": Object.freeze({ 1: RunFailedEventPayloadV1 }),
  "orchestration.RunBlocked": Object.freeze({ 1: RunBlockedEventPayloadV1 }),
  "orchestration.CallRequested": Object.freeze({
    1: CallRequestedEventPayloadV1,
  }),
  "orchestration.MessageRefused": Object.freeze({
    1: MessageRefusedEventPayloadV1,
  }),
  "conversation.ConversationStarted": Object.freeze({
    1: ConversationStartedEventPayloadV1,
  }),
  "conversation.OwnerMessagePosted": Object.freeze({
    1: OwnerMessagePostedEventPayloadV1,
  }),
  "conversation.AgentReplyPosted": Object.freeze({
    1: AgentReplyPostedEventPayloadV1,
  }),
  "prompts.PromptCreated": Object.freeze({ 1: PromptCreatedEventPayloadV1 }),
  "prompts.PromptVersionPublished": Object.freeze({
    1: PromptVersionPublishedEventPayloadV1,
  }),
  "llm.CallStarted": Object.freeze({ 1: CallStartedEventPayloadV1 }),
  "llm.CallCompleted": Object.freeze({ 1: CallCompletedEventPayloadV1 }),
  "llm.CallFailed": Object.freeze({ 1: CallFailedEventPayloadV1 }),
  "budget.BudgetSet": Object.freeze({ 1: BudgetSetEventPayloadV1 }),
  "budget.FundsReserved": Object.freeze({ 1: FundsReservedEventPayloadV1 }),
  "budget.ReservationRefused": Object.freeze({
    1: ReservationRefusedEventPayloadV1,
  }),
  "budget.ReservationSettled": Object.freeze({
    1: ReservationSettledEventPayloadV1,
  }),
  "budget.ReservationExpired": Object.freeze({
    1: ReservationExpiredEventPayloadV1,
  }),
  "budget.ThresholdCrossed": Object.freeze({
    1: ThresholdCrossedEventPayloadV1,
  }),
  "agents.AgentCreated": Object.freeze({ 1: AgentCreatedEventPayloadV1 }),
  "agents.AgentVersionPublished": Object.freeze({
    1: AgentVersionPublishedEventPayloadV1,
  }),
  "agents.AgentVersionActivated": Object.freeze({
    1: AgentVersionActivatedEventPayloadV1,
  }),
  "agents.AgentEnabled": Object.freeze({ 1: AgentEnabledEventPayloadV1 }),
  "agents.AgentDisabled": Object.freeze({ 1: AgentDisabledEventPayloadV1 }),
});

export type EventType = keyof typeof eventRegistry;
export type RegisteredEvent = EventsOf<typeof eventRegistry>;

const events = defineEvents(eventRegistry);

export const eventCatalog = events.catalog;
export const latest = events.latest;
export const RegisteredEvent: z.ZodType<RegisteredEvent> = events.schema;
export const parseEvent = events.parse;
