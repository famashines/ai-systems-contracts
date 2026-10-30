# Changelog

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
