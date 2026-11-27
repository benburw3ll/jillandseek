# 0001. Jill and Seek is a Minnesota-deep aggregator, measured four ways

- Status: Accepted (2026-11-26)
- Date: 2026-11-26
- Deciders: the owner
- Supersedes / Narrows: (none)

Accepted 2026-11-26 by the owner's go-ahead on the recommended option (issue #2, option A).

## Context

- The aim is to beat every lost-dog finder people use today. "Beat" has to be a number before anything is built: real hits will be rare at first, so quality can't be judged by waiting for one.
- [`docs/research/finders.md`](../research/finders.md) compares the finders people use today, checked on 2026-11-26. In short:
  - Petco Love Lost matches photos across a national database, fed by partner shelters and by people's own posts.
  - PawBoost broadcasts a lost-pet post as alerts. It is not a list to search.
  - Lost Dogs Minnesota is a volunteer group that pairs lost and found reports by hand.
  - Pet FBI is a national database of reports people file.
  - Shelters and animal control publish their own stray lists, each on its own site or shelter software.
  - Facebook groups, Nextdoor and Craigslist hold many posts, mostly behind a login or in no fixed shape.
- So a person looking for one dog in Minnesota checks many sites by hand, again and again. No finder gives one search across the Minnesota sources.
- The owner uses Jill and Seek first, on the owner's own computer, to find dogs for other people. A public website is the long-term aim and waits for a hosting decision.

## Decision

1. **Who it serves.** First the owner, finding dogs for other people in Minnesota. Then volunteers. Then the public, once a hosting ADR exists.
2. **How it beats other finders.** Four measures, each a number the app can report:
   - **Coverage:** the count of Minnesota sources in the registry, and the share of them read automatically.
   - **Freshness:** the time from a listing appearing at its source to it being in Jill and Seek. The target is 30 minutes for automatic sources.
   - **Matching:** recall at 20 on the synthetic test set (#18): how often a missing dog's true listings are in its top 20.
   - **One search instead of ten sites:** the count of sources one search covers. A dog is entered once and ranked against every listing from every source.
3. **Honesty.** A match is a ranking, never an identification. Every result says to go and see the dog in person. No screen, reason or message says a dog was found or identified.
4. **Free to use.** No fees, ads or paid tiers. Running it as a nonprofit is a later idea, not a v1 goal.
5. **Scope.** Minnesota first: sources that cover Minnesota, and national ones for their Minnesota listings. Other states come only through a later ADR.

## Consequences

- Every later choice can be tested against a measure. A feature that moves none of the four waits.
- Coverage and freshness depend on what sites allow ([0002](0002-sources.md)), so they grow through research, official feeds and capture, not through force.
- Matching is measured on made-up dogs (#18) before the matcher exists (#19), so "getting stronger" is a figure in a PR and never a feeling.
- The app is narrow at first: one state, one user. That is what lets it be finished and measured.
- The Sources page shows coverage (#16), and the sweep records what freshness needs ([0005](0005-records.md)).
- The honesty rule binds the wording of every screen: bands and reasons, never "found your dog" (#19, #20).

## Alternatives considered

**B. A national photo-matching service.** This goes head to head with Petco Love Lost, which already has a far bigger database and shelter partners. Beating it needs other people's photos at a scale a new project can't reach, and it sends those photos to a model ([0006](0006-ai.md)).

**C. A community posting site.** People would post their lost and found dogs on Jill and Seek. It is no use until it has an audience, and it duplicates what Lost Dogs Minnesota's volunteers already do well.
