# Decision records

Why Jill and Seek is built the way it is. One file per decision, numbered. An accepted record is never edited; to change one, write a new one that supersedes it. Copy `0000-template.md`.

| ADR | Decision | Status |
| --- | -------- | ------ |
| [0001](0001-purpose.md) | Jill and Seek is a Minnesota-deep aggregator, measured four ways: coverage, freshness, matching and one search | Accepted (2026-11-26) |
| [0002](0002-sources.md) | Read only what a site allows, and capture the rest through the person's own browser | Accepted (2026-11-26) |
| [0003](0003-privacy.md) | Keep only what the public post showed, on the owner's computer, for a limited time | Accepted (2026-11-26) |
| [0004](0004-stack.md) | A TypeScript pnpm workspace: React and Vite for the site, Hono on Node for the server, SQLite | Accepted (2026-11-26) |
| [0005](0005-records.md) | One Listing record for every kind of post, and one set of words | Accepted (2026-11-26) |
| [0006](0006-ai.md) | Rules first, with AI behind one capped client later | Accepted (2026-11-26) |
| [0007](0007-claude-api-photo-fill.md) | The Claude API reads a missing dog's photo into the form, behind the capped client | Accepted (2026-11-28) |

A new decision starts as an issue filed with the ADR issue template, in the milestone of the outcome it binds.
