# Changelog

## 0.3.0

- Breaking: `resync.reason` has only `too_old`. The unused value
  `server_restart` is removed. A restart closes the socket with `1012`.
- `ServerMessageV1` has an `unsubscribed` message (`topics`).
- `Topic` has `conversation:<id>`, and `ViewSubject` has
  `view.conversation.<id>`. Deploy socket-gateway with this version
  before the app subscribes to the topic, because `ClientMessageV1` is
  strict.
- `DeltaV1` (`{ i, text }`), the body of a core NATS delta, and
  `deltaSubject(taskId, callId)`. The `delta` server message uses the same
  rules.
- `orchestration.TaskSubmitted` v1 has the optional fields
  `conversationId` and `messageId`.
- New events, all schema version 1: `orchestration.RunStarted`,
  `RunCompleted`, `RunFailed`, `MessageRefused`;
  `conversation.ConversationStarted`, `OwnerMessagePosted`,
  `AgentReplyPosted`; `prompts.PromptCreated`, `PromptVersionPublished`;
  `llm.CallStarted`, `CallCompleted`, `CallFailed`; `budget.BudgetSet`,
  `FundsReserved`, `ReservationRefused`, `ReservationSettled`,
  `ReservationExpired`, `ThresholdCrossed`; `agents.AgentCreated`,
  `AgentVersionPublished`, `AgentVersionActivated`, `AgentEnabled`,
  `AgentDisabled`.
- New command payloads: `PostOwnerMessage`, `CreatePrompt`,
  `PublishPromptVersion`, `CreateAgent`, `PublishAgentVersion`,
  `ActivateAgentVersion`, `SetAgentEnabled`, `SetBudget`.
- Budget rpc: `ReserveFundsRequestV1`, `ReserveFundsReplyV1`,
  `SettleReservationRequestV1`, `SettleReservationReplyV1`, and
  `RpcSubject` (`rpc.budget.reserve`, `rpc.budget.settle`).
- Shared schemas: `Reason`, `ModelId`, `BudgetScope`, `BudgetMonth`,
  `PromptRef`, `PromptText`, `PromptVariable`, `AgentRef`, `AgentName`,
  `AgentLimits`, `LlmErrorClass`, `FinishReason`.
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
