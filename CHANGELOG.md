# Changelog

## 0.1.0

- Common schemas: `Id`, `Timestamp`, `MicroUsd`, `Actor`.
- `EventEnvelopeV1` and `CommandEnvelopeV1`, generic over the payload.
- Orchestration: `SubmitTaskCommandPayloadV1`, `TaskSubmittedEventPayloadV1`
  (`orchestration.TaskSubmitted`, schema version 1), `TaskStatus`,
  `TaskListItemV1`, `TaskListResultV1`.
- Event registry, `RegisteredEvent` and `parseEvent`.
- WebSocket v1: `ClientMessageV1`, `ServerMessageV1`, `Topic`,
  `WsCloseCode`.
- `ProblemJson` and `ErrorCode`.
- Generated JSON Schema in `schemas/` and the event reference
  `docs/events.md`.
