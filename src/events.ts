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
  ClarificationRequestedEventPayloadV1,
  ClarificationAnsweredEventPayloadV1,
  PlanProposedEventPayloadV1,
  PlanEditedEventPayloadV1,
  PlanApprovedEventPayloadV1,
  PlanRejectedEventPayloadV1,
  SubtaskQueuedEventPayloadV1,
  SubtaskWaitingEventPayloadV1,
  SubtaskStartedEventPayloadV1,
  SubtaskCompletedEventPayloadV1,
  SubtaskFailedEventPayloadV1,
  SubtaskRetryingEventPayloadV1,
  SubtaskBlockedEventPayloadV1,
  SubtaskReassignedEventPayloadV1,
  CheckpointOpenedEventPayloadV1,
  CheckpointResolvedEventPayloadV1,
  RunPausedEventPayloadV1,
  RunResumedEventPayloadV1,
  RunCancelledEventPayloadV1,
  TaskModeChangedEventPayloadV1,
  SteeringMessageAddedEventPayloadV1,
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
  "orchestration.ClarificationRequested": Object.freeze({
    1: ClarificationRequestedEventPayloadV1,
  }),
  "orchestration.ClarificationAnswered": Object.freeze({
    1: ClarificationAnsweredEventPayloadV1,
  }),
  "orchestration.PlanProposed": Object.freeze({
    1: PlanProposedEventPayloadV1,
  }),
  "orchestration.PlanEdited": Object.freeze({ 1: PlanEditedEventPayloadV1 }),
  "orchestration.PlanApproved": Object.freeze({
    1: PlanApprovedEventPayloadV1,
  }),
  "orchestration.PlanRejected": Object.freeze({
    1: PlanRejectedEventPayloadV1,
  }),
  "orchestration.SubtaskQueued": Object.freeze({
    1: SubtaskQueuedEventPayloadV1,
  }),
  "orchestration.SubtaskWaiting": Object.freeze({
    1: SubtaskWaitingEventPayloadV1,
  }),
  "orchestration.SubtaskStarted": Object.freeze({
    1: SubtaskStartedEventPayloadV1,
  }),
  "orchestration.SubtaskCompleted": Object.freeze({
    1: SubtaskCompletedEventPayloadV1,
  }),
  "orchestration.SubtaskFailed": Object.freeze({
    1: SubtaskFailedEventPayloadV1,
  }),
  "orchestration.SubtaskRetrying": Object.freeze({
    1: SubtaskRetryingEventPayloadV1,
  }),
  "orchestration.SubtaskBlocked": Object.freeze({
    1: SubtaskBlockedEventPayloadV1,
  }),
  "orchestration.SubtaskReassigned": Object.freeze({
    1: SubtaskReassignedEventPayloadV1,
  }),
  "orchestration.CheckpointOpened": Object.freeze({
    1: CheckpointOpenedEventPayloadV1,
  }),
  "orchestration.CheckpointResolved": Object.freeze({
    1: CheckpointResolvedEventPayloadV1,
  }),
  "orchestration.RunPaused": Object.freeze({ 1: RunPausedEventPayloadV1 }),
  "orchestration.RunResumed": Object.freeze({ 1: RunResumedEventPayloadV1 }),
  "orchestration.RunCancelled": Object.freeze({
    1: RunCancelledEventPayloadV1,
  }),
  "orchestration.TaskModeChanged": Object.freeze({
    1: TaskModeChangedEventPayloadV1,
  }),
  "orchestration.SteeringMessageAdded": Object.freeze({
    1: SteeringMessageAddedEventPayloadV1,
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
