# ai-systems-contracts

The zod schemas that the ai-systems services and the app share. Package
`@famashines/ai-systems-contracts`. The zod schemas are the single source
(ADR 0016). Types come from `z.infer`. A schema and its type have the same
name.

```ts
import {
  parseEvent,
  SubmitTaskCommandPayloadV1,
} from "@famashines/ai-systems-contracts";

const payload: SubmitTaskCommandPayloadV1 =
  SubmitTaskCommandPayloadV1.parse(body);
const event = parseEvent(message);
```

## Content

| File                   | Content                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/common.ts`        | `Id` (lower-case UUID v4), `Timestamp` (ISO 8601 UTC), `MicroUsd`, `Actor`, `Reason`, `ModelId`                                              |
| `src/envelopes.ts`     | `EventEnvelopeV1(payload)`, `CommandEnvelopeV1(payload)`                                                                                     |
| `src/orchestration.ts` | `SubmitTask` command, `TaskSubmitted`, `RunStarted`, `RunCompleted`, `RunFailed`, `MessageRefused`, task list result, `TaskStatus`           |
| `src/conversation.ts`  | `PostOwnerMessage` command, `ConversationStarted`, `OwnerMessagePosted`, `AgentReplyPosted`                                                  |
| `src/prompts.ts`       | `CreatePrompt` and `PublishPromptVersion` commands, `PromptCreated`, `PromptVersionPublished`, `PromptRef`                                   |
| `src/agents.ts`        | agent commands, `AgentCreated`, `AgentVersionPublished`, `AgentVersionActivated`, `AgentEnabled`, `AgentDisabled`, `AgentRef`, `AgentLimits` |
| `src/llm.ts`           | `CallStarted`, `CallCompleted`, `CallFailed`, `LlmErrorClass`, `FinishReason`                                                                |
| `src/budget.ts`        | `SetBudget` command, `budget.*` events, `BudgetScope`, rpc reserve and settle messages, `RpcSubject`                                         |
| `src/events.ts`        | `eventRegistry`, `eventCatalog`, `latest`, `RegisteredEvent`, `parseEvent`                                                                   |
| `src/views.ts`         | `ViewNoticeV1`, `ViewMessageV1`, `ViewSubject`, `viewSubject`, `topicFromSubject`                                                            |
| `src/ws.ts`            | `ClientMessageV1`, `ServerMessageV1`, `Topic`, `WsCloseCode`, `WsLimits` (ARCH. 10), `DeltaV1`, `deltaSubject`                               |
| `src/errors.ts`        | `ProblemJson` (RFC 9457) and `ErrorCode`                                                                                                     |

Generated output: `schemas/` (JSON Schema of each exported schema and of
each event version) and `docs/events.md` (event reference). Do not edit
them. Run `npm run generate`. CI fails if the committed output is
different.

## Install by tag

A service or the app installs a fixed tag, and `zod` as a peer:

    "@famashines/ai-systems-contracts": "github:famashines/ai-systems-contracts#v0.1.0",
    "zod": "4.6.7"

`zod` is a peer dependency (`^4.6.7`), so the service and this package use
the same zod copy. Two copies break `instanceof` checks and the types.

The package needs Node 22.13 or later. This repo builds and tests on
Node 26 (`.nvmrc`).

npm downloads the repo at that tag and runs `prepare`, which builds
`dist/`. `npm ci --ignore-scripts` does not run `prepare`, so it gives no
`dist/` and the import fails. npm 11 asks each project to approve install
scripts. After you add or change the version, run this in the service and
commit the `allowScripts` change in `package.json`:

    npm install-scripts approve @famashines/ai-systems-contracts

The approval is for the exact commit of the tag, so a new version needs a
new approval.

## Rules in the schemas

- Unknown keys: envelopes, event payloads, command payloads, query results
  and server messages strip unknown keys. Stored MongoDB documents carry
  `_id` and `publishedAt`, and `parseEvent` removes them. `ClientMessageV1`
  uses strict objects: an unknown key is an error, so the gateway can close
  with `4400`.
- Optional fields are absent or have a value. An explicit `undefined` is
  an error.
- `expectedVersion` in `CommandEnvelopeV1`: absent means no version check.
  `0` means that the stream must not exist yet. `n` means that the last
  event of the stream has version `n`.
- Topics: one `subscribe` message has at most 50 topics. The gateway
  enforces `WsLimits.maxTopics` (50) for all topics of one connection
  together, not for each message.
- Ids are lower-case UUID v4 (ADR 0022). Make them with
  `crypto.randomUUID()`.
- Money is an integer number of micro-USD (`MicroUsd`, 1 USD =
  1,000,000). Convert a provider cost in USD with
  `Math.round(usd * 1_000_000)`. No schema has a float for money.

## Budget rpc

Core NATS request-reply, not in a stream (ADR 0015, ADR 0021). The caller
makes `reservationId`, so a repeated request after a timeout does not
hold the money two times. A refusal is a normal reply with `ok: false`.
Errors come in the `error-code` header of `kit/messaging`.

| Subject              | Request                      | Reply                      |
| -------------------- | ---------------------------- | -------------------------- |
| `rpc.budget.reserve` | `ReserveFundsRequestV1`      | `ReserveFundsReplyV1`      |
| `rpc.budget.settle`  | `SettleReservationRequestV1` | `SettleReservationReplyV1` |

## Deltas

ai-proxy publishes each token delta to core NATS (ADR 0019) on
`deltaSubject(taskId, callId)` (`delta.<taskId>.<callId>`) with a
`DeltaV1` body `{ i, text }`. socket-gateway adds `type`, `taskId` and
`callId` and sends a `delta` server message with the same rules.

## Events

`eventRegistry` maps each event type to its schema versions:

```ts
{ "orchestration.TaskSubmitted": { 1: TaskSubmittedEventPayloadV1 } }
```

- `parseEvent(input)` checks the envelope and the payload of the
  `schemaVersion` that the event has. Stored V1 events stay readable after
  V2 exists, and an upcaster can check its input.
- `latest(type)` gives `{ schemaVersion, payload }` of the highest version.
  New events use it.
- `eventCatalog` lists each type and version with its full envelope
  schema.

### Add an event

1. Write the payload schema `<EventName>EventPayloadV1` in the file of its
   context, for example `src/orchestration.ts`. Give it a `.describe()`
   text with the meaning of the event.
2. Add it to `eventRegistry` in `src/events.ts` as
   `"<context>.<EventName>": Object.freeze({ 1: <schema> })`.
3. Add valid and invalid examples to `test/schemas.test.ts`.
4. Run `npm run generate` and commit `schemas/` and `docs/events.md`.
5. Add the change to `CHANGELOG.md`.

## Views

projections writes a notice for each read model change, through its
outbox, to the JetStream stream `VIEWS` (ADR 0010). A message on `VIEWS`
is a `ViewMessageV1`: the event envelope of the outbox, with the subject
in `type` and a `ViewNoticeV1` in `payload`.

```
{ eventId, type: "view.tasks", schemaVersion: 1, streamId, version,
  occurredAt, correlationId, causationId, actor,
  payload: { topic: "tasks", docId, rev, data, commandId? } }
```

`ViewMessageV1` has its own `type` schema (`ViewSubject`), because a view
subject is not a `<context>.<EventName>` type. It also checks that `type`
is the subject of `payload.topic`. The header `Nats-Msg-Id`
is the `eventId`.

| Topic               | Subject                  |
| ------------------- | ------------------------ |
| `tasks`             | `view.tasks`             |
| `task:<id>`         | `view.task.<id>`         |
| `conversation:<id>` | `view.conversation.<id>` |
| `budget`            | `view.budget`            |
| `agents`            | `view.agents`            |
| `notifications`     | `view.notifications`     |

`viewSubject(topic)` gives the subject. `topicFromSubject(subject)` gives
the topic, and throws a `ZodError` for a subject that is not in the table.

## Schema versioning rule

A schema is released when a tag contains it. Never edit a released schema,
with one exception: you can add an optional field in a minor release. Old
readers strip the field, and new readers see it absent in old data.
This exception does not apply to `ClientMessageV1`: it uses strict objects,
so an old gateway refuses a new client field. Deploy the gateway with the
new field before the app sends it.

Every other change needs a new schema version:

1. Add a new schema with the next version, for example
   `TaskSubmittedEventPayloadV2`. Keep the old schema.
2. Add it to the registry entry: `{ 1: ...V1, 2: ...V2 }`. Do not remove
   the old version.
3. Add an upcaster from the old version to the new version in
   `kit/event-store` (ADR 0006). Stored events never change.

## Release

Change `version` in `package.json` and add a `CHANGELOG.md` entry in a pull
request. After the merge, tag the merge commit on `main` with `v<version>`
and push the tag. A tag is never moved or deleted.
