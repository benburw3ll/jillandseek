# 0005. One Listing record for every kind of post, and one set of words

- Status: Accepted (2026-11-26)
- Date: 2026-11-26
- Deciders: the owner
- Supersedes / Narrows: (none)

Accepted 2026-11-26 by the owner's go-ahead on the recommended option (issue #6, option A).

## Context

- The database outlives every screen. Once real listings pile up, renaming a table or a field costs a migration, and code, docs and issues drift apart unless they use the same words.
- There is no schema and no code yet. #9 creates the tables this record names.
- Research recorded in issue #6: an earlier local prototype used the words Dog, Listing, Match, Set aside, Watch and Capture, and they worked.
- [0002](0002-sources.md) sets the access kinds and the blocked state. [0003](0003-privacy.md) sets what is kept and when it is deleted. [0004](0004-stack.md) puts the schemas in `packages/core` and the SQL in one repository module.
- Listings come from very different places: a shelter's stray list, a found-dog post, a sighting, a captured page. A matcher that has to join a table per kind is slower to write and to change.

## Decision

1. **Terms.** These words are used in code, issues, PRs and screens, with these meanings:
   - **Dog:** a missing dog being searched for.
   - **Listing:** one post or record that might be that dog.
   - **Source:** one place listings come from.
   - **Sweep:** one run of the collectors over the sources that are due.
   - **Match:** one listing scored against one dog, as a ranking.
   - **Set aside:** a match with a hard contradiction. It is still stored and still shown, with its reason.
   - **Watch:** a search that keeps running (O5).
   - **Capture:** posts read from a page the person opened (O6).
2. **Records.** Names are `snake_case` in the database and `camelCase` in TypeScript and JSON. Times are ISO 8601 UTC text with milliseconds, so they sort as text. Dates are `YYYY-MM-DD`. Lists and objects are stored as JSON text.
   - **source**
     - `id`: text, the registry's stable slug.
     - `name`, `url`, `region` (the state, county or city it covers, or `national`).
     - `listing_kinds`: the kinds it carries.
     - `access`: `automatic` | `capture` | `link`.
     - `collector`: the collector's id when `access` is `automatic`, otherwise null.
     - `checked_on`, `check_note`: the robots and terms check ([0002](0002-sources.md)).
     - `notes`: free text from the registry, or null.
     - `status`: `active` | `blocked` | `retired`.
     - `blocked_at`, `blocked_reason` (a code: `http-403`, `http-429`, `challenge` or `robots`), `last_read_at`.
     - The registry owns every field except `status` going to `blocked`, `blocked_at`, `blocked_reason` and `last_read_at`. Those belong to the sweep, and a registry sync never clears them. Only the owner clears a block.
     - When the fetcher finds an automatic source's pages disallowed by robots, the sweep marks it `blocked` (`robots`). Moving it to `link`, as [0002](0002-sources.md) point 2 says, is then a change to its registry entry.
   - **sweep**
     - `id`, `started_at`, `finished_at`.
     - `counts`: `{ sourcesDue, sourcesRead, listingsSeen, listingsNew, listingsUpdated, listingsGone }`.
     - `errors`: a list of `{ sourceId, code }`. Codes only, never page text.
   - **listing**
     - `id`, `source_id`, `source_key` (the source's own id for the post), `url`.
     - `kind`: `shelter-stray` | `found` | `lost` | `sighting` | `unknown`.
     - `species`: `dog` | `other` | `unknown`.
     - `posted_at`: when the source says it was posted or taken in, or null.
     - `first_seen_at`, `last_seen_at`: when a sweep first and last read it.
     - `gone_at`: when a full read first missed it, or null.
     - `place_text`: the place as the post gave it.
     - `town`, `county`: the Minnesota town and county when they are known, otherwise null. The Listings page filters on them.
     - `lat`, `lon`, `place_precision` (`point` | `town` | `county` | `unknown`).
     - `traits`: the shape below.
     - `text`: the post's own words.
     - `photo_urls`: the photos' source URLs.
     - `contact`: the contact lines the public post showed, as posted, or null. Local screens only ([0003](0003-privacy.md)).
   - **dog**
     - `id`, `label`.
     - `last_seen_at`: when the dog was last seen.
     - `last_seen_town` (a Minnesota town from the local towns table) and `last_seen_place` (an optional street or landmark).
     - `lat`, `lon`, `place_precision`.
     - `traits`, `marks` (distinguishing marks), `notes`.
     - `photos`: file names inside the data home's `photos/`.
     - `status`: `missing` | `found`. `found_at`, `created_at`, `updated_at`.
   - **match**
     - `dog_id`, `listing_id` (together the key).
     - `score`: a number from 0 to 1, used for ordering and never shown.
     - `band`: `strong` | `possible` | `weak`.
     - `reasons`: a list of plain-word sentences.
     - `set_aside_reason`: null, or `not-a-dog` | `before-missing` | `lost-post` | `long-gone`.
     - `computed_at`.
   - **traits**, the same shape on a dog and on a listing:
     - `breeds`, `colors`: lists of lower-case words as the post gave them. Synonyms are the matcher's job, so nothing is rewritten when it is collected.
     - `size`: `small` | `medium` | `large` | `unknown`.
     - `sex`: `male` | `female` | `unknown`.
     - `age`: `puppy` | `young` | `adult` | `senior` | `unknown`.
   - **watch** and **capture** arrive with O5 and O6, each by its own migration.
3. **One listing per post.** A listing is unique by (`source_id`, `source_key`). A repeat read updates `last_seen_at` and any field that changed, and never makes a second row.
4. **Unknown is a value.** It is never a guess: an unclear post is kind `unknown`, never `lost`. An unknown trait never lowers a score. A place that can't be placed has null `lat` and `lon` and precision `unknown`.
5. **Versioned contracts.** The API has one whole-number version, starting at 1. `GET /api/health` reports it as `apiVersion`, and a breaking change to any route raises it. The extension's payload (O6) carries its own `version`, and the server refuses a version it doesn't know.

`last_seen_at` means two things, on purpose, because each reads naturally where it is used: on a listing it is the last time a sweep read the post, and on a dog it is the last time anyone saw the dog.

## Consequences

- One matcher and one page cover shelter strays, found posts, sightings and captures.
- Each source's own fields have to be mapped into one shape. What doesn't fit goes in `text`, and a trait a source doesn't give is `unknown`.
- After this record is accepted, a field name changes only through a new ADR and a migration.
- The schemas live in `packages/core` and the types are inferred from them ([0004](0004-stack.md)), so the web app, the server and the collectors share one definition.
- `species` lets the matcher set aside a listing that is known not to be a dog (#19) without dropping it at collection.
- Keeping breed and colour words as posted means the synonym table can improve later without re-reading any source.
- AGENTS.md gets a Terms section with the words above.

## Alternatives considered

**B. A table per source kind** (shelter animals, social posts, sightings). Closer to each source's own shape. But every matcher, page and deletion rule would have to join them, and each new kind would be a new table.

**C. Store raw pages and parse them when needed.** Flexible, since a parser fix needs no new read. But it is slow to search, and it keeps far more of strangers' text than [0003](0003-privacy.md) allows.
