# Which Minnesota sources allow automated reading

Research for issue #15, done on 2026-11-26. The registry (`packages/sources/src/registry/entries.ts`) holds each source's access kind, `checkedOn` and `checkNote`; this page sums it up. `pnpm sources:check` keeps the registry honest.

## How it was checked

- Each site's public `robots.txt` was read once, at human pace (about one request every two seconds), with Jill and Seek's own User-Agent `JillAndSeek/0.1.0 (+https://github.com/benburw3ll/jillandseek)`.
- 24PetConnect's terms of use (the PDF linked from the stray list) were read in full, because its source is the one read automatically (#14).
- Other sites' terms pages were not read in this pass, so no other source is cleared. A source without a terms check stays `link`, whatever its robots file says.
- No account was made, no organization was contacted, no individual listing was opened, and no staff or volunteer is named.
- A 403 or a bot check on the robots file is recorded as the site's "no" (ADR-0002 point 1) and is never worked around.

## Counts by access kind

27 sources in the registry on 2026-11-26.

| Access | Sources |
| --- | --- |
| `automatic` | 1 |
| `capture` | 3 |
| `link` | 23 |

- **Automatic:** Minneapolis Animal Care and Control's stray dogs, on 24PetConnect (#14).
- **Capture:** Facebook groups, Lost Dogs Minnesota (its posts are on Facebook), and Nextdoor. They wait on the owner's capture decision (ADR-0002 point 5).
- **Link:** everything else, including all seven metro counties and the 10 largest other cities.

## What the robots files said

| Source | Robots on 2026-11-26 |
| --- | --- |
| Anoka County | Admin, search and event paths disallowed |
| Carver County | 403: not read |
| Dakota County | No file (404) |
| Hennepin County | Allows everything (old domain redirects) |
| Ramsey County | Search, admin, login, `/sites/`, `.pdf` and `.aspx` disallowed |
| Scott County | 403 with a bot check: not read |
| Washington County | Admin, search and event paths disallowed |
| Saint Paul | Allows the generic agent |
| Rochester | System paths disallowed |
| Duluth | No file (404) |
| Bloomington | Allows the generic agent |
| Brooklyn Park | Event-calendar views disallowed |
| Plymouth | 403: not read |
| Woodbury | 403 with a bot check: not read |
| Maple Grove | Admin, search and event paths disallowed |
| Blaine | Admin, search and event paths disallowed |
| Lakeville | Admin, search and event paths disallowed |
| Animal Humane Society | Allows the generic agent; lost-and-found page 403 |
| PawBoost | Allows everything; pages 403 |
| Petco Love Lost | 403 with a bot check |
| Pet FBI | Allows everything |
| Craigslist Minneapolis | Replies and flags disallowed |
| Reddit | Disallows everything |
| Facebook | Disallows everything |
| Nextdoor | Disallows everything but two paths |
| 24PetConnect | No file (404) |

The 10 largest cities outside Minneapolis are taken from the 2020 census: Saint Paul, Rochester, Duluth, Bloomington, Brooklyn Park, Plymouth, Woodbury, Maple Grove, Blaine and Lakeville.

## Shelter software platforms

| Platform | Robots on 2026-11-26 | Minnesota shelters seen using it |
| --- | --- | --- |
| 24PetConnect | No file; terms allow personal, non-commercial use | Minneapolis Animal Care and Control (its stray list, confirmed from the page) |
| PetHarbor | Disallows everything for the generic agent | None confirmed. Not readable automatically. |
| Shelterluv | Allows everything but `/admin/` | None confirmed. Terms not read. |

Which software the county and city programs run was not determined: none of their sites showed a page listing impounded dogs on the landing pages checked, and the research did not open further pages. That is the main gap for the next pass.

## Official feeds and partner programmes

None was found in this pass. No checked source advertised an RSS feed, a JSON API or a partner programme on the pages read. The next pass should look at each platform's own documentation (24PetConnect, Shelterluv, PetHarbor) for an export or partner feed, which ADR-0002 point 4 prefers to reading pages.

## Cleared for a collector

- **24PetConnect, as a platform:** cleared on 2026-11-26 (no robots file, terms allow personal non-commercial use, no bot check). Minneapolis is read by `macc-strays`; a follow-up issue (#31) covers finding the other Minnesota shelters that publish there and reading them with the same parser.

No other source or platform was cleared.
