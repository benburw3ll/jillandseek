# The finders people use today

Research for [ADR-0001](../adr/0001-purpose.md) and [ADR-0002](../adr/0002-sources.md). Checked on **2026-11-26**.

How it was checked: one plain fetch of each site's public about or help page and its robots file, plus web-search summaries. A page that refused the fetch was not tried again or reached another way ([ADR-0002](../adr/0002-sources.md), point 1). The "Basis" column says which facts were read on the site itself. No listing, group or post was opened, and no person is named.

## The finders

| Finder | What it does | What it covers | How it gets listings | What it lacks for one missing dog in Minnesota | Basis |
| --- | --- | --- | --- | --- | --- |
| [Petco Love Lost](https://petcolovelost.org) | A free national lost-and-found database that matches an uploaded photo against its listings | The United States | Partner shelters' software, plus photos from owners and finders | No Minnesota view. It sees only shelters that joined, and nothing from Facebook, Nextdoor or other finders | Search summaries. Its own pages answered 403 |
| [PawBoost](https://www.pawboost.com) | Sends a lost-pet post out as alerts: its local Facebook pages, email and its app. Posting is free, and wider reach is paid | The United States, by area | People post their own reports | It broadcasts. It is not a list of found dogs or strays to search | Search summaries. Its about page answered 403 |
| [Lost Dogs Minnesota](https://lostdogsmn.com) | A volunteer group that takes lost-dog and found-dog reports and pairs them up by hand. Free | Minnesota | Its own report forms and its Facebook page | No feed or search across other sources. It depends on volunteers' time | Search summaries. Only its robots file was read |
| [Pet FBI](https://petfbi.org) | A nonprofit database of lost and found pet reports, with matching by place, date and kind of animal | The United States and Canada | People file reports | National, with no Minnesota focus. It names no shelter feeds | Read on the site |
| [24PetConnect](https://24petconnect.com) | The public search of a shelter software platform: strays and adoptable animals, by agency | The agencies that use the platform | Each agency's own records | One agency at a time. The earlier research in issue #3 read the Minneapolis stray list here. Which other Minnesota agencies publish through it is not yet known (#15) | Issue #3's research, and search summaries |
| [Animal Humane Society](https://www.animalhumanesociety.org) | Lists the strays it holds, and runs lost and found bulletin boards | Its Twin Cities shelters, and the cities that contract with it | Animals brought in, plus people's posts on its boards | Only what it holds or what is posted there. Not statewide | Search summaries. Its lost-and-found page answered 403 |
| Facebook lost-pet groups | Neighbours and owners post photos and sightings | Local and regional groups | Members' posts | No fixed shape, behind a login, and closed to outside search | Its robots file, read on the site, and search summaries |
| Nextdoor | Neighbourhood posts and alerts | Members of each neighbourhood | Members' posts | Behind a login, and private to each neighbourhood | Its robots file, read on the site |
| Craigslist (lost and found, pets) | Classified posts | One site per city | Anonymous posts | No fixed shape, no checks on who posts, and nothing ties a post to a shelter | Its robots file, read on the site |
| Microchip registry lookups | Tell which registry holds a chip's record | The registries that take part | The registries | Useful only once someone has scanned the dog's chip | Search summaries |

## What their robots files say

One fetch of `/robots.txt` on 2026-11-26. "Generic agent" means the rules for `User-agent: *`. A robots file is only one of the checks in ADR-0002: a bot check, a login or the site's terms can still say no.

| Host | For the generic agent | Note |
| --- | --- | --- |
| `24petconnect.com` | No robots file (404) | Terms are checked on the day a collector is built (#14) |
| `petcolovelost.org`, which redirects to `petcolove.org` | Not readable: 403 | The earlier research met a bot check too |
| `www.pawboost.com` | Everything allowed | Its pages still answered 403 to a plain fetch |
| `www.animalhumanesociety.org` | Allowed | Blocks a list of named crawlers. Its lost-and-found page answered 403 |
| `www.reddit.com` | Not read for this table | Issue #3's research: its robots rules disallow automated reading |
| `www.facebook.com` | Everything disallowed | The file says that collecting data by automated means is prohibited |
| `nextdoor.com` | Everything disallowed, bar two paths with no lost-pet posts | |
| `minneapolis.craigslist.org` | A few paths disallowed (replies, flags). Listing pages are not | Terms not yet checked (#15) |
| `petfbi.org` | Not read: the fetch returned no rules | #15 checks it |
| `lostdogsmn.com` | Everything allowed | Terms not yet checked (#15) |

## What this means for Jill and Seek

- Each finder covers its own posts or its own shelters. None gives one search across the Minnesota sources, which is the gap ADR-0001 aims at.
- The two biggest pools of posts, Facebook and Nextdoor, forbid automated reading. They can only ever arrive through capture, and only if the owner decides so (ADR-0002, point 5).
- Shelter software platforms are the best route to coverage: one collector per platform can cover every shelter that runs it (ADR-0002, point 4). #15 finds out which Minnesota shelters run which.
- Several facts here come from search summaries, because the sites' own pages refused a plain fetch. #15 re-checks each source before any of them is read.
