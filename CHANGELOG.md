# Changelog

## 0.5.0

The owner chooses the model and the reasoning effort of a task. All
changes are additive: every v0.4.1 event, command and result stays valid.
The schema version of each event stays 1.

Released schemas that this version changes:

| Schema                             | Change                                                                                                                                              | Kind                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `PostOwnerMessageCommandPayloadV1` | optional `model` and `effort`; a message with a `taskId` has no `mode`, `model` or `effort` (error path `taskId`); `effort` comes only with `model` | optional field              |
| `OwnerMessagePostedEventPayloadV1` | optional `model` and `effort` in the `new_task` variant                                                                                             | optional field              |
| `TaskSubmittedEventPayloadV1`      | optional `model` and `effort`                                                                                                                       | optional field              |
| `TaskDetailV1`                     | optional `model` and `effort`                                                                                                                       | optional field              |
| `CallRequestedEventPayloadV1`      | optional `effort`; `maxTokens` is at most 32000 (was 16384)                                                                                         | optional field, wider bound |
| `SubtaskReassignedEventPayloadV1`  | no `model` means the task model, else the model chain of the agent (description)                                                                    | description                 |

New:

- `ReasoningEffort`: `max`, `xhigh`, `high`, `medium`, `low`, `minimal`,
  `none`.
- `ModelListItemV1` (`id`, `name`, `efforts`, `defaultEffort`) and
  `ModelListResultV1` (at most 1000 items), the result of
  `GET /api/models`.
- README: the model list rules of ai-proxy, the effort rules of a call,
  the limits of a task with a model (`maxTokens` 32000 for each call,
  `maxCostMicroUsd` 1,000,000), and the rules of the task model in a plan.

Deploy order:

1. ai-proxy moves to v0.5.0 before orchestration sends `effort` or a
   `maxTokens` above 16384. On v0.4.1 ai-proxy strips `effort` and refuses
   `maxTokens` above 16384.
2. orchestration moves to v0.5.0, then conversation-hub. On v0.4.1
   conversation-hub strips `model` and `effort`.
3. api-gateway and projections move to v0.5.0. On v0.4.1 api-gateway
   strips `model` and `effort` from a message, and projections does not
   show them in `TaskDetailV1`.
4. The app moves to v0.5.0 and sends `model` and `effort` only after
   steps 1 to 3.

## 0.4.1

Do not use v0.4.0. No service installs it. v0.4.1 changes its M3 schemas
in place (still schema version 1), from the review of contracts #6.

Changes against v0.4.0:

| Schema                                                                             | Change                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SubtaskCompletedEventPayloadV1`                                                   | new required `text` (`OutputText`); tokens and cost are of the completing call                                                                                                             |
| `SubtaskFailedEventPayloadV1`                                                      | new required `inputTokens`, `outputTokens`, `costMicroUsd`                                                                                                                                 |
| `SteeringMessageAddedEventPayloadV1`                                               | new required `runId`; only subtasks that have not started get it                                                                                                                           |
| `PlanProposedEventPayloadV1`                                                       | new required `awaitsApproval`                                                                                                                                                              |
| `CheckpointOpenedEventPayloadV1`                                                   | optional `deadline`; orchestration writes the `reason`                                                                                                                                     |
| `CheckpointResolvedEventPayloadV1`, `CheckpointV1`                                 | new decision and status `expired` (`CheckpointOutcome`); `CheckpointV1` has `deadline`                                                                                                     |
| `ResolveCheckpointCommandPayloadV1`                                                | stays `approved` or `refused` (`CheckpointDecision`)                                                                                                                                       |
| `SubtaskStatus`, `SubtaskStateV1`                                                  | new values `awaiting_approval`, `cancelled`, `skipped`                                                                                                                                     |
| `TaskDetailV1`                                                                     | new required nullable `currentCall` (`CallRef`, never the kind `subtask`); only the latest checkpoint of each subtask; `plan.subtasks` is `z.array(PlanSubtask).max(20)` with no byte rule |
| `PlanSubtask`                                                                      | `dependsOn` refine aborts; `estimatedCostMicroUsd` is at most 1e12 micro-USD                                                                                                               |
| `SubtaskCompleted`, `SubtaskFailed`, `SubtaskStateV1`, `TaskDetailV1` money fields | at most 1e12 micro-USD (`CapMicroUsd`)                                                                                                                                                     |
| `RegisterDeviceCommandPayloadV1`                                                   | new required `locale` (`DeviceLocale`: `en`, `de`, `ur`)                                                                                                                                   |
| `PostOwnerMessageCommandPayloadV1`                                                 | a message with a `taskId` has no `mode`                                                                                                                                                    |
| `EditPlanCommandPayloadV1`                                                         | orchestration ignores its estimates (description)                                                                                                                                          |

New against v0.4.0:

- Events, schema version 1: `orchestration.CallSettled` (each settled
  call of a task: `kind`, `subtaskId` for a subtask, tokens, cost, text),
  `orchestration.CallCancelRequested` (ai-proxy stops a running call),
  `orchestration.TaskCancelled` (a task with no run).
- README: the cancel rules of ai-proxy (a cancel that comes before its
  `CallRequested`), the call totals rule, `ResumeRun` of a task blocked
  with `subtask_failed` gives `conflict`, and the table from events to
  `PushKind`.
- `CancelTaskCommandPayloadV1`, `CallKind`, `CallRef`, `CheckpointOutcome`,
  `DeviceLocale`.
- README: the status table from each event to the task and the subtask
  status, the run rules (checkpoints, last try, retry, resume, cancel,
  steer), the money commands and the ADR 0028 rule for them, the rules
  that are only in zod.
- A test shows that the JSON Schema of a plan accepts a cyclic plan.

Released v0.3.x schemas that this version changes:

| Schema                                                    | Change                                                                                                                   | Kind           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `LlmErrorClass`, `CallFailedEventPayloadV1`               | new class `cancelled` (not retryable)                                                                                    | new value      |
| `ErrorCode`, `ProblemJson`, `ServerMessageV1` `error`     | new code `subtask_failed`                                                                                                | new value      |
| `RunBlockedEventPayloadV1`                                | new codes `forbidden` and `subtask_failed`                                                                               | new value      |
| `CallRequestedEventPayloadV1`                             | optional `kind` and `subtaskId`; `subtaskId` only with the kind `subtask`                                                | optional field |
| `CallCompletedEventPayloadV1`, `CallFailedEventPayloadV1` | optional `callInputTokens`, `callOutputTokens`, `callCostMicroUsd` (call totals, final attempt only, all three together) | optional field |

Deploy order (this replaces the order of 0.4.0):

1. conversation-hub, projections and ai-proxy move to v0.4.1 first.
   conversation-hub and projections read `ORCHESTRATION` with
   `parseEvent`. On v0.3.x a new event type or a new `RunBlocked` code
   fails the parse, and `kit/messaging` puts the message in the DLQ at
   once. ai-proxy needs v0.4.1 to read `CallCancelRequested`.
2. gitops gives ai-proxy a second durable consumer with the filter
   `orchestration.CallCancelRequested` (ADR 0023 must change).
3. notification and audit-trace start on v0.4.1.
4. orchestration moves to v0.4.1 and sends the new events and codes only
   after steps 1 and 2. Only orchestration v0.4.1 sends
   `CallCancelRequested`, so ai-proxy sends the class `cancelled` only when
   orchestration and projections can read it. The orchestration rollout
   uses the `Recreate` strategy: an old pod cannot parse `llm.CallFailed`
   `cancelled`, and with `RollingUpdate` it can put that message in the
   DLQ. If an old pod did, replay the DLQ after the rollout.
5. api-gateway and conversation-hub move to v0.4.1 before the app sends
   `mode`. On v0.3.x they strip it.
6. The app moves to v0.4.1 before a service sends the error code
   `subtask_failed` in a problem or a WebSocket `error`.
7. orchestration uses `approval` for an absent `mode` only after the app
   can approve a plan (M3-08).

## 0.4.0

Do not use this version. Use 0.4.1.

For M3. All changes are additive: every v0.3.x event, command and result
stays valid.

Released schemas that this version changes:

| Schema                             | Change                                                             | Kind           |
| ---------------------------------- | ------------------------------------------------------------------ | -------------- |
| `PostOwnerMessageCommandPayloadV1` | optional `mode`                                                    | optional field |
| `OwnerMessagePostedEventPayloadV1` | optional `mode` in the `new_task` variant; absent means `approval` | optional field |
| `RegisteredEvent`, `eventRegistry` | 21 new `orchestration.*` event types                               | new value      |
| `NoticeDataV1`                     | new key `task` (`TaskDetailV1` for `task:<id>`)                    | new value      |

Deploy order:

1. conversation-hub and projections move to v0.4.0 first. They read all of
   `ORCHESTRATION` with `parseEvent`. On v0.3.x a new event type fails the
   parse, and `kit/messaging` puts the message in the DLQ at once.
2. notification and audit-trace start on v0.4.0.
3. orchestration sends the new events only after step 1.
4. api-gateway and conversation-hub move to v0.4.0 before the app sends
   `mode`. On v0.3.x they strip it, and the task gets the default mode.
5. Orchestration uses `approval` when `mode` is absent only after the app
   can approve a plan (M3-08). Until then an M2 app cannot finish a chat
   task in approval mode.

New:

- Events, all schema version 1, stream `ORCHESTRATION`:
  `ClarificationRequested`, `ClarificationAnswered`, `PlanProposed`,
  `PlanEdited`, `PlanApproved`, `PlanRejected`, `SubtaskQueued`,
  `SubtaskWaiting`, `SubtaskStarted`, `SubtaskCompleted`, `SubtaskFailed`,
  `SubtaskRetrying`, `SubtaskBlocked`, `SubtaskReassigned`,
  `CheckpointOpened`, `CheckpointResolved`, `RunPaused`, `RunResumed`,
  `RunCancelled`, `TaskModeChanged`, `SteeringMessageAdded`.
- Owner command payloads (M3-04): `ApprovePlan`, `EditPlan`, `RejectPlan`,
  `PauseRun`, `ResumeRun`, `CancelRun`, `RetrySubtask`, `ReassignSubtask`,
  `SetTaskMode`, `ResolveCheckpoint`.
- Plan: `PlanSubtask` and `PlanSubtasks`. 1 to 20 subtasks, unique ids,
  dependencies inside the plan with no cycle, and at most 200,000 bytes as
  UTF-8 JSON. Integer micro-USD cost estimates.
- Reads (M3-07): `TaskDetailV1` (task, plan, subtask states, checkpoints,
  cost), `SubtaskStateV1`, `SubtaskStatus`, `CheckpointV1`,
  `TaskOutputV1` (the output text of a subtask or the result of the run).
- Push (M3-05): `RegisterDeviceCommandPayloadV1`,
  `UnregisterDeviceCommandPayloadV1`, `PushToken`, `DevicePlatform`
  (`android`), `PushDataV1`, `PushKind`. No event has the token.
- Shared schemas: `SubtaskTitle`, `SubtaskInstructions`,
  `ClarifyingQuestion`, `CheckpointDecision`.
- README: the end rule of a thread page (only an empty page is the end),
  the task and plan flow, the owner commands, push.
- Tests: the largest valid plan event, clarification, steering message and
  task detail notice stay under the NATS limit of 1 MiB.

## 0.3.1

- `RunCompletedEventPayloadV1`: a description only, no schema change.
  `costMicroUsd` is the cost of the attempt that gave the answer. The cost
  of the task is the sum of the `llm.*` costs. The event description says
  the same.

## 0.3.0

Released schemas that this version changes:

| Schema                                                | Change                                                           | Kind           |
| ----------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| `ServerMessageV1`                                     | `resync.reason` has only `too_old` (`server_restart` is removed) | breaking       |
| `ServerMessageV1`                                     | new message `unsubscribed` (`topics`)                            | new value      |
| `ServerMessageV1`                                     | `delta` has a required `attempt`                                 | breaking       |
| `Topic`                                               | new topic `conversation:<id>`                                    | new value      |
| `ClientMessageV1`, `ViewNoticeV1`, `ViewMessageV1`    | take the new topic through `Topic`                               | new value      |
| `ViewSubject`                                         | new subject `view.conversation.<id>`                             | new value      |
| `TaskStatus`, `TaskListItemV1`                        | new status `blocked`                                             | new value      |
| `ErrorCode`, `ProblemJson`, `ServerMessageV1` `error` | new codes `runaway_stopped`, `empty_output`                      | new value      |
| `TaskSubmittedEventPayloadV1`                         | optional `conversationId` and `messageId`, both or none          | optional field |

A new value is an error for an old reader of the same schema. Deploy
order:

1. socket-gateway on v0.3.0 first. Then the app can subscribe to
   `conversation:<id>` (`ClientMessageV1` is strict).
2. socket-gateway sends `unsubscribed` and `delta` with `attempt` only
   after the app is on v0.3.0.
3. projections sends the status `blocked`, and the services send the new
   error codes, only after their readers are on v0.3.0.
4. The app tests that send `server_restart` change to `too_old` when the
   app moves to v0.3.0: `src/screens.test.tsx:377` and
   `src/lib/live.test.ts:427`.

New:

- Events, all schema version 1: `orchestration.RunStarted`,
  `RunCompleted`, `RunFailed`, `RunBlocked`, `CallRequested`,
  `MessageRefused`; `conversation.ConversationStarted`,
  `OwnerMessagePosted`, `AgentReplyPosted`; `prompts.PromptCreated`,
  `PromptVersionPublished`; `llm.CallStarted`, `CallCompleted`,
  `CallFailed`; `budget.BudgetSet`, `FundsReserved`, `ReservationRefused`,
  `ReservationSettled`, `ReservationExpired`, `ThresholdCrossed`;
  `agents.AgentCreated`, `AgentVersionPublished`, `AgentVersionActivated`,
  `AgentEnabled`, `AgentDisabled`.
- Command payloads: `PostOwnerMessage`, `CreatePrompt`,
  `PublishPromptVersion`, `CreateAgent`, `PublishAgentVersion`,
  `ActivateAgentVersion`, `SetAgentEnabled`, `SetBudget`.
- Budget rpc: `ReserveFundsRequestV1`, `ReserveFundsReplyV1`,
  `SettleReservationRequestV1`, `SettleReservationReplyV1` (a union on
  `state`), and `RpcSubject` (`rpc.budget.reserve`, `rpc.budget.settle`).
- Reads: `ConversationMessageV1`, `ConversationThreadResultV1`,
  `BudgetMonthV1`, `AgentListItemV1`, `AgentListResultV1`,
  `ActiveAgentVersionResultV1`, `PromptVersionResultV1`, and
  `NoticeDataV1`.
- Deltas: `DeltaV1` (`{ attempt, i, text }`) and
  `deltaSubject(taskId, callId)`, which accepts only `Id` values.
- Size: the messages of `CallRequested` have at most 900,000 bytes as
  UTF-8 JSON, so the event stays under the NATS limit of 1 MiB. A test
  checks the largest valid events and notices against 1 MiB.
- `BudgetMonthV1` has a nullable `capMicroUsd` (no cap set),
  `overCapMicroUsd` and `asOf`.
- Shared schemas: `Reason`, `ModelId`, `DurationMs`, `ReplyText`,
  `OutputText`,
  `MessageIntent`, `CallMessage`, `BudgetScope`, `CapScope`,
  `CapMicroUsd`, `BudgetMonth`, `PromptRef`, `PromptText`,
  `PromptVariable`, `AgentRef`, `AgentName`, `AgentLimits`,
  `LlmErrorClass`, `FinishReason`.
- All money fields are `MicroUsd` integers.
- `docs/events.md` shows the fields of a payload that is a union.

## 0.2.1

- `engines.node` is `>=22.13`, so the app (Expo SDK 58, Node 22.13) can
  install the package with `engine-strict`. The repo still builds and tests
  on Node 26 (`.nvmrc`). No schema changes.

## 0.2.0

- `ViewNoticeV1`: the notice of a read model change (`topic`, `docId`,
  `rev`, `data`, optional `commandId`).
- `ViewMessageV1`: a message on the `VIEWS` stream, the outbox envelope
  with a `ViewSubject` in `type` and a `ViewNoticeV1` in `payload`. `type`
  must be the subject of `payload.topic`.
- `ViewSubject`, `viewSubject(topic)` and `topicFromSubject(subject)`.
- No released schema changes. The topic `conversation:<id>` comes with
  M2-02.

## 0.1.0

- Common schemas: `Id` (lower-case UUID v4), `Timestamp`, `MicroUsd`, `Actor`.
- `EventEnvelopeV1` and `CommandEnvelopeV1`, generic over the payload.
  `expectedVersion` is optional; `0` means a new stream.
- Orchestration: `SubmitTaskCommandPayloadV1`, `TaskSubmittedEventPayloadV1`
  (`orchestration.TaskSubmitted`, schema version 1), `TaskStatus`,
  `TaskListItemV1` (with `rev` and `asOf`), `TaskListResultV1`.
- Event registry keyed by type and schema version, `eventCatalog`,
  `latest`, `RegisteredEvent` and `parseEvent`.
- WebSocket v1: `ClientMessageV1` (strict), `ServerMessageV1` (`notice`
  has an optional `commandId`), `Topic`, `WsCloseCode`, `WsLimits`.
- `ProblemJson` and `ErrorCode` (12 codes).
- Maximum lengths on tokens, ids, titles, texts and messages. Long strings
  stop at the length check, so no pattern runs on them.
- `zod` is a peer dependency (`^4.6.7`).
- Generated JSON Schema in `schemas/` and the event reference
  `docs/events.md`.
