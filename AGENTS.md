# AGENTS.md - Jill and Seek

Guidance for AI coding agents and people working in this repo. `CLAUDE.md` imports this file, so it loads into every Claude Code session.

## Where things stand

Jill and Seek is a Minnesota lost-dog finder. The slug is `jillandseek`, and the name is never written with "&". There is no app code here yet. The plan is on the board: `docs/ROADMAP.md` holds the outcomes in build order (O1 decides, O2 to O4 build v1, O5 and O6 are v1.1), and each outcome's milestone holds its issues.

On 2026-11-26 the owner agreed to start the build: each O1 ADR issue (#2 to #7) is written up as an accepted ADR with its **Recommended** option, unless the owner has commented otherwise on that issue. The build issues follow those ADRs.

`data/` is git-ignored and holds private notes, including the owner's ideas in `data/ideas/`. No code reads that folder, and nothing from it is quoted in files, issues or PRs.

## Hard rules

1. **Plan before building.** Nothing is built ahead of the accepted ADR that binds it. O1's ADRs come first, and every build issue names the ADRs it follows.
2. **This repo is meant to be public.** No names, contacts, addresses, photos, tokens or keys of any real person, and no real dog owner's or finder's details, in files, commit messages or issues. Examples use made-up data. Say "the owner".
3. **No self-hosted runners.** The repo variable `CI_RUNNER` stays unset: CI runs on GitHub's standard runners.
4. **Never commit straight to `main`.** No force pushes, never skip hooks. Work on a branch and merge through a pull request.
5. **Scan for secrets and personal data before every push.** CI's `check` job scans the whole history for secrets with gitleaks. The repo has no git hooks yet, so check by hand for personal data before pushing.

## Workflow

- **Planning:** decisions are issues in the **O1 · Decide the shape** milestone, filed with the ADR issue template. Each one ends as an accepted record in `docs/adr/` (copy `0000-template.md`).
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
