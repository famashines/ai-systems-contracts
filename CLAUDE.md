# CLAUDE.md for ai-systems-contracts

Rules for all ai-systems repos: `../docs/CLAUDE.md` (repo
`famashines/ai-systems-docs`). This file adds the commands of this repo.

## Commands

| Command            | Does                                                        |
| ------------------ | ----------------------------------------------------------- |
| `npm ci`           | install from the lock file; `prepare` builds `dist/`        |
| `npm run check`    | `tsc --noEmit` with TypeScript 7                            |
| `npm run lint`     | ESLint (typescript-eslint strict type-checked) and Prettier |
| `npm test`         | `node --test` with coverage gate: 90% lines, 85% branches   |
| `npm run generate` | write `schemas/` and `docs/events.md` from the schemas      |
| `npm run drift`    | `generate`, then fail if the output differs from git        |
| `npm run verify`   | `check`, `lint`, `test` and `drift`                         |
| `npm run build`    | write `dist/` (JS and `.d.ts`)                              |

`drift` compares with the files in git. Commit the generated output before
you run `verify`.

## Two TypeScript versions

- `typescript-7` (npm alias of `typescript@7.0.2`) does `check` and
  `build`. The scripts call it by path: `node node_modules/typescript-7/bin/tsc`.
- `typescript` (npm alias of `@typescript/typescript6`) gives the
  TypeScript 6 API to typescript-eslint. TypeScript 7 has no JS API, and
  typescript-eslint 8 needs `typescript` below 6.1.
- `node_modules/.bin/tsc` is TypeScript 6. Do not use `npx tsc`. Use the
  npm scripts.

Remove the TypeScript 6 alias when typescript-eslint supports
TypeScript 7.

## Rules

- Source imports end in `.ts`. Tests and scripts run with Node type
  stripping. The build rewrites the imports to `.js`.
- Add an event: see `README.md`. Never edit a released schema.
