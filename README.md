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

| File                   | Content                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `src/common.ts`        | `Id` (uuid), `Timestamp` (ISO 8601 UTC), `MicroUsd`, `Actor`                   |
| `src/envelopes.ts`     | `EventEnvelopeV1(payload)`, `CommandEnvelopeV1(payload)`                       |
| `src/orchestration.ts` | `SubmitTask` command, `TaskSubmitted` event, task list result, `TaskStatus`    |
| `src/events.ts`        | `eventRegistry`, `RegisteredEvent`, `parseEvent`                               |
| `src/ws.ts`            | `ClientMessageV1`, `ServerMessageV1`, `Topic`, `WsCloseCode` (ARCHITECTURE 10) |
| `src/errors.ts`        | `ProblemJson` (RFC 9457) and `ErrorCode`                                       |

Generated output: `schemas/` (JSON Schema of each exported schema and of
each event) and `docs/events.md` (event reference). Do not edit them. Run
`npm run generate`. CI fails if the committed output is different.

## Install by tag

A service or the app installs a fixed tag:

    "@famashines/ai-systems-contracts": "github:famashines/ai-systems-contracts#v0.1.0"

npm downloads the repo at that tag and runs `prepare`, which builds
`dist/`. npm 11 asks each project to approve install scripts. After you add
or change the version, run this in the service and commit the
`allowScripts` change in `package.json`:

    npm install-scripts approve @famashines/ai-systems-contracts

The approval is for the exact commit of the tag, so a new version needs a
new approval. Use the same `zod` version as this package (see
`package.json`).

## Add an event

1. Write the payload schema `<EventName>EventPayloadV1` in the file of its
   context, for example `src/orchestration.ts`. Give it a `.describe()`
   text with the meaning of the event.
2. Add it to `eventRegistry` in `src/events.ts` with `schemaVersion: 1`.
   The key is the event type `<context>.<EventName>`.
3. Add valid and invalid examples to `test/schemas.test.ts`.
4. Run `npm run generate` and commit `schemas/` and `docs/events.md`.
5. Add the change to `CHANGELOG.md`.

## Schema versioning rule

Never edit a released schema. A schema is released when a tag contains it.
For a change to a released schema:

1. Add a new schema with the next version, for example
   `TaskSubmittedEventPayloadV2`. Keep the old schema.
2. Set the registry entry to the new payload and the next `schemaVersion`.
3. Add an upcaster from the old version to the new version in
   `kit/event-store` (ADR 0006). Stored events never change.

## Release

Change `version` in `package.json` and add a `CHANGELOG.md` entry in a pull
request. After the merge, tag the merge commit on `main` with `v<version>`
and push the tag. A tag is never moved or deleted.
