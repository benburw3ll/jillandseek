# AGENTS.md - Jill and Seek

Guidance for AI coding agents and people working in this repo. `CLAUDE.md` imports this file, so it loads into every Claude Code session.

## Where things stand

Jill and Seek is a Minnesota lost-dog finder. The slug is `jillandseek`, and the name is never written with "&". The six decisions the build rests on are accepted ADRs in `docs/adr/`: purpose, sources, privacy, stack, records and AI. v1's planned issues are built (see Platform): the workspace and its `pnpm check` gate, the database and its repository, the local server with its guards, the source registry with the sweep and the first Minnesota collector (O3), and the search for a missing dog (O4): the dog form, the matcher with its synthetic test set (`pnpm eval:match`), and each dog's page of ranked listings. The owner runs it with `pnpm install` and `pnpm start`, then opens the site. #31, #33 and #36 are O3's open follow-ups, and each needs the owner's go-ahead for more reading of live sites. O5 (watches) and O6 (capture) come next, and wait on the owner's `Decide:` drafts. The plan is on the board: `docs/ROADMAP.md` holds the outcomes in build order (O1 decided, O2 to O4 build v1, O5 and O6 are v1.1), and each outcome's milestone holds its issues.

On 2026-11-26 the owner agreed to start the build, and O1's ADRs were accepted with their recommended options. The build issues follow those ADRs.

`data/` is git-ignored. It is the app's data home for real use, and it also holds private notes: the owner's ideas in `data/ideas/` and the build runs' briefs in `data/runs/`. No code reads those two folders, and nothing from them is quoted in files, issues or PRs.

## Hard rules

1. **Plan before building.** Nothing is built ahead of the accepted ADR that binds it, and every build issue names the ADRs it follows. An accepted ADR is never edited: a change it doesn't cover, or one that goes against it, needs a new ADR first.
2. **This repo is meant to be public, and the data is strangers'.** ([ADR-0003](docs/adr/0003-privacy.md))
   - No names, contacts, addresses, photos, tokens or keys of any real person, and nothing from a real listing or a real dog owner's or finder's post, in files, tests, fixtures, logs, screenshots, commit messages, issues or PRs. Examples and tests use made-up data. Say "the owner".
   - Real data lives only in the data home, the folder `JILL_HOME` names: `data/` for real use, `.dev-home/` in development, a temp folder in tests. The app touches only what it creates there by name.
   - Logs hold ids, counts and timings only: never post text, names, contact details, places, request bodies or query values.
   - Nothing leaves the computer except the sweep's reads and the owner's own browser opening a listing's photo or link. Any outside service needs its own ADR or the owner's decision first.
3. **No self-hosted runners.** The repo variable `CI_RUNNER` stays unset: CI runs on GitHub's standard runners.
4. **Never commit straight to `main`.** No force pushes, never skip hooks. Work on a branch and merge through a pull request.
5. **Scan for secrets and personal data before every push.** CI's `check` job scans the whole history for secrets with gitleaks, then runs `pnpm check`, whose first step is the personal-values scan (`scripts/check-personal.mjs`: user folders, email addresses, phone numbers, the owner's name). The lefthook pre-commit hook refuses staged files under `data/`, `secrets/` or `.env*`, secret-shaped strings and personal values, and runs gitleaks when it is installed. Made-up examples use the reserved example domains (`example.com`, `example.org`, `example.net`, and names ending in `.example`, `.test`, `.invalid` or `.localhost`) and the 555-0100 to 555-0199 numbers, the only addresses and numbers the scan allows.
6. **A site's "no" is final.** ([ADR-0002](docs/adr/0002-sources.md))
   - Robots rules, bot checks, logins and terms are respected and never worked around: no headless browser to pass a check, no scraping service, no borrowed session, no User-Agent that pretends to be a browser.
   - A collector merges only after its source's robots rules and terms were checked and recorded, with the date, in the registry.
   - Every request goes through the one shared fetcher, with the User-Agent `JillAndSeek/<version> (+<the repo's URL>)`. A source is read at most once every 30 minutes, with backoff on errors. A source that answers 403, 429 or a challenge page is marked blocked and is not read again until the owner clears it.
   - No test reaches the internet. A fixture is a made-up page in the real page's shape, never a saved copy of a live page.
7. **AI with a budget.** ([ADR-0006](docs/adr/0006-ai.md)) v1 makes no model calls. Every later model call goes through one client that counts calls, enforces a daily and a monthly cap and logs counts only. Tests use a fake client, and no code path goes around it. Nothing is sent for a feature the owner hasn't turned on, and never contact details or anything about the owner.

## Platform

[ADR-0004](docs/adr/0004-stack.md) sets the stack.

- **Setup:** Node 26 (`.node-version`) and pnpm 12 (`packageManager` in `package.json`). `pnpm install` installs the workspace and the git hooks.
- **Layout:** a TypeScript pnpm workspace on Node 26, ESM only.
  - `packages/core`: the records, their zod schemas and matching. Pure: no file, network or database access and no clock reads (the time is passed in).
  - `packages/sources`: the source registry, the collectors and their one fetcher.
  - `apps/server`: Hono on Node. The API, the sweep, and the SQLite database behind one repository module.
  - `apps/web`: React 19 and Vite, with `wouter` as the router.
  - Node runs the TypeScript directly, so the code uses erasable syntax only (no enums, namespaces or parameter properties), `import type` for types, and `.ts` extensions on relative imports. Packages export their source (`"exports": "./src/index.ts"`); only `apps/web` is built.
- **The gate:** `pnpm check` runs, in order and stopping at the first failure: `check:personal`, `typecheck` (`tsc`, strict), `lint` (Biome), `sources:check`, `test` (Vitest over every package) and `build`. CI's `check` job runs gitleaks and then `pnpm install --frozen-lockfile` and `pnpm check` on GitHub's runners, and nothing merges while it is red.
- **Commands:**
  - `pnpm dev`: Vite for `apps/web` on 5200 with `/api` proxied to the server on 5201 (`JILL_API_PORT`), and the server in watch mode, with the data home in `.dev-home/`.
  - `pnpm start`: builds the site and serves it and the API from the server on 5200, with the data home in `data/`. Try it with `JILL_HOME` set to a temp folder.
  - `pnpm check`: the gate, before every PR.
  - `pnpm test`: the tests alone. `pnpm lint` checks the format and lint; `pnpm format` fixes them.
  - `pnpm sources:check`: validates the source registry (`packages/sources/src/registry/`); an `automatic` entry without `checkedOn`, `checkNote` or an existing collector fails it. `pnpm eval:match` prints the matcher's recall at 5 and 20 and median rank on the synthetic set (`packages/core/eval/`), beside the newest-first baseline.
- **Sources and the sweep** (O3): the registry syncs into the `sources` table at start-up. Every collector in `packages/sources/src/collectors/` reads through the one fetcher (`packages/sources/src/fetcher/`), and the sweep (`apps/server/src/sweep/`) runs at start and checks every 5 minutes under `pnpm start`, reading each source at most once every 30 minutes. `JILL_SWEEP=off` turns it off; it is off under `pnpm dev` and in tests. A tick with no source due writes no sweeps row; after a sweep that read a source, every missing dog is matched again. The owner clears a blocked source from the Sources page (`POST /api/sources/:id/clear-block`), and the sweep reads it when next due. Every test file loads `test/no-network.ts`, which fails a test that opens a connection off this computer.
- **Matching** (O4): `scoreListing` in `packages/core/src/match/` is pure, with its breed and colour tables beside it. It runs when a dog is saved, after a sweep that read a source, and from the dog page's re-run (`GET`/`POST /api/dogs/:id/matches`), and upserts `matches` in one transaction per dog. Bands and reasons are shown; the score never is.
- **Port:** 5200, in `.claude/launch.json` (`jillandseek-dev`). None of the owner's other repos uses it. `JILL_PORT` overrides it. The server binds `127.0.0.1` only.
- **Data home and settings:** `JILL_HOME` (a relative path is read from the repo's root) holds `jillandseek.db`, `photos/` and `cache/`, and nothing else is touched there. `JILL_KEEP_GONE_DAYS` (90) and `JILL_KEEP_FOUND_DAYS` (30) are the retention lines. Migrations are numbered `.sql` files in `apps/server/src/db/migrations/`, each run in one transaction with foreign keys checked before it commits. Only `apps/server/src/db/` runs SQL: everything else calls the repository (`repository.ts`, one file per record). `markGone` with an empty read marks nothing.
- **The site** (`apps/web`): one file per page in `src/pages/`, one API client per resource in `src/api/`, the design base in `src/styles.css` (custom properties, system fonts, no outside request of any kind), and the home page's memorial block in `src/content/memorial.md`, which the owner writes.
- **The API's guards** (`apps/server/src/http/guards.ts`): Host and Origin must be the app's own, a cross-site `Sec-Fetch-Site` is refused on `/api`, a state-changing request needs `Content-Type: application/json` and `X-Jill-And-Seek: 1`, bodies stop at 1 MB, and errors are JSON codes with no stack. Each route file in `apps/server/src/routes/` is registered in `apps/server/src/app.ts`.
- **Hooks (lefthook):** pre-commit runs `scripts/guard-staged.mjs` (forbidden paths, secret shapes, personal values), commit-msg checks Conventional Commits with a first line of at most 100 characters, and pre-push refuses a push to `main`. Never skip them.
- **Where it runs:** on the owner's computer only. The server binds `127.0.0.1`.
- **Dependencies:** the runtime dependencies are the ones ADR-0004 names. Another one needs a short ADR first.

## Terms

Use these words, with these meanings, in code, issues, PRs and screens ([ADR-0005](docs/adr/0005-records.md) has each record's fields).

| Word      | Meaning                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Dog       | A missing dog being searched for                                                                                 |
| Listing   | One post or record that might be that dog. Its kind is `shelter-stray`, `found`, `lost`, `sighting` or `unknown` |
| Source    | One place listings come from. Its access is `automatic`, `capture` or `link`                                     |
| Registry  | The list of every source Jill and Seek knows about, read or not                                                  |
| Collector | The code that reads one automatic source, or one shelter software platform                                       |
| Sweep     | One run of the collectors over the sources that are due                                                          |
| Match     | One listing scored against one dog, as a ranking. Never an identification                                        |
| Band      | How strong a match is: `strong`, `possible` or `weak`. Shown instead of a score                                  |
| Set aside | A match with a hard contradiction. Still stored and still shown, with its reason                                 |
| Watch     | A search that keeps running (O5)                                                                                 |
| Capture   | Posts read from a page the person opened (O6)                                                                    |
| Data home | The folder outside git where real data lives, named by `JILL_HOME`                                               |

Unknown is a value and never a guess: an unclear post is `unknown`, and an unknown trait never lowers a score.

## Workflow

- **Planning:** a decision is an issue filed with the ADR issue template, in the milestone of the outcome it binds (O1's six are done). Each one ends as an accepted record in `docs/adr/` (copy `0000-template.md`).
- **Picking work:** take issues in Build order (the Roadmap table's order), and within a milestone in issue order, after what they depend on. Draft items titled `Decide:`, `Do:` or `Check:` wait on the owner, and `Idea:` drafts are not work until the owner picks one. The user-level `scribe` skill files issues and audits the board from `.claude/board.json`.
- **Merging:** open a PR, wait for its `check` check-run to succeed, then squash-merge. The ruleset on `main` enforces this. `bash ~/.claude/skills/automatic-worker-lib/scripts/merge-green.sh <n>` waits and merges over REST.
- **GitHub reads over REST** (`gh api repos/...`). `gh pr view/list/checks` use GraphQL and hit the rate limit.
- **The Project:** every new issue goes into the Jill and Seek Project, with Area, Version and Agent set.

<!-- project-fields:start -->
The Project: <https://github.com/users/benburw3ll/projects/5>. Add each issue to it, then set each field from the table below (`gh project field-list 5 --owner benburw3ll --format json` re-reads the ids):

```sh
gh project item-add 5 --owner benburw3ll --url <issue url> --format json --jq .id   # prints the item id
gh project item-edit --project-id PVT_kwHOBKmb4s4BtZ_w --id <item id> --field-id <field id> --single-select-option-id <option id>
gh project item-edit --project-id PVT_kwHOBKmb4s4BtZ_w --id <item id> --field-id PVTF_lAHOBKmb4s4BtZ_wzhrjozQ --number <n>   # Build order
```

| Field                    | Field id                         | Options (option id)                                                                                                                                   |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Area                     | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjoyM` | Design `d72c027c`, Security `869155d0`, CI and tooling `8b8d8db9`, Docs and decisions `ff73a10e`, Core `d4185c4c`, Sources `271b7b3e`, Web `b191c60b` |
| Version                  | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjoyg` | v1 `dfe61fe4`, v1.1 `1f2e2a34`, Later `49442d8a`                                                                                                      |
| Agent                    | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjozM` | Claude `2c74b843`, Codex `1740c448`                                                                                                                   |
| Status                   | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjouk` | Todo `bfb00426`, In Progress `f6647c37`, Done `f49e7132`, Needs owner `3a036563`                                                                      |
| Build order (`--number`) | `PVTF_lAHOBKmb4s4BtZ_wzhrjozQ`   | The outcome's place in the Roadmap: O1 = 1, O2 = 2, O3 = 3, O4 = 4, O5 = 5, O6 = 6                                                                    |
<!-- project-fields:end -->
