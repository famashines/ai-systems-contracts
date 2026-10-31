# Changelog

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
