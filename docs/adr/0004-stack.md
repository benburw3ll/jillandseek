# 0004. A TypeScript pnpm workspace: React and Vite for the site, Hono on Node for the server, SQLite

- Status: Accepted (2026-11-26)
- Date: 2026-11-26
- Deciders: the owner
- Supersedes / Narrows: (none)

Accepted 2026-11-26 by the owner's go-ahead on the recommended option (issue #5, option A).

## Context

- The website is the long-term aim, but the engine comes first: a database that keeps growing, collectors on a schedule and a matcher ([0001](0001-purpose.md)). The stack has to run on the owner's computer now and move to a host later without a rewrite.
- The repo has no `package.json` and no app code. CI (`.github/workflows/ci.yml`) has one job, `check`, that scans every commit with gitleaks on GitHub's runners. The ruleset on `main` requires that check-run. AGENTS.md hard rule 3 forbids self-hosted runners.
- The owner's unattended build runs merge through a `pnpm check` gate, and the owner's other repos use pnpm workspaces, TypeScript, React with Vite, SQLite and lefthook. The owner's machine has Node and no Python.
- Checked on the owner's machine on 2026-11-26, on Node 26.13.0 (the 26 LTS line) with pnpm 12: Node ran a TypeScript file that imports another workspace package's TypeScript source through a pnpm workspace link, and opened an in-memory database with `node:sqlite`, with no flag and no warning. So the server needs no build step and no SQLite package.
- The sweep is a long-running job on a timer ([0002](0002-sources.md)). The data is strangers' posts, which stay on the owner's computer ([0003](0003-privacy.md)).

## Decision

1. **Runtime.** Node 26 LTS, ESM only (`"type": "module"`). `.node-version` and `engines.node` name 26.
   - Server-side TypeScript is run directly by Node. There is no transpile step and no `tsx` or `ts-node`.
   - So the code uses erasable syntax only (`erasableSyntaxOnly`: no enums, no namespaces, no parameter properties), `import type` for types (`verbatimModuleSyntax`), and `.ts` extensions on relative imports.
   - `tsc --noEmit` checks the types, strict.
2. **Workspace.** pnpm workspaces over `apps/*` and `packages/*`:
   - `packages/core`: the records, their zod schemas, and matching. It is pure: no file, network or database access, and no clock reads (the time is passed in). It depends on no other workspace package.
   - `packages/sources`: the source registry, the collectors and the one fetcher they share. It depends on `core`.
   - `apps/server`: Hono on `@hono/node-server`. It holds the API, the sweep and the database. It depends on `core` and `sources`.
   - `apps/web`: React 19 and Vite, with `wouter` as its small router. It depends on `core` for the shared types and schemas, and reaches the server only through the API.
   - `apps/extension` arrives with O6.
   - Packages export their TypeScript source. Only `apps/web` is built, by Vite.
3. **Data.** SQLite through `node:sqlite`, one database file inside the data home ([0003](0003-privacy.md)).
   - Migrations are plain numbered `.sql` files, run in order at start, each in one transaction, and recorded in `schema_migrations`.
   - One repository module in `apps/server` is the only code that runs SQL. Everything else calls its functions.
   - The SQL stays plain, with no ORM and no query builder, so a later move to Postgres is a migration and not a rewrite.
4. **Validation.** zod at every edge: API input, collector output, registry entries and settings read from the environment. A record's TypeScript type is inferred from its schema, so the two can't drift.
5. **Tools.** Vitest for tests, with Testing Library and jsdom for the site's component tests. Biome for lint and format, with one config at the root. lefthook for the git hooks: a staged-file guard, Conventional Commits, and no push to `main`.
   - The runtime dependencies are the ones this record names: `hono`, `@hono/node-server`, `zod`, `react`, `react-dom`, `wouter`, and `node-html-parser` for the collectors in `packages/sources`, which read HTML pages. Another one is a decision: a short ADR that narrows this one comes first.
   - A small, widely used dev-only tool (a test library, a types package) is the builder's call, and the PR names it.
6. **The gate.** `pnpm check` runs, in order, a personal-values scan, typecheck, lint, tests and build, and stops at the first failure.
   - CI's `check` job runs gitleaks, then `pnpm install --frozen-lockfile` and `pnpm check`, on GitHub's runners, with actions pinned by SHA. The job keeps the name `check`, because the ruleset on `main` requires that check-run.
   - It is the merge gate: nothing merges while it is red.
   - No test reaches the internet.
7. **Where it runs.** On the owner's computer only. The server binds `127.0.0.1` and never `0.0.0.0`. There is no hosting config, no account and no deploy step. Hosting is a later ADR, after the owner's `Decide:` draft on hosting.

### Versions on the day

Pinned from the npm registry on 2026-11-26. `package.json` and the lockfile are the living record after that, and Dependabot moves them.

| Tool | Version |
| --- | --- |
| Node | 26 LTS (26.13.0 on the owner's machine) |
| pnpm | 12 (12.16.1 on the owner's machine; 12.23.0 is the newest) |
| TypeScript | 7.0.2 |
| Hono | 4.13.23 |
| `@hono/node-server` | 2.1.11 |
| zod | 4.6.7 |
| React and `react-dom` | 19.3.1 |
| Vite | 8.4.0 |
| `@vitejs/plugin-react` | 6.3.0 |
| wouter | 3.13.0 |
| `node-html-parser` | 9.0.7 |
| Vitest | 5.1.2 |
| `@testing-library/react` | 16.3.3 |
| jsdom | 31.0.1 |
| Biome | 2.6.9 |
| lefthook | 2.2.4 |
| `@types/node` | 26.6.11 |

## Consequences

- One language runs everywhere, and the web app and the server share the same schemas, so a record can't mean two things.
- With no build step on the server, `pnpm dev` and `pnpm start` start fast, and a stack trace points at the source file. The price is the erasable-syntax rule: a builder who reaches for an enum writes a union of string literals instead.
- `node:sqlite` is synchronous. That is fine for one owner on one computer. A sweep that grows heavy moves its writes into batches before anything else changes.
- Only the repository module knows SQL, so the Postgres move later touches one module and the migrations.
- #8 builds the workspace, the gate and the hooks this record names. AGENTS.md gets a Platform section with the layout and the gate.
- The dependency list is short on purpose. A new runtime dependency costs a short ADR, which is slower, and is the point.

## Alternatives considered

**B. Next.js full stack.** One framework, and hosting later would be easy. But it ties the server to a host's model, and a long-running sweep fits awkwardly in serverless functions. The engine is the first thing built, and it is the part Next.js serves least.

**C. A Python backend with a React site.** Python has strong scraping libraries. But it means two languages and two sets of tools, the shared schemas would be written twice, and Python isn't on the owner's machine.
