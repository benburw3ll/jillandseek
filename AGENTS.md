# AGENTS.md - Jill and Seek

Guidance for AI coding agents and people working in this repo. `CLAUDE.md` imports this file, so it loads into every Claude Code session.

## Where things stand

Jill and Seek is a Minnesota lost-dog finder. The slug is `jillandseek`, and the name is never written with "&". The six decisions the build rests on are accepted ADRs in `docs/adr/`: purpose, sources, privacy, stack, records and AI. There is no app code here yet: O2 builds the workspace next. The plan is on the board: `docs/ROADMAP.md` holds the outcomes in build order (O1 decided, O2 to O4 build v1, O5 and O6 are v1.1), and each outcome's milestone holds its issues.

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
5. **Scan for secrets and personal data before every push.** CI's `check` job scans the whole history for secrets with gitleaks. The repo has no git hooks yet, so check by hand for personal data before pushing.
6. **A site's "no" is final.** ([ADR-0002](docs/adr/0002-sources.md))
   - Robots rules, bot checks, logins and terms are respected and never worked around: no headless browser to pass a check, no scraping service, no borrowed session, no User-Agent that pretends to be a browser.
   - A collector merges only after its source's robots rules and terms were checked and recorded, with the date, in the registry.
   - Every request goes through the one shared fetcher, with the User-Agent `JillAndSeek/<version> (+<the repo's URL>)`. A source is read at most once every 30 minutes, with backoff on errors. A source that answers 403, 429 or a challenge page is marked blocked and is not read again until the owner clears it.
   - No test reaches the internet. A fixture is a made-up page in the real page's shape, never a saved copy of a live page.
7. **AI with a budget.** ([ADR-0006](docs/adr/0006-ai.md)) v1 makes no model calls. Every later model call goes through one client that counts calls, enforces a daily and a monthly cap and logs counts only. Tests use a fake client, and no code path goes around it. Nothing is sent for a feature the owner hasn't turned on, and never contact details or anything about the owner.

## Platform

[ADR-0004](docs/adr/0004-stack.md) sets the stack. #8 builds it and fills in the commands here.

- **Layout:** a TypeScript pnpm workspace on Node 26.
  - `packages/core`: the records, their zod schemas and matching. Pure, with no I/O.
  - `packages/sources`: the source registry, the collectors and their one fetcher.
  - `apps/server`: Hono on Node. The API, the sweep, and the SQLite database behind one repository module.
  - `apps/web`: React and Vite.
- **The gate:** `pnpm check` runs a personal-values scan, typecheck, lint, tests and build, in that order. CI's `check` job runs it with gitleaks, and nothing merges while it is red.
- **Where it runs:** on the owner's computer only. The server binds `127.0.0.1`.
- **Dependencies:** the runtime dependencies are the ones ADR-0004 names. Another one needs a short ADR first.

## Terms

Use these words, with these meanings, in code, issues, PRs and screens ([ADR-0005](docs/adr/0005-records.md) has each record's fields).

| Word | Meaning |
| --- | --- |
| Dog | A missing dog being searched for |
| Listing | One post or record that might be that dog. Its kind is `shelter-stray`, `found`, `lost`, `sighting` or `unknown` |
| Source | One place listings come from. Its access is `automatic`, `capture` or `link` |
| Registry | The list of every source Jill and Seek knows about, read or not |
| Collector | The code that reads one automatic source, or one shelter software platform |
| Sweep | One run of the collectors over the sources that are due |
| Match | One listing scored against one dog, as a ranking. Never an identification |
| Band | How strong a match is: `strong`, `possible` or `weak`. Shown instead of a score |
| Set aside | A match with a hard contradiction. Still stored and still shown, with its reason |
| Watch | A search that keeps running (O5) |
| Capture | Posts read from a page the person opened (O6) |
| Data home | The folder outside git where real data lives, named by `JILL_HOME` |

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

  | Field | Field id | Options (option id) |
  | --- | --- | --- |
  | Area | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjoyM` | Design `d72c027c`, Security `869155d0`, CI and tooling `8b8d8db9`, Docs and decisions `ff73a10e`, Core `d4185c4c`, Sources `271b7b3e`, Web `b191c60b` |
  | Version | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjoyg` | v1 `dfe61fe4`, v1.1 `1f2e2a34`, Later `49442d8a` |
  | Agent | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjozM` | Claude `2c74b843`, Codex `1740c448` |
  | Status | `PVTSSF_lAHOBKmb4s4BtZ_wzhrjouk` | Todo `bfb00426`, In Progress `f6647c37`, Done `f49e7132`, Needs owner `3a036563` |
  | Build order (`--number`) | `PVTF_lAHOBKmb4s4BtZ_wzhrjozQ` | The outcome's place in the Roadmap: O1 = 1, O2 = 2, O3 = 3, O4 = 4, O5 = 5, O6 = 6 |
<!-- project-fields:end -->
