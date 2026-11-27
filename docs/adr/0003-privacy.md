# 0003. Keep only what the public post showed, on the owner's computer, for a limited time

- Status: Accepted (2026-11-26)
- Date: 2026-11-26
- Deciders: the owner
- Supersedes / Narrows: (none)

Accepted 2026-11-26 by the owner's go-ahead on the recommended option (issue #4, option A).

## Context

- Lost-and-found posts carry strangers' names, phone numbers, addresses and photos. Jill and Seek will collect thousands of them.
- The repo is public, and a public website is the long-term aim ([0001](0001-purpose.md)).
- `.gitignore` already ignores `/data/`, `/secrets/`, `.env*`, keys, logs, images and `.dev-home/`, so real data has a place outside git.
- CI's `check` job scans every commit for secrets with gitleaks. Nothing scans for personal data yet: #8 adds that check.
- `data/` also holds private notes (`data/ideas/`, and the build runs' briefs in `data/runs/`). They are not the app's data.
- Changing these rules after real data arrives means a migration and a clean-up, so they are set before the database is designed (#9).

## Decision

1. **Where real data lives.** Only in the data home, a folder outside git that `JILL_HOME` names: `data/` for real use, `.dev-home/` in development, and a temp folder in tests.
   - Real data is never in tests, fixtures, logs, screenshots, issues or PRs. Tests use made-up data.
   - The app owns only what it creates in the data home by name: the database file, `photos/` and `cache/`. It never reads, lists or removes anything else there, so the private notes in `data/` stay untouched.
2. **What is kept.** A listing keeps what its public post showed, plus its link. Nothing more is looked up or worked out about a person.
   - Contact details show only on the owner's local screens.
   - Any future public page links to the original post instead of showing them.
3. **Deletion.**
   - A listing that has left its source is deleted 90 days after it was last seen (`JILL_KEEP_GONE_DAYS`).
   - A dog the owner marks found is deleted, with its matches and photos, 30 days later (`JILL_KEEP_FOUND_DAYS`).
   - Both lines are settings with these defaults. Deleting a listing deletes its matches and any cached photo with it.
   - Pruning runs when the server starts and once a day.
4. **Photos.** A listing's photo is kept as its source URL. A derived fingerprint is added when photo matching is decided. A local copy, if one is ever cached, lives only as long as its listing.
   - In v1 the site shows a listing's photo straight from its source URL, with no referrer sent.
   - A missing dog's photos, which the owner adds, live in the data home's `photos/` and are deleted with the dog.
5. **Logs** hold ids, counts and timings. They never hold post text, names, contact details, places, request bodies or query values. An error is logged as a code and an id.
6. **Nothing leaves the computer** except the sweep's reads, and the owner's own browser loading a listing's photo or opening its link. Any outside service (an AI model, an alert channel, a geocoder, map tiles, analytics, hosted fonts) needs its own ADR or the owner's decision, and is off until then.

## Consequences

- If the computer is lost, what is lost is a bounded copy of public posts, and nothing ever needs unpublishing.
- The database is designed with deletion in it from the start: `gone_at` and `last_seen_at` on a listing, `found_at` on a dog, and `pruneExpired` (#9, [0005](0005-records.md)).
- Tests, fixtures and screenshots need made-up data, which costs a little work in every issue. #8's personal-values scan catches the common slips before a push.
- Debugging from logs is harder, because a log line never shows the post that failed. The id is there to look it up locally.
- The retention lines are defaults the owner can change, not hard limits.
- AGENTS.md hard rule 2 widens to cover strangers' data and names the data home.

## Alternatives considered

**B. Keep everything forever.** A bigger archive might help matching one day. But it piles up strangers' details with no end date, and most of them stop being useful within weeks.

**C. Keep no contact details at all, only a link to the post.** The safest choice. But the owner would then have to open every post to reach anyone, and a post that is taken down takes its contact with it while the dog is still being held.
