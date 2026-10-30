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

| File                   | Content                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `src/common.ts`        | `Id` (lower-case uuid), `Timestamp` (ISO 8601 UTC), `MicroUsd`, `Actor`             |
| `src/envelopes.ts`     | `EventEnvelopeV1(payload)`, `CommandEnvelopeV1(payload)`                            |
| `src/orchestration.ts` | `SubmitTask` command, `TaskSubmitted` event, task list result, `TaskStatus`         |
| `src/events.ts`        | `eventRegistry`, `eventCatalog`, `latest`, `RegisteredEvent`, `parseEvent`          |
| `src/ws.ts`            | `ClientMessageV1`, `ServerMessageV1`, `Topic`, `WsCloseCode`, `WsLimits` (ARCH. 10) |
| `src/errors.ts`        | `ProblemJson` (RFC 9457) and `ErrorCode`                                            |

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
- Ids are lower-case uuids. Make them with `crypto.randomUUID()`.

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

## Schema versioning rule

A schema is released when a tag contains it. Never edit a released schema,
with one exception: you can add an optional field in a minor release. Old
readers strip the field, and new readers see it absent in old data.

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
