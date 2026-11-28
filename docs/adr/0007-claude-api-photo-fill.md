# 0007. The Claude API reads a missing dog's photo into the form, behind the capped client

- Status: Accepted (2026-11-28)
- Date: 2026-11-28
- Deciders: the owner
- Supersedes / Narrows: narrows [0004](0004-stack.md) point 5 and [0006](0006-ai.md) points 1, 3, 5 and 6

Accepted 2026-11-28 by the owner's go-ahead on the recommended options (issue #55), with caps of 25 calls a day and 300 a month.

## Context

- A search usually starts with a picture of the missing dog. Typing out what the picture already shows is slow, and the owner asked on 2026-11-27 for the form to fill itself from the photo.
- [0006](0006-ai.md) keeps v1 free of model calls (point 1), lists the agent's later jobs in an order that has no such job (point 5), and leaves the key and the caps to the owner (point 3). [0003](0003-privacy.md) point 6 needs a decision of its own before anything is sent to an outside service. [0004](0004-stack.md) point 5 names every runtime dependency, and the Anthropic SDK is not one.
- Today no file in `apps/` or `packages/` calls a model. `apps/server/src/settings.ts` reads every setting from the environment through one zod schema, and only `apps/server/src/db/` runs SQL.
- In the Claude Console, a workspace named `jillandseek` was made on 2026-11-28 with a monthly spend limit of 20 USD. It has no API key yet.
- Other tools on the owner's computer use Anthropic credentials of their own. A key in an `ANTHROPIC_*` environment variable would be picked up by them, and theirs by this app.
- What Anthropic keeps, read on 2026-11-28:
  - Inputs and outputs sent to the API are deleted from its back end within 30 days. A request its trust and safety systems flag can be kept for up to 2 years, and the classification scores for up to 7. ([How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data), last updated 2026-07-01)
  - Retained data is not used to train models without express permission. With structured outputs the JSON schema alone is cached, for up to 24 hours. ([API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention))

## Decision

1. **The first AI job is reading the missing dog's photo into the form's traits.** It runs only when the owner adds a photo with AI turned on.
   - This ends [0006](0006-ai.md) point 1 for this one job, and puts it ahead of point 5's order. The rest of 0006 stands.
   - A read answers only what the dog looks like: breed words, colours, size, sex, age and marks. It never says whether a listing is the dog ([0001](0001-purpose.md) point 3).
2. **Off until turned on.** One setting, `JILL_AI`, is `off` by default, in tests and under `pnpm dev` too. With it off no model call can be made, and the app works fully without a key.
3. **The SDK** is `@anthropic-ai/sdk`, a runtime dependency of `apps/server` only, pinned like the others. Only `apps/server/src/ai/` imports it. This narrows [0004](0004-stack.md) point 5 by that one package and what it installs with it.
4. **The model** is `claude-opus-5-5` by default. `JILL_AI_MODEL` names another: Sonnet and Haiku cost less per call.
5. **The key** is for Jill and Seek only: made in its own Console workspace, which has a monthly spend limit, with auto-reload off.
   - It is saved encrypted to the owner's Windows account, in a file under the user's profile, outside the repo and the data home. `JILL_AI_KEY_FILE` points at another file.
   - It is never in the repo, the data home, an environment variable, a shell profile or a settings file. No page of the site reads, shows or takes it, and nobody but the owner creates or pastes it.
   - The client is given the key and the API's address explicitly, so no `ANTHROPIC_*` variable or signed-in profile on the computer can supply a credential or send a photo somewhere else.
6. **The caps** are 25 calls a day and 300 a month, confirmed by the owner on 2026-11-28. They are the settings `JILL_AI_DAILY_CAP` and `JILL_AI_MONTHLY_CAP`.
   - Days and months are UTC. A call is counted before it is sent, so a crash never undercounts, and the client does not retry, so one counted call is one request.
   - If Anthropic declines a read and runs it again on another Claude model inside the same request, that second run is counted as a call of its own.
   - The workspace's spend limit is the backstop. No credit is bought for this.
7. **What is sent** is the one photo, with its metadata (such as where it was taken) removed, and a fixed instruction. Nothing else: not the dog's name, the owner's notes, the place, the time, contact details or anything about the owner. No listing's text or photo is sent.
8. **The answer** is asked for as structured output and checked against the trait schema before it reaches a field. What the model can't tell stays `unknown`, a field the owner already typed is never overwritten, and every filled field stays editable. The screen says the photo is sent to the Claude API.
9. **[0006](0006-ai.md) point 6 does not cover form filling.** The synthetic set holds no photos and the rules have no photo baseline to beat. The owner checks every field before the search runs. An AI feature that ranks or compares still has to beat the rules there.
10. **The check.** `pnpm ai:check` lists the models, which costs nothing, to show whether the saved key works. It is the only other request to Anthropic, it sends nothing but the key, and it prints no part of it.
11. **Logs** hold ids, counts and timings as before ([0003](0003-privacy.md) point 5): never the key, the request, the answer or an API error's message.

## Consequences

- A photo of the owner's own dog leaves the computer when AI is on, and Anthropic keeps it for up to 30 days. Nothing of a stranger's is sent.
- The capped client, its counts table and its fake are built and reviewed as a guard before any feature uses them ([0006](0006-ai.md), consequences).
- The key lives outside the data home, so a backup or a copy of `data/` never carries it. A new computer or Windows account needs the key saved again, because the encryption belongs to the account.
- The save script and the key's decryption are Windows only. On another system the app says no key is saved, and everything else works.
- A day's 26th read and a month's 301st are refused with a plain message, and the form is filled by hand as before.
- Removing metadata is written in the app, with no new dependency. A photo loses its orientation tag with the rest.
- AGENTS.md hard rule 7 and its Platform section change to match, and `docs/claude-api.md` holds the install steps.
- A second AI job needs its own decision: this record allows one.

## Alternatives considered

**B. Keep to [0006](0006-ai.md)'s order.** The second look at a match would come first, and the form would stay hand-typed until then. But the form is the first thing the owner meets on every search, and reading one photo of the owner's own dog sends nothing of a stranger's.

**C. A local vision model.** Nothing would leave the computer and no call would cost anything. But it is a large install, slower on the owner's machine and weaker at breeds and marks, and [0006](0006-ai.md) already weighed local models and left them for later.

**D. The key in an environment variable or a `.env` file.** It is the usual way and needs no script. But every other tool on the computer that speaks to Anthropic would then bill this key, and a `.env` file sits one mistake away from a commit.
