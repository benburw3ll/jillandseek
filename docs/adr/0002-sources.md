# 0002. Read only what a site allows, and capture the rest through the person's own browser

- Status: Accepted (2026-11-26)
- Date: 2026-11-26
- Deciders: the owner
- Supersedes / Narrows: (none)

Accepted 2026-11-26 by the owner's go-ahead on the recommended option (issue #3, option A).

## Context

- "Search everything" runs into sites that forbid or block automated reading. Many Minnesota lost-dog posts are in Facebook groups and on Nextdoor, which do both.
- Research recorded in issue #3, from an earlier local prototype on 2026-11-26:
  - the Minneapolis Animal Care and Control stray list on 24PetConnect answered a plain script;
  - the Animal Humane Society, PawBoost and Petco Love Lost answered with a bot check;
  - Reddit's robots rules disallow automated reading;
  - Facebook's terms restrict automated collection;
  - Craigslist and Nextdoor were not tried.
- Robots files read for this record on 2026-11-26 ([`docs/research/finders.md`](../research/finders.md) has the table):
  - Facebook's disallows everything for the generic agent and says that collecting data by automated means is prohibited.
  - Nextdoor's disallows everything for the generic agent except two paths that hold no lost-pet posts.
  - PawBoost's allows everything, yet its pages answered a plain fetch with 403.
  - The Animal Humane Society's allows the generic agent and blocks a list of named crawlers, and its lost-and-found page answered a plain fetch with 403.
  - Craigslist's Minneapolis site disallows a few paths (replies and flags) and not its listing pages. Its terms were not checked for this record.
  - 24PetConnect serves no robots file (404).
- So a robots file is not the whole answer. A site can allow in robots and still refuse with a bot check, a login or its terms. Any of them is a no.
- Breaking a site's terms could get the project blocked, or worse, and would cost the trust a public finder needs.

## Decision

1. **A site's "no" is final.** Robots rules, bot checks, logins and terms are respected and never worked around. That rules out a headless browser used to pass a check, scraping services, rotating addresses, borrowed cookies or sessions, and a User-Agent that pretends to be a browser.
2. **Checked before reading.** Before a collector merges, its source's robots rules and terms are checked, and the registry entry records what they said and the date (`checkedOn`, `checkNote`). An `automatic` entry without them fails the gate. A source whose robots rules or terms later say no moves to `link`.
3. **One honest User-Agent, and a slow pace.**
   - Every request carries `JillAndSeek/<version> (+<the repo's URL>)`.
   - A source is read at most once every 30 minutes. A read is one pass of its collector over the pages it needs, with requests to one host spaced out.
   - Network errors back off. A source that answers 403, 429 or a challenge page is marked blocked and is not read again until the owner clears it.
   - Requests are https only, and every request goes through the one shared fetcher.
4. **Official feeds first.** An official feed or API (RSS, JSON, a shelter software export) is preferred to a page. One collector per shelter software platform covers every shelter that runs it.
5. **Capture.** A page that can't be read automatically is captured by the person's own browser through the O6 extension, which reads only the page they opened. Whether it may read Facebook and Nextdoor waits on the owner's decision (a `Decide:` draft on the Project).
6. **Everything goes in the registry.** Every source Jill and Seek learns about has an entry with its access kind: `automatic` (a collector reads it), `capture` (the person's browser sends it) or `link` (the site only links to it). A source that is never read is still an entry, and a link the site offers.

## Consequences

- Coverage grows more slowly than a scraper's would. It grows through research (#15), official feeds, one collector per platform, and capture (O6).
- The rules live in code, not only here: the shared fetcher enforces the User-Agent, robots, the pace and the blocked state (#13), and `pnpm sources:check` enforces the check record (#12).
- The 30-minute freshness target ([0001](0001-purpose.md)) applies to automatic sources only.
- A blocked source is visible on the Sources page instead of being retried quietly.
- No test reaches the internet. A collector's fixture is a made-up page in the real page's markup shape, never a saved copy of a live page ([0003](0003-privacy.md)).
- AGENTS.md carries points 1 to 3 as a hard rule, so every collector's brief has them.

## Alternatives considered

**B. Scraping services or headless browsers that get past bot checks.** More coverage on the first night. But it breaks the sites' terms, breaks whenever a site changes its check, and risks the project's name and the owner's.

**C. Links only.** Jill and Seek would build a search link for each site and read nothing. It is safe, but it can't be fresher or more complete than the sites themselves, so it can't beat any finder.
