# Changelog

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
- Shared schemas: `Reason`, `ModelId`, `DurationMs`, `ReplyText`,
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
