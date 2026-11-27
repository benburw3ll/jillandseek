# Roadmap

Jill and Seek is a lost-dog finder that starts in Minnesota. It searches every source it is allowed to read, keeps a record of every source it learns about, and gets better at matching as it grows. It starts on the owner's own computer, where the owner uses it to find dogs for other people, and becomes a public website later.

It aims to beat the finders people use today on four measures the app can report ([ADR-0001](adr/0001-purpose.md)): **coverage** (the Minnesota sources in its registry, and the share read automatically), **freshness** (a listing is in Jill and Seek within 30 minutes of appearing at an automatic source), **matching** (recall at 20 on a synthetic test set) and **one search instead of ten sites**. A match is a ranking, never an identification. It is free to use.

## Roadmap

The table's order is the build order. Each outcome is a GitHub milestone, and its issues are the work list.

| Outcome | What it gives the owner | Status |
| --- | --- | --- |
| O1 Decide the shape | Every decision the build rests on is an accepted ADR: purpose, sources, privacy, stack, records, AI | Done |
| O2 The bare bones | The workspace, its gate, the database, the server and the site's first pages run on the owner's computer | Done |
| O3 The first sources | A registry of every known source, a sweep on a schedule, and the first Minnesota collectors filling the database | Planned |
| O4 Search for a missing dog | Enter a missing dog and see every collected listing ranked against it, with reasons | Planned |
| O5 Watches that keep looking (v1.1) | A dog's search re-runs on every sweep and alerts the owner on a new match | Planned |
| O6 The capture extension (v1.1) | A Chrome extension sends the posts on the page the person opened into Jill and Seek | Planned |

O1 came first: its six ADRs were accepted on 2026-11-26, and nothing is built ahead of the ADR that binds it (AGENTS.md, hard rule 1). O2 to O4 are v1, the version the owner uses first, and are built in order, because each one reads what the one before it stores. O5 and O6 are v1.1: both build on O4's matching. Ideas not yet designed (photo matching, AI second looks, a source-finding agent, the public website, a nonprofit) are draft items on the Project with Version Later, and become outcomes only when the owner picks them.
