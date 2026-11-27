# Places where lost, found and stray dogs get reported in Minnesota

Research of 2026-11-27: a list of candidates for the source registry, beyond the 27 entries it already holds. Nothing in it is cleared for automatic reading. Every source still needs its robots rules and terms checked, and recorded with the date, before a collector reads it (ADR-0002).

The strongest finding is structural. Almost no Minnesota city or county publishes a list of the dogs it holds. The lists that exist sit with a small number of holders: a contractor that serves dozens of cities, a humane society, or a joint police pound. So the useful unit for the registry is the holder, and the "Who holds whose strays" section below is the map from each city to its holder.

## How it was gathered

There were two passes. The first used web search and opened few pages. The research tool's limit of 200 web searches, shared by all 14 researchers, ran out early, so the two Facebook hunts (statewide and metro, and Greater Minnesota), the statewide directories, the tribal nations, the border areas, Reddit and local media got little or no searching. The Greater Minnesota Facebook hunt got none at all. The second pass opened pages only, from URLs the first pass found or links on those pages, with no search.

The Confidence column in the catalogue means this. `seen` means the page was opened and is what the row says. `search` means the row comes from a search result, or from a link on a page that was opened, and the page itself was not opened. `unsure` means the row is a weak lead: a directory listing, an old document, a news story, or a page that would not load.

The rules followed were these. Public pages only. A refusal (403, 429, bot check, login wall) is the site's final answer and was not worked around: no cached copies, no proxy, no other User-Agent. No accounts, no forms submitted, nobody contacted. No individual listing or post was opened, and no person is named. No robots or terms checks were made in this pass. No page on facebook.com was opened.

The catalogue at the end is the researchers' tables put together by a script, so no URL was retyped. A row marked `already in registry` in its notes is one of the 27 sources the registry holds. Left out of it: rows with no URL that was seen, the same URL listed twice, 67 rescues from the Adopt-a-Pet directory that rehome dogs and take no lost or found reports (the directory keeps one row), and five rows that pointed at one person's fundraiser or at a news story about one person or one dog. In the notes column, CACC is Companion Animal Care and Control, AHS is the Animal Humane Society, and PUPS is Pets Under Police Security.

Some failures were not the sites' doing. In the second pass the fetch tool's own domain safety check was rate-limited for a time, which stopped some reads (for example pawboost.com, pet911.org and a Mounds View page). Those are not refusals by the sites and are not listed as such below.

## Best candidates for automatic reading

These are the places that publish a public list of found, stray or impounded dogs, or a documented API, with no login seen. None has had its robots rules or terms checked. Most rows are thinner than they look: a page that exists is not the same as a page that shows dogs.

| Place | List URL | Platform | What it covers | What is not yet known |
| --- | --- | --- | --- | --- |
| Minneapolis Animal Care and Control, found by residents | https://24petconnect.com/MACCFoundPets?at=DOG | 24PetConnect | Strays found by residents in the last 30 days and held at the finders' homes. Linked from the city's find-a-lost-pet page | Page not opened. The registry's own note says the stray list page showed no residents' found list on 2026-11-26 |
| Companion Animal Care and Control, animals in care | https://companionanimalcontrol.com/animals-in-care | Own site (looks like Squarespace; no embed or iframe seen) | The biggest holder in the east and north metro; see the holder table. No login | Whether it lists strays or only adoptable animals; its platform; its `/lost-pets` photo page was not opened. Its terms are unread |
| Companion Animal Care and Control, service areas | https://companionanimalcontrol.com/service-areas | Own site | Not a list of dogs. The page that names the cities it serves, full service or impound-only | Whether it is current |
| Wadena County Humane Society, stray animals | https://wadenacountyhumanesociety.org/stray-animals/ | Shelterluv | Found pets for Wadena and Wadena County; the page is powered by Shelterluv | The Shelterluv list URL itself was not seen |
| Humane Society of Otter Tail County, lost and found | https://www.humanesocietyotc.org/lost-found | Petango/PetPoint (list hosted on ws.petango.com) | Searchable stray list for Otter Tail County, including Fergus Falls strays; 5 business day hold | The exact Petango list URL was not seen |
| Marshmallow Animal Shelter, recent arrivals | http://www.marshmallowfoundation.org/animals/browse?special=Recent+Arrivals | Own site (RescueGroups is a guess from page structure) | Found strays, not adoptables, for Detroit Lakes and the places it serves when called | Platform; whether the list is current |
| Humane Society of the Lakes, lost and found | https://www.hsofthelakes.org/lostandfound | Own site (Wix) | Animals held as strays in the Detroit Lakes and Becker County area, plus a lost and found form | How often the list changes |
| Lakes Area Humane Society, found and lost | http://www.lakesareahumanesociety.org/found%2Flost-animals | Own site | Stray list for Alexandria and Douglas County | The list was empty when read; it may lag its software |
| Babinski Foundation, lost animals | https://babinskifoundation.org/lost-animals | Own site (Squarespace) | Two sections, lost animals reported to it and strays in its facility, for the Pequot Lakes area; hand-entered | How often it is updated |
| Great River Rescue, lost and found | https://www.greatriverrescue.com/about/lost-found/ | Own site, with a Petstablished form | Found strays under a Stray Pets category for Bemidji; held at least 10 days | The category page https://www.greatriverrescue.com/category/lost-and-found/ was not opened. The form is https://petstablished.com/petlover/general_form/42321 |
| Mesabi Humane Society, current lost and found pets | https://mesabihumanesociety.org/pet-information/current-lost-and-found-pets/ | Own site | Virginia and the Iron Range | The listings are image links, so it is unclear whether they are found or lost dogs |
| Lake of the Woods Humane Society, lost and found | http://www.lowhumanesociety.com/lostfound.html | Own site | Baudette and Lake of the Woods County; says it posts lost and found on its site and Facebook | Whether the page holds a list |
| Paws and Claws Humane Society, found dogs | http://www.pawsandclaws.org/found-dogs | Own site (adoptables on Petango) | Rochester and several south-east counties | The page showed a heading and no list; it may load by script |
| Winona Area Humane Society, lost and found pets | https://winonahumane.org/lostandfoundpets | Own site | Winona County | The page showed "No results found" |
| Pope County Humane Society, lost and found | http://www.pchsmn.org/lost-and-found | Shelterluv (found-pet and missing-pet report forms) | Glenwood, Starbuck and Pope County | Forms, not a list; the form URLs were not seen |
| Scruffy Tails Humane Society, lost and found | https://scruffytails.org/lost-and-found | Shelterluv (adoptables) | Crookston, and Polk and Marshall counties | The page's content did not load |
| Tri-County Humane Society, lost and found | https://tricountyhumanesociety.org/lost-found/ | Own site; adoption pages say Shelterluv | The main stray intake for Stearns, Benton and Sherburne counties; strays are labelled "stray" on its adoption listings until the hold ends | The lost-and-found page itself lists no dogs. A Petfinder id was also seen, so the platform is unclear |
| Minnetonka police lost and found dashboard | https://mtka.maps.arcgis.com/apps/instant/portfolio/index.html?appid=a0bc030f046b4d649435318bafea91e9 | ArcGIS (Esri) | Impounded, lost and found animals for Minnetonka, kept 7 days, per a CBS report | The page opened as a bare "Portfolio" with no visible content (it needs scripts) |
| Pets Under Police Security, on Petco Love Lost | https://petcolove.org/lost/shelters/pets-under-police-security/2122/pets/ | Petco Love Lost | The joint police pound for the north-west suburbs | Refused with a 403 when fetched, so its contents are unknown. This is the only public page found for that pound |
| Hawk Creek Animal Shelter | https://www.thehskmc.com/ | Petfinder (adoptables); banners link Petco Love Lost | Willmar and Kandiyohi and Meeker counties | No own stray list was seen |
| nØkill Network API | https://nokillnetwork.org/developers | Own site | A documented free, read-only API of lost and found reports from the last 6 months, searchable by ZIP, with no owner contact data. The condition stated is a link back to the Network's page for each pet. An MCP endpoint is also offered | Terms page unread. The data's own source is not named. Likely duplicates PawBoost and Petco Love Lost |
| nØkill Network lost and found, Minnesota | https://nokillnetwork.org/lostandfound/minnesota/ | Own site | State page with city, status and species filters; no login seen | Same as above |

Three more public aggregators have Minnesota browse pages and no login: Petkey at https://petkey.org/recovery/lostpetindex/mn, Pet Radar at https://www.petradar.org/en/lost-and-found-dogs/us/minneapolis, and LostFoundPets.us at https://lostfoundpets.us/ (a state dropdown that includes Minnesota). None advertises an API or a feed. Pet Alert at https://www.petalertglobal.com/us/petalert-mn-minnesota looks auto-generated and low value. They are third-party copies of reports and likely repeat PawBoost and Petco Love Lost.

Documented feeds found on platforms: RescueGroups has a public REST API for adoptable animals (docs at https://api.rescuegroups.org/v5/public/docs, not opened by the researcher; animal records carry an "Is Found" attribute but no found-only filter was documented). Shelterluv's API needs a key from a shelter's own account, so it is not a public feed. Petco Love Lost has a Partner API for shelter software (https://support.lost.petcolove.org/hc/en-us/articles/49905431814163-What-is-the-Petco-Love-Partner-API), which is for partners, not readers. No platform was found to document a public feed of strays.

## Who holds whose strays

Most cities do not hold their own strays. This is the table the registry should be built from: one row per holder, with the places it holds strays for. "Where it posts" says what was seen; most holders post no list at all. Many city pages are undated, so any holder named may be out of date. Where sources disagree, the next section says so.

| Holder | Cities and counties it holds strays for | Where it posts |
| --- | --- | --- |
| Companion Animal Care and Control (Oakdale) | Full service, it picks animals up: Washington County: Afton, Bayport, Baytown Township, Birchwood Village, Dellwood, Denmark Township, Forest Lake, Grey Cloud Island Township, Hugo, Lake Elmo, Lake St. Croix Beach, Lakeland, Landfall, Mahtomedi, Marine on St. Croix, May Township, Newport, Oakdale, Pine Springs, Scandia, St. Mary's Point, West Lakeland Township, Willernie. Anoka County: Andover, Columbus, Linwood, Nowthen, Oak Grove. Chisago County for 2026 (county contract; cities not listed). Impound only, police bring animals in: Ramsey County: Arden Hills, Little Canada, Maplewood, Mounds View, North Oaks, North St. Paul, Roseville, Shoreview, Vadnais Heights, White Bear Township. Washington County: Cottage Grove, Oak Park Heights, Stillwater, Woodbury. Anoka County: Blaine, Coon Rapids, Fridley, Spring Lake Park. Also parts of Wisconsin | Its animals-in-care page (no login), a lost and found folder and lost-pet photo page it names, and its Facebook page. It does not adopt to the public; unclaimed animals go to rescue partners. Roseville dogs go to its centre from 2026-01-01 |
| Pets Under Police Security (PUPS), Maple Grove | Maple Grove, Brooklyn Center, New Hope, Plymouth, Robbinsdale. Brooklyn Park is leaving it and Crystal has left. Champlin is named as a member only by an older source. Membership differs between sources | Petco Love Lost page (link seen, page refused). Its own website and Facebook page were not found. 5 business day hold; police-only intake |
| Access Veterinary Care (a clinic) | Crystal | No list. Its clinic site says nothing about strays. Crystal police link their own Facebook page |
| Bloomington Animal Shelter (police Animal Control Unit) | Bloomington, Richfield, Eden Prairie, Minneapolis-St. Paul airport police. One older Shakopee page also names it | No public list. Found animals in Richfield, Eden Prairie and the airport go to those places' police |
| Hopkins Pet Hospital | Hopkins | No list. The Hopkins pets page names it |
| Monticello Animal Impound (City of Monticello) | 23 cities and townships under contract, names not published on either city page. Confirmed from the clients' own pages: Dayton (stray dogs only) and Otsego. Others are only plausible | No list. The city blog gives intake of 524 animals, 253 of them dogs, in 2022 |
| South Lake Minnetonka Police Department | Provides animal control for Excelsior, Greenwood, Shorewood and Tonka Bay. Orono is linked only by an old records document | No shelter and no list named |
| Minnetonka police | Minnetonka (holder not found; impounds at least 5 days) | The ArcGIS dashboard for impounded, lost and found animals |
| A "Golden Valley Humane Society" | Golden Valley, after a 7 day police hold | No list or link on the city pages. A news report says found animals are posted on city social media |
| 4 Paws Animal Control | Confirmed: Chanhassen (dogs only), Mendota Heights. Disputed: Savage, Shakopee. A 2011 directory also credits Farmington, Prior Lake and Chaska; unverified | No website or Facebook page found. Call-only |
| Spot's Last Stop | Savage and Prior Lake, per its own animal-control page | Reports by phone or email; its page shows no list of held dogs. Adoptable foster dogs at https://spotslaststop.org/available-dogs/ |
| South Saint Paul Animal Hospital | West St. Paul and Inver Grove Heights. South St. Paul city is unconfirmed | West St. Paul says hospital staff post adoptable unclaimed pets on a Facebook account (no link). Its own site says nothing about strays |
| River Bluff Humane Society (Red Wing) | Hastings, Red Wing and Goodhue County, parts of Pierce County in Wisconsin and River Falls, some townships. Lake City is likely nearest but unconfirmed | Its services page describes impound contracts and a 5 day stray hold. No stray list; adoptables only on its site |
| American Boarding Kennels (Burnsville) | Burnsville's licence page lists it under Animal Control | Its site says nothing about animal control; the city page is the only link. No list |
| Minnesota Critter Getter (Henderson) | Elko New Market, New Prague, Jordan, Belle Plaine, Montgomery, Le Sueur and Le Sueur County (dogs only), per the New Prague FAQ. Le Sueur's own FAQ also names it | No list. Its own site failed with an expired certificate |
| Carver-Scott Humane Society (Chaska) | Chanhassen's page says it handles lost and found for Carver and Scott counties. A 211 listing says it takes lost and found reports | Its own site shows an adopt section and no lost-and-found page |
| Animal Ark (Hastings) | Takes stray and unclaimed animals from its immediate area as room allows | Adoptables only on its site and Petfinder |
| Animal Humane Society | Woodbury, Coon Rapids and Golden Valley shelters. Named by Arden Hills and by Oakdale; a search result says it takes Ramsey County sheriff contract-city strays. Lakeville links its lost-and-found resources | A strays page (refused) and a lost and found bulletin board, both found only by link |
| Northwoods Humane Society (Wyoming) | Interim impound for Afton in 2025 | Petfinder only (refused) |
| Anoka Police Animal Containment Center | Anoka and the city of Ramsey | No public list. No page of its own found |
| Anoka County Sheriff dispatch | Contained strays for Ham Lake and St. Francis, by the non-emergency line | No list |
| North Metro Animal Care and Control (Andover) | Northern Anoka County and nearby, per its GiveMN profile. St. Francis says its contract ended 2022-06-01 | Facebook page; its own site gave a DNS error |
| Tri-County Humane Society (St. Cloud) | Stearns, Benton and Sherburne counties. Sartell, Waite Park, Sauk Rapids and the St. Cloud animal control division appear to send strays here, but only through its own pages | Strays labelled on its adoption listings; sends finders to Lost Dogs MN, a Facebook group and Nextdoor. Per-stray intake fee |
| Hawk Creek Animal Shelter (Willmar) | Willmar, Kandiyohi County and Meeker County, funded by lump sum; 5 day hold | Petfinder for adoptables; banners to Petco Love Lost; Facebook page |
| Animal Medical Center (Hutchinson) | Hutchinson city impound, per Heart of Minnesota's page; 7 day hold | No own page or list seen |
| Heart of Minnesota Animal Shelter (Hutchinson) | McLeod County area; says it does not run the city impound | Lost-found resource page, no list; Petfinder for adoptables |
| On-Line Retrievers | Isanti (the city's new contractor, per local radio) | No website found |
| Morrison County Animal Humane Society (Little Falls) | Little Falls and other cities and townships under impound agreements; 5 day period | Adopt-a-Pet and Petfinder, adoptable only |
| HART (Brainerd) | Brainerd, Crow Wing County, Cass and Aitkin, with a state directory saying about 18 municipalities; the municipalities are not named | Advertises strays on its Facebook page as a courtesy |
| Mesabi Humane Society (Virginia) | Mountain Iron, Gilbert, Biwabik and St. Louis County. Virginia ended its contract and handles strays through City Hall | Current lost and found page (image links) and Facebook |
| Precious Paws Humane Society of Chisholm | Chisholm, Keewatin, Nashwauk | Lost and Found Animals and Return to Owner pages exist; their URLs were not seen |
| Duluth Animal Control and Animal Allies | Animal Allies' found-pet guidance assigns Duluth to Duluth Animal Control, Hermantown to its police department, Proctor to its police department, and southern St. Louis County to Animal Allies | Resource pages with links to Missing Pets of the Northland, Lost Dogs of Minnesota, Craigslist Duluth and Petco Love Lost |
| Great River Rescue (Bemidji) | Bemidji city strays go to the City Pound. Bemidji, Northern, Frohn, Grant Valley, Ten Lakes, Port Hope and Turtle River townships and Tenstrike go to a Township Pound at a veterinary clinic (not linked) | Stray Pets category on its site and a Petstablished form |
| Grand Rapids Domestic Animal Control Facility | Grand Rapids; county strays per a 2016 document | Facebook page linked from the city page |
| Hibbing Animal Intake | Hibbing, with an online animal-incident report form | No list |
| Lake County Humane Society | Two Harbors | Not found beyond the city page |
| Lake of the Woods Humane Society | Found animals within Lake of the Woods County limits | Its site and Facebook |
| Marshmallow Animal Shelter (Detroit Lakes) | Detroit Lakes primary impound; Audubon, Callaway, Frazee, Lake Park, Mahnomen and Waubun when called; Becker County outside city limits | Recent Arrivals list of found strays |
| Humane Society of Otter Tail County | Fergus Falls and the rest of Otter Tail County; refuses animals from outside the county | Petango stray list; its Facebook page |
| Lakes Area Humane Society (Alexandria) | Alexandria, Douglas County and neighbouring counties; animals stay in the county where found | Its stray list and Facebook photo sharing |
| Pope County Humane Society (Glenwood) | Glenwood, Starbuck (police pick up, the society holds), Pope County | Shelterluv forms; links PawBoost and Petco Love Lost |
| Pennington County Humane Society (Thief River Falls) | Thief River Falls city pound hands over after up to 5 days; a 211 listing adds Kittson, Marshall and Red Lake | Adoptables on Adopt-a-Pet and Petfinder; no lost-found page |
| Moorhead Animal Pound | Moorhead, through dispatch; 5 day hold, then a rescue | No public list. Older pages name FM Animal Hospital; the current operator is unknown |
| Barnesville police animal control | Barnesville city impound; 5 days | Photos around town and on the Barnesville Animal Control Facebook page |
| Blue Earth Nicollet County Humane Society (Mankato) | Mankato and North Mankato, by contract since 2020; Le Sueur County is also in its listed service area | Petfinder profile (refused); no stray list seen |
| New Ulm police city pound | New Ulm city limits; after about 5 days unclaimed animals may go to the Brown County Humane Society | New Ulm Police Department Facebook page |
| Martin County Humane Society (Fairmont) | Fairmont strays, boarded at the owner's cost | Adopt-a-Pet profile only. A November 2024 report said it was overcrowded and not taking strays |
| Redwood Area Animal Shelter (Duke Memorial) | Redwood County, Olivia and Hector | Shelterluv for adoptables; no stray page |
| Watonwan County Humane Society (St. James) | Has held St. James strays; the city moved to evict it (undated) | Adopt-a-Pet profile only |
| Humane Society of Freeborn County | Albert Lea, by city contract; lost or found pets are reported to police | Shelterluv for adoption forms; its site has no stray page |
| City of Austin animal shelter and Mower County Humane Society | Austin; the humane society's dogs came mostly from the city pound in 2015 | RescueGroups for the humane society's adoptables |
| Canine Central (Waseca) | Waseca law enforcement's impound, per a 2022 article about cats | No own URL; no list |
| Paws and Claws Humane Society (Rochester) | A state directory lists it for Dodge, Freeborn, Goodhue, Mower, Olmsted, Rice, Steele and Wabasha counties; some dogs arrive as strays | Found Dogs page; Petango for adoptables |
| Rochester Animal Control | Rochester; shelter by appointment | Its Facebook page and Adopt-a-Pet; no impound list on the city site |
| Prairie's Edge Humane Society (Northfield) | Rice County; strays and surrenders by appointment | Adopt-a-Pet; its own site gave no readable content |
| Steele County Humane Society | Animals found in Steele County outside Owatonna city limits; foster homes only | Adopt-a-Pet |
| Owatonna Animal Control | Owatonna; holding place not stated | Animal control Facebook page linked from the city page |
| Winona Area Humane Society | Winona County (stray dogs and cats) | Lost and found page with no list |
| La Crescent Animal Rescue | Strays found in La Crescent | Own site; no list |
| Waseca County Animal Humane Society | Waseca County and Le Sueur County; foster-based | Petfinder (refused) |
| Humane Society of Renville and Sibley Counties (Gibbon) | Renville and Sibley counties; helps find owners of lost pets | Adopt-a-Pet |
| Faribault County Humane Society (New Chances) and K9 Rescue of Faribault County | Blue Earth and Faribault County; K9 Rescue names Blue Earth, Fairmont and Winnebago | Adoptables only; the first one's own domain now redirects to an unrelated site |
| Giles Dog Rescue (Pipestone) | Strays and surrenders for south-west Minnesota | Adopt-a-Pet; its own domain failed |
| Cottonwood County Animal Rescue (Windom) | Cottonwood County; foster-based, lists stray dogs for adoption | Petfinder (refused) |
| Dawson police | Dawson and Lac qui Parle County area; holding place not seen | City animal services page |
| Greenhill Humane Society | Named once by a search summary for Cottage Grove after a police hold | No URL seen |
| Otter Lake Animal Care Clinic (Hugo) | Hugo and Stillwater Township, historically; Afton says it stopped impounding on 2025-01-01 | Its own site |
| Dover Kennel (Andover) | Blaine, by a 2018 contract memo; likely replaced | No list |
| Central Minnesota Animal Care and Control (Sauk Rapids) | Formerly St. Cloud, which ended its contract, per a local news report | Unknown |
| Brighton Veterinary Hospital animal control | An old Adopt-a-Pet directory lists it for New Brighton, Hilltop, Roseville, Fridley and Mounds View | Likely dated |

## Platforms seen in Minnesota

Only a few organisations could be tied to a platform with evidence. Most shelter sites show adoptable animals only.

| Platform | Minnesota organisations seen on it | Shows strays or found dogs, or adoptable animals only |
| --- | --- | --- |
| 24PetConnect | Minneapolis Animal Care and Control (strays, plus a found-by-residents list linked from the city). Its path pattern looks like `/<ShelterCode>StrayPets`, inferred from one example. A Dakota County page was not found. | Strays and found dogs |
| Petango/PetPoint | Humane Society of Otter Tail County (stray list on ws.petango.com). Paws and Claws Humane Society uses it for adoptables | Strays at Otter Tail; adoptables at Paws and Claws |
| Shelterluv | Wadena County Humane Society (Stray Animals page), Pope County Humane Society (found and missing report forms), Scruffy Tails, Tri-County Humane Society, Redwood Area Animal Shelter, Humane Society of Freeborn County (inferred from a link) | Strays at Wadena; forms at Pope; adoptables elsewhere. Its API needs a shelter's own key |
| Petco Love Lost | The Pets Under Police Security page; linked from Hawk Creek, Pope County, Animal Allies, Mesabi and the Minneapolis page. It also has a Partner API for shelter software | Strays at the PUPS page (refused when fetched); otherwise a national lost and found map |
| Petfinder | Hawk Creek, Heart of Minnesota, Mesabi, Stevens, Swift County, Pennington County, Blue Earth Nicollet, Cottonwood, Jackson County, K9 Rescue of Faribault County, Paws and Claws, Waseca County, Carver-Scott, Spot's Last Stop, Animal Ark, Northwoods and others. Every member page fetched answered 403 | Adoptable animals, and Tri-County strays by label. Cottonwood says it lists stray dogs for adoption |
| Adopt-a-Pet | A large state directory of mostly rescues, plus Rochester Animal Control, Aitkin City Dog Pound, the Grand Rapids animal control listing (lost and found only, no adoptions), Morrison County, Martin County, Watonwan County, Almost Home, Giles, Hope For Homes and many more | Adoptable only, with two exceptions: Grand Rapids animal control and Aitkin City Dog Pound are lost and found or pound listings with no list seen |
| RescueGroups | Mower County Humane Society's own site; Marshmallow is a guess. A public REST API exists | Adoptable animals at Mower; found strays at Marshmallow if the guess holds |
| Petstablished | Great River Rescue's lost and found form | A form, not a list |
| ArcGIS (Esri) | Minnetonka police dashboard | Impounded, lost and found, if it loads |
| PawBoost | Saint Paul Animal Care and Control posts found animals there; Winona, Pope County and Lakes Area link it. Already in the registry | Found and lost dogs, per-ZIP pages |
| PetHarbor | Minneapolis's page mentions it for emailing finders. No organisation confirmed | Unknown |
| Own site on a site builder | Companion Animal Care and Control (looks like Squarespace), Babinski Foundation (Squarespace), Humane Society of the Lakes (Wix), Range Regional Animal Rescue (Wix), Lakes Area Humane Society (GoDaddy) | Varies; see the candidates table |
| Facebook | HART, New Ulm police, Barnesville animal control, Otter Tail, Lake of the Woods, Mesabi, Golden Valley city social media | Strays and found dogs, but read only through the owner's own browser |

No Minnesota organisation could be tied to ShelterBuddy, Chameleon, Pawlytics, Animal Shelter Manager, Animals First, Shelter Pro or PetBridge. The researchers searched and found nothing.

## Facebook

The Facebook hunts were the least successful part of the research. The search limit ran out after only a few queries on the statewide and metro hunt, and the Greater Minnesota hunt ran no searches at all: every query it tried was refused. The city-by-city hunt for community groups, which was the job, has not been done. What exists is what other researchers tripped over, so the list is lopsided toward places that shelters and cities link.

The statewide pages found are these. Lost Dogs Minnesota (https://www.facebook.com/LDoMN/) is the one large page, about 126K followers per a search summary, run by an all-volunteer outfit based in Saint Paul with a website at https://lostdogsmn.com. The registry's Lost Dogs Minnesota entry has no real URL; this supplies one. Lost Cats Minnesota (https://www.facebook.com/LostCatsMinnesota/) is its cat companion. Two old-style page addresses from an aged Patch guide may be dead. Missing Pets of the Northland (https://www.facebook.com/CloquetLostPets/) covers Duluth, Cloquet and the Iron Range, with over 8,000 followers reported; the URL path suggests it began in Cloquet. Lost K9 (https://www.facebook.com/LostK9team/) is a volunteer outfit based in Cottage Grove. The Retrievers Lost Dog Team (https://www.facebook.com/TheRetrieversLostDogTeam/) is a Saint Paul volunteer team, with a site at https://www.theretrievers.org/. PawBoost runs city pages, seen for Minneapolis (https://www.facebook.com/LostPetsMinneapolisMN/), Duluth (https://www.facebook.com/LostPetsDuluthMN/) and Rochester (https://www.facebook.com/LostPetsRochesterMN/), about 4,380 likes for Rochester. Other regional pages are Lost Pets - SW Minnesota (https://www.facebook.com/LostPetsSwMinnesota/, based in Worthington) and Mille Lacs County Animal Care and Protection (https://www.facebook.com/millelacscountyanimalcontrol/).

Groups named by shelter pages, with a link, are: Lost Dogs and Cats of Minnesota (https://www.facebook.com/groups/1804132063243219, linked by Tri-County), Lost Pets in Winona (https://www.facebook.com/groups/1495292297427117), Lost and Found Pets Minnesota (https://www.facebook.com/groups/1214583558585910/), Bemidji Area Lost/Found Animals (https://www.facebook.com/groups/204050392994912), three Iron Range groups linked by Mesabi (https://www.facebook.com/groups/982358661858092, https://www.facebook.com/groups/513629141999019/ and https://www.facebook.com/groups/160568857638394/), and one linked by Lake of the Woods Humane Society whose name was not seen (https://www.facebook.com/groups/242482485879233/). None was opened, so sizes and whether they are public are unknown.

Groups named with no link, so they are not in the catalogue: Detroit Lakes Buzz, Lost and Found Pets - Detroit Lakes Area, MN Lost Dogs, MN Lost Cats, a Life in Hutchinson group, an SE MN Lost/Found Pets page, a Friends of Animals Lost and Found Pets page for Carlton County, a Cook County MN Pets: Lost, Found, Escaped page, a Barnesville Animal Control page, and a Facebook account run by South Saint Paul Animal Hospital staff.

Many organisation pages are in the catalogue as `facebook-page` rows, each taken from a link on the organisation's own site and not opened: shelters, humane societies, several city and police pages, and the contractors above. Confirmed posters of found dogs are few: New Ulm police, Barnesville animal control, HART (strays advertised "as a courtesy"), the Humane Society of Otter Tail County, Lake of the Woods Humane Society, and a 2020 article for White Bear Lake police. A news report says Golden Valley posts found animals on city social media, and a Patch item says the Dakota County Sheriff's Office posts found-dog notices (platform not stated). Whether a city or police page posts found dogs is unverified for the rest.

Facebook is read only by the owner, signed in, in their own browser (the registry's `capture` access). Facebook's robots file disallows everything. Nothing in this report is a collector candidate on Facebook.

## Where the sources disagree

- **Shakopee.** The older city page says found dogs go to Bloomington Animal Control and are accepted only from law enforcement. A search summary of a newer page says 4 Paws in Savage. The newer page answered 404, so the claim is unconfirmed.
- **Savage.** A city contact page (search summary) says 4 Paws. Spot's Last Stop's own site lists Savage and Prior Lake as its animal-control cities. The holder may have changed. The Savage city pages answered 403.
- **Maplewood and Arden Hills.** Maplewood's page says strays go to the Woodbury Humane Society, and Arden Hills's page says Animal Humane Society Woodbury. Companion Animal Care and Control lists both as impound-only. Either the pages are out of date or both organisations take animals.
- **Ramsey County Sheriff contract cities.** A search result says strays go to Animal Humane Society Woodbury; the CACC pages say CACC. The sheriff's page moved and the new address answered 404.
- **Oakdale** names both CACC and Animal Humane Society.
- **Stillwater Township and Afton.** The township page still names Otter Lake Animal Care Clinic for impounds; Afton says that clinic stopped impounding on 2025-01-01. Afton also names an interim impound at Northwoods Humane Society in 2025, and may be out of date itself.
- **Cottage Grove.** CACC lists it as impound-only; a search summary says Greenhill Humane Society after a police hold.
- **Blaine.** A 2018 contract memo names Dover Kennel; CACC now lists Blaine as impound-only.
- **North Metro Animal Care and Control.** St. Francis says its contract ended 2022-06-01, its GiveMN profile still describes it, its website gave a DNS error, and the St. Francis animal control pages answered 404.
- **Pets Under Police Security.** Brooklyn Park's own page still says lost pets go to PUPS, while a council report says it is leaving. Crystal has left. Which cities are members differs between sources, and Champlin is named only by an older one.
- **Roseville.** Its page says dogs go to the Companion Animal Center from 2026-01-01. Before that date the holder is not stated.
- **Hastings.** The lost-and-found page names River Bluff Humane Society. The police animal control page says loose dogs go to a pound it does not name. Animal Ark also takes strays as room allows.
- **Farmington.** The city page does not say where dogs go. A 2011 directory names 4 Paws, unverified.
- **Belle Plaine.** A search summary says a city pound; the New Prague FAQ lists Minnesota Critter Getter. Both may hold.
- **Hutchinson.** The city page links Heart of Minnesota Animal Shelter without saying it is the impound; the shelter's own page says the city impound is run by Animal Medical Center, not the shelter. One note says a Hutchinson page was opened; another says a Hutchinson page answered 404.
- **Tri-County Humane Society.** One note puts its platform at Shelterluv, another saw a Petfinder id. Some of its pages answered 404 when fetched though they appeared in search; others worked.
- **Carver-Scott Humane Society.** A 211 listing says it accepts lost or found reports; its own site shows none. One note lists it for Carver and Scott counties, and an Adopt-a-Pet note adds Dakota and Hennepin.
- **Hawk Creek Animal Shelter.** The central notes put it in Willmar, Kandiyohi and Meeker counties. The south-west notes found it in searches for Renville and Lac qui Parle and could not confirm its area. Its own site does not name the cities it holds.
- **Minneapolis lists.** The registry's note says the stray list page showed one tab and no residents' found dogs on 2026-11-26. A community-boards researcher found a link to a found-by-residents list on the city's page. One note says the city's page mentions PetHarbor and another says 24PetConnect.
- **Minnetonka dashboard.** A news report says it lists impounded, lost and found animals; the page opened as a bare "Portfolio". A national-databases note says an earlier tool ran through Foundrop.
- **Moorhead.** Older pages name FM Animal Hospital for the pound. The city page says only "Moorhead Animal Pound".
- **Martin County Humane Society.** Holds Fairmont strays under the city page, but a November 2024 report said it was not taking strays. No newer status.
- **Watonwan County Humane Society.** Holds St. James strays, but the city moved to evict it (undated).
- **Faribault County Humane Society.** Sources conflict on whether it is active, and its own domain now redirects to an unrelated site.
- **Isanti County Humane Society.** One directory shows it closed.
- **Virginia.** Mesabi Humane Society says the city ended its contract; the city's own page was not found.
- **St. Cloud.** It ended its contract with Central Minnesota Animal Care and Control, per a local news report; whether that outfit still operates is unknown.
- **Pennington and Scruffy Tails.** A 211 listing gives Pennington County Humane Society Kittson, Marshall and Red Lake counties, and Scruffy Tails lists Polk and Marshall. They overlap on Marshall County.
- **Redwood Falls.** Two names, Redwood Area Animal Shelter and Duke Memorial Animal Shelter, appear to be one shelter; its own site links the Adopt-a-Pet profile, which supports that.
- **Mower County.** Both a city shelter and a humane society exist in Austin.
- **Waseca.** The humane society is foster-based; law enforcement uses Canine Central.

## Sites that refused

A refusal is the site's final answer. None of these was retried, and no other route to the same content was used.

| Site | What it answered |
| --- | --- |
| petcolove.org (Petco Love Lost, PUPS list page) | 403 |
| animalhumanesociety.org (strays page, the older lost-pet page and the resources page) | 403 |
| petfinder.com (every member page fetched, and the developers page) | 403 |
| petlink.net (lookup and lost pet gallery pages) | 403 |
| aaha.org (microchip lookup and participants pages) | 403 |
| lostmydoggie.com | 403 |
| lostmypet.com | 403 |
| search.211unitedway.org (Eagan and Rosemount listings) | 403 |
| edenprairiemn.gov (animal control and lost-and-found pages) | 403 |
| plymouthmn.gov (animal control) | 403 |
| minnetonkamn.gov (animal control) | 403 |
| brooklyncentermn.gov (animal impound) | 403 |
| chanhassenmn.gov (lost and found page; the page was read in an earlier fetch of one researcher and refused in another) | 403 |
| cityofsavage.com and savagemn.gov (contact and pets pages) | 403 |
| codelibrary.amlegal.com (the Jordan code page) and cityofnya.com (code PDF) | 403 |
| mn.gov (a state directory page) | Bot check |
| bah.state.mn.us (Minnesota Board of Animal Health) | Bot check (Radware, "Verifying your browser") |
| reddit.com | Refused the fetch in the first pass; not fetched again. Its robots file disallows everything per the earlier research |
| startribune.com and kstp.com (two news stories) | 429 |
| facebook.com | Never opened. Its robots file disallows everything |

Some other pages answered 404 or gave a DNS, certificate or HTTP 521 error. Those are broken or missing pages, not refusals, and the next pass may look for the new addresses: for example the Bloomington shelter first URL, the Richfield and Robbinsdale pages, the Shakopee newer pets page, the Prior Lake page, the St. Francis pages, the Moorhead police animal unit page, the Thief River Falls pound page, northmetroacc.org, borderlandhumanesociety.com, gilesdogrescue.com, steelecountyhumanesociety.org, the Minnesota Critter Getter site, and the City of Kandiyohi and Dawson pages.

## What is still missing

### Whole topics not researched

- **Facebook, Greater Minnesota.** No searching was done. Every regional group, sheriff page, police page and shelter page is unresolved.
- **Facebook, the metro, city by city.** Not run. County and city groups for Hennepin, Ramsey, Anoka, Dakota, Washington, Scott and Carver; Minneapolis areas (North, Northeast, South, Southwest, Uptown, Longfellow, Nokomis); Saint Paul areas (East Side, West Side, Highland Park, Como, Midway); every suburb. Also statewide sightings, trapping and recovery, and breed-specific groups; metro animal-control and impound Facebook pages; city general community groups. A search restricted to the facebook.com domain was the only form that returned Facebook pages.
- **Statewide directories.** Whether the Board of Animal Health publishes a licensed kennel or pound list is unknown, because it answered a bot check. Not searched: advocacy county-by-county impound lists, the state animal control association's agency list, humane federation or partnership members, University of Minnesota shelter medicine or extension resources, "find your local animal control" tools. The state animal-disaster resource pages at mn.gov/adresources list county humane societies and are a possible directory.
- **State law.** Minn. Stat. 35.71 has every subdivision repealed, and 346.37 and 346.38 do not cover pounds. The statute that now sets the stray hold period, if any, was not found. One shelter's page says state law requires a 5 business day hold; the research did not confirm it.
- **State Patrol, the DNR, state parks and MnDOT** found-dog channels.
- **The eleven tribal nations.** Not researched except two pages seen by chance: Leech Lake's tribal police animal control (http://www.llojibwe.org/lltpd/animalcontrol.html, linked by Great River Rescue) and the Shakopee Mdewakanton Sioux Community's Public Works page. Unresolved: Bois Forte, Fond du Lac, Grand Portage, Leech Lake (page not opened), Mille Lacs, White Earth (named on a Detroit Lakes page with no link), Red Lake, Lower Sioux, Prairie Island, Shakopee Mdewakanton (no stray page), Upper Sioux.
- **Border areas.** Almost nothing. Unresolved: Fargo, West Fargo and Cass County in North Dakota; Grand Forks; Wahpeton; Superior and Douglas County in Wisconsin; Hudson, River Falls, Prescott and St. Croix, Pierce and Polk counties; La Crosse and La Crosse County; Buffalo, Pepin and Burnett counties; Sioux Falls and Brookings; the northern Iowa line (Mason City, Decorah, Spirit Lake, Estherville, Northwood); Fort Frances, Thunder Bay and Rainy River; each neighbouring state's statewide lost-dog volunteer network. Homeward Animal Shelter, Fargo's lost pets page, Circle of Friends in Grand Forks and the Richland-Wilkin society were seen only by chance.
- **Reddit.** No subreddit confirmed.
- **Local media, region by region.** Radio, TV, weeklies and big dailies. Local radio and papers that run lost-pet notices were not found. KOOL 101.7 says it does not run them. WTIP has a Missing Pets in the Northland feature (https://wtip.org/features/missing-pets-in-the-northland/). Named with no link: KFGO, KDUZ (Hutchinson, free on-air lost-pet notice). Not found: KROC, KFIL, Albert Lea Tribune, Austin Daily Herald, Winona Daily News, Post Bulletin, KNUJ, KLGR, KYMN, KJJK.
- **Neighbourhood sites and university boards.** Not covered. Nextdoor and the Ring app are app-only.
- **Hunting-dog and breed networks.** No sighthound, husky, hunting-dog or working-dog lost-dog network identified. One hunting forum thread was seen.
- **Apps and registries not researched:** Mission Reunite, Citizen, Shadow, Pawscout, Fi and other GPS collar lost modes, Facebook's own lost-pet tools, Free Pet Chip Registry, BeKind, and Petfinder or Adopt-a-Pet lost tools. FindToto, MissingPets, PawMaw, Save This Life, Peeva and Pet Data were named with no official URL.
- **Platform documentation** for Petango, ShelterBuddy, Chameleon, Pawlytics, Petstablished, Animal Shelter Manager, Animals First, Shelter Pro and PetBridge. Whether Minnesota shelters use a platform's lost-and-found module is unknown. Which software each county and city program runs was mostly not found.
- **Craigslist sub-area section pages** (hnp, ram, ank, wsh, dak, csw) were not opened, and Craigslist's terms and robots were not checked.
- **The Adopt-a-Pet Minnesota directory** was read only in part: the last two pages were truncated. Petfinder's Minnesota directory page was not found. Which of the Adopt-a-Pet organisations are municipal or take strays is not known.
- **Volunteer search help:** the own sites of a mantrailing group and a volunteer lost-dog team known only from fundraiser pages; The Retrievers' site contents. Two one-person thermal-drone search services turned up in news stories; they are individuals, not organisations, so they are not listed.
- **Several own sites of holders that were refused, blank or not opened:** PUPS, 4 Paws, Minnesota Critter Getter, North Metro Animal Care and Control, the Brown County Humane Society beyond its title, and Star of the North Humane Society.

### Metro, region by region

- **Hennepin County.** Edina, Maple Grove (no city page; PUPS owner), Rogers, Champlin (a PUPS member per an older source only), Osseo, St. Anthony, Independence, Greenfield, Hanover, Rockford, Loretto, Maple Plain, Long Lake, Medicine Lake, Deephaven, Woodland, Spring Park, Mound, Minnetrista, Orono (an old record only), Excelsior, Greenwood, Tonka Bay (holder unknown), St. Bonifacius, Wayzata (licensing only). Named without a link: PUPS's own website and Facebook page, Heading Home K9 and Ruff Start Rescue (PUPS partners), The Retrievers (named on New Hope's page), Monticello Animal Shelter's own site, the Lost Dogs of Minnesota group. No stray-dog intake page for the Hennepin sheriff, Three Rivers Park District, the Park Board, the airport or University of Minnesota police.
- **Ramsey County.** Falcon Heights, Lauderdale, Gem Lake, Circle Pines, Lexington, Centerville, Hilltop, Lino Lakes. Columbia Heights (a resident news post says police took found dogs). The Mounds View current page was not read.
- **Anoka County.** East Bethel, Bethel, Grant. Anoka itself has no page of its own.
- **Washington County.** St. Paul Park, Lakeland Shores (a sheriff contract city). Cottage Grove police found-dog page: none seen. No Blaine or Woodbury page for lost pets found.
- **Dakota County.** Apple Valley, South St. Paul (city), Mendota, Lilydale, Sunfish Lake, Hampton, Vermillion, Randolph; Eagan and Rosemount have no impound facility or list; the sheriff's stray handling; the Mendota Heights city page; Burnsville's holder role is unconfirmed; the Lakeville-specific pound.
- **Scott and Carver counties.** Waconia, Victoria, Watertown, Mayer, Carver (city), Cologne, Hamburg, New Germany, Norwood Young America (facility not named); the Scott County sheriff and Carver County sheriff's own pages. The Lakeville K-9 Rescue and Last Hope Inc were named with no link.

### Central and the ring counties

- **Wright, Sherburne, Benton, Isanti, Mille Lacs, Meeker, McLeod, Kandiyohi, Sibley.** No sheriff or county animal page found for any of them. Sibley: nothing found at all.
- **Cities with no answer:** Elk River, Big Lake, Becker, Zimmerman, Princeton, Buffalo, Albertville, St. Michael, Rockford, Delano, Annandale, Cokato, Howard Lake, Maple Lake, Cambridge, Braham, Chisago City, Lindstrom, Wyoming, Rush City, Pierz, Long Prairie, Staples, Litchfield, Dassel, Glencoe, Winsted, Lester Prairie, New London, Spicer, Gaylord, Arlington, Winthrop, Cold Spring, Sauk Centre, Melrose, Albany, Sartell and Waite Park (from their own sites), Little Falls beyond its shelter agreement. Cokato, Glencoe, Lester Prairie, Winsted, Norwood Young America, and Meeker and Kandiyohi County impounds are named on Heart of Minnesota's page with no link. North Branch, Glencoe and Lester Prairie got only low-quality hints that were not recorded.
- **Todd County** has a sheriff home page only; where strays are held is unknown (a 211 listing names an unnamed shelter serving Crow Wing, Mille Lacs, Morrison and Todd counties). No Facebook page was seen for most of these places.

### North-east and north-central

- **Pine County and its cities** (Pine City, Hinckley, Sandstone). Cook County and Grand Marais (a WTIP log mentions a pound at Animal Advocates and Arrowhead Animal Rescue, no URL). Hermantown Police and Proctor Police (named by Animal Allies, no page). Lake County Humane Society in Two Harbors (the county page had no entry). Cloquet, Moose Lake, Eveleth, Walker and Cass County, Bagley and Clearwater County, Baudette police, Mora city, Kanabec sheriff, Itasca sheriff, Baxter, Brainerd, Crosslake police. The Township Pound at a Bemidji veterinary clinic (named, not linked). The Carlton County Animal Rescue own site (Petfinder refused). The Borderland Humane Society own site (DNS failure). Star of the North's own site. HART's list of municipalities. Duluth's own list of holders beyond the Animal Control page. The Itasca County shelter (planned in 2025; 2026 status unchecked).

### North-west and west-central

- **Facebook groups named with no link** (see the Facebook section), Detroit Lakes Animal Control and White Earth Animal Control, the holder of Moorhead's pound, Crookston's contract pound, the East Grand Forks holding facility (its city host did not resolve), and Humane Society of Swift County's own page.
- **Counties and cities with no holder found:** Kittson, Roseau (only a county ordinance and an animal control officer), Red Lake, Norman, Traverse, Marshall County sheriff; Dilworth, Hawley, Pelican Rapids, Perham, Dalton, Warren, Hallock, Roseau, Warroad, Red Lake Falls, Ada, Breckenridge, Wheaton, Ortonville, Appleton, Elbow Lake city, Benson city. No sheriff Facebook page and no radio or newspaper lost-pet page was verified in the region.

### South-central and south-west

- **Not resolved at all:** Marshall and Lyon County, Tracy, Lincoln County (Ivanhoe, Tyler, Lake Benton), Murray County (Slayton, Fulda), Nobles County beyond Worthington's police unit (Adrian), Rock County (Luverne), Chippewa County (Montevideo), Yellow Medicine (Granite Falls, Canby, Tyler), Lac qui Parle (Madison), Renville (Olivia, Renville), Brown (Sleepy Eye), Nicollet (St. Peter), Blue Earth County cities (Lake Crystal, Eagle Lake, Madelia, Blue Earth, Wells), Pipestone city and sheriff, Watonwan beyond St. James (Madelia), Jackson County. Jordan, Springfield and Norwood Young America name a city pound with no facility. The Jackson County Sheriff page may belong to a different Jackson County. No Facebook page was found for Blue Earth Nicollet, Martin County, Brown County, Watonwan, Cottonwood or Giles. Two search hits from other states (a Missouri station and a Murray County result) were dropped.

### South-east

- **Counties with no stray program found:** Fillmore, Wabasha, Houston beyond La Crescent, Dodge beyond Kasson's statement (Kasson has no impound contract; finders often hold dogs).
- **Cities with no answer:** Byron, Stewartville, Goodview, St. Charles, Lewiston, Wabasha, Plainview, Zumbrota, Pine Island, Kenyon, Faribault (no city page; the Rice County Sheriff was named in one news story), Lonsdale, Blooming Prairie, Dodge Center, Preston, Chatfield, Rushford, Caledonia, Janesville, Le Center, Montgomery, Red Wing city, Lake City city. Hokah's animal control page content was read only in part.
- **Rochester.** No impounded-dog list on the city site; whether its Facebook page posts found dogs is unverified.
- **Named with no useful URL:** Small Dog Rescue of Minnesota, Clawz and Pawz (Faribault), an SE MN Lost/Found Pets page, the Waseca County Animal Humane Society's own site, Canine Central's own URL. Sheriff Facebook pages for Olmsted, Winona, Wabasha, Goodhue, Rice, Steele, Mower, Freeborn, Fillmore, Houston and Waseca.

## Counts

520 places in the catalogue.

### By section

| Section | Places |
| --- | --- |
| Hennepin County | 40 |
| Anoka, Ramsey and Washington counties | 69 |
| Dakota, Scott and Carver counties | 50 |
| North-east and north-central Minnesota | 74 |
| North-west and west-central Minnesota | 41 |
| Central Minnesota | 48 |
| South-east Minnesota | 52 |
| South-central and south-west Minnesota | 31 |
| Facebook: statewide and the metro | 10 |
| National databases, apps and microchip registries | 29 |
| Classifieds, community boards, media and search teams | 53 |
| Statewide directories, tribal nations and border areas | 1 |
| Shelter software platforms and the organisations on them | 22 |

### By type

| Type | Places |
| --- | --- |
| `city-program` | 143 |
| `shelter` | 86 |
| `facebook-page` | 67 |
| `classifieds` | 39 |
| `police-sheriff` | 35 |
| `national-db` | 28 |
| `impound-contractor` | 27 |
| `rescue` | 21 |
| `directory` | 16 |
| `media` | 16 |
| `facebook-group` | 10 |
| `microchip-registry` | 8 |
| `county-program` | 7 |
| `platform` | 5 |
| `volunteer-team` | 4 |
| `app` | 3 |
| `tribal` | 2 |
| `other` | 2 |
| `forum` | 1 |

### By confidence

| Confidence | Places |
| --- | --- |
| `search` | 241 |
| `seen` | 241 |
| `unsure` | 38 |

## The catalogue

### Hennepin County

40 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Minnetonka lost and found pets dashboard | app | Minnetonka | https://mtka.maps.arcgis.com/apps/instant/portfolio/index.html?appid=a0bc030f046b4d649435318bafea91e9 | ArcGIS (Esri) | no | shelter-stray, found, lost | seen | Page opened; showed only the word Portfolio (needs scripts). CBS says it lists impounded and lost/found animals |
| Bloomington animal control | city-program | Bloomington | https://www.bloomingtonmn.gov/node/5898 | none | no | shelter-stray | seen | Already in registry as city home page. Runs shelter itself |
| Brooklyn Park animal control | city-program | Brooklyn Park | https://www.brooklynpark.org/animal-control-2/ | none | no | shelter-stray | seen | Already in registry as home page. Says lost pets go to PUPS (council planned to leave). No list |
| Corcoran animal information | city-program | Corcoran | https://corcoranmn.hosted.civiclive.com/public_services/police/animal_information | none | no | shelter-stray | seen | Dog rules only; no stray holder or list |
| Dayton police animal information | city-program | Dayton | https://www.daytonmn.gov/departments/police/animal_information.php | none | no | shelter-stray | seen | Contracts Monticello Animal Shelter (outside the county) for stray dogs; no list |
| Eden Prairie police animal control | city-program | Eden Prairie | https://www.edenprairiemn.gov/city-government/departments/police-department/regulations-and-enforcement/animal-control | none | unknown | shelter-stray, found | search | Moves unclaimed to Bloomington shelter; keeps a lost file 10 days. refused: 403. Lost and found page also refused: 403 |
| Golden Valley missing and stray pets | city-program | Golden Valley | https://goldenvalleymn.gov/583/Missing-Pets | none | no | shelter-stray, found | seen | Report to police; unclaimed after 7 days go to a humane society; no list on page |
| Golden Valley missing and stray pets (second page) | city-program | Golden Valley | https://goldenvalleymn.gov/284/Missing-Stray-Pets | none | no | shelter-stray | seen | Same content; links city Facebook |
| Hopkins pets page | city-program | Hopkins | https://hopkinsmn.com/413/Pets | none | no | shelter-stray | seen | Animals picked up by the city are held at Hopkins Pet Hospital; no list |
| Maple Grove police | city-program | Maple Grove | https://petcolove.org/lost/shelters/pets-under-police-security/2122/pets/ | Petco Love Lost | no | shelter-stray | unsure | Holder's page. Already in registry as city home page. Maple Grove owns PUPS; no Maple Grove page found |
| Medina police animal control | city-program | Medina | https://www.medinamn.gov/Departments/Police-Department/Animal-Control | none | no | shelter-stray | seen | Dog rules only; no stray holder or list |
| Minnetonka police animal control | city-program | Minnetonka | https://www.minnetonkamn.gov/government/departments/police-department/services/animal-control | none | unknown | shelter-stray | search | Impounds min 5 days; holder not found. refused: 403 |
| New Hope pets page | city-program | New Hope | https://www.newhopemn.gov/pets | Petco Love Lost | no | shelter-stray, lost | seen | Unidentified strays to PUPS; Crystal to Access Veterinary Care; links PUPS list on Petco Love Lost. Names Lost Dogs of Minnesota group, Nextdoor, PawBoost, PetFBI |
| Orono city records | city-program | Orono | https://publicinfo.ci.orono.mn.us/WebLink/0/doc/174896/Page116.aspx | none | unknown | shelter-stray | unsure | Old document mentions an agreement with South Lake Public Safety; may be out of date |
| Plymouth police animal control | city-program | Plymouth | https://www.plymouthmn.gov/departments/public-safety/police-/regulations-enforcement/animal-control?locale=en | none | unknown | shelter-stray | search | Already in registry as home page. CSOs do animal control; PUPS member. refused: 403 |
| Richfield police animal control | city-program | Richfield | https://www.richfieldmn.gov/departments/public_safety/support_services/animal_control/ | none | unknown | shelter-stray | search | Contracts with Bloomington shelter. fetch 404 |
| Shorewood animal regulations | city-program | Shorewood | https://shorewoodmn.gov/242/Animal-Regulations | none | no | shelter-stray | seen | Animal control by South Lake PD; holder not named |
| Wayzata dog license page | city-program | Wayzata | https://www.wayzata.org/DogLicense | none | no | shelter-stray | seen | Licensing only; no stray holder named |
| No Kill Network Brooklyn Park lost and found | directory | Brooklyn Park | https://www.nokillnetwork.org/lostandfound/minnesota/brooklyn-park/ | own site | no | lost, found | search | Tripped over; third-party list |
| PetKey Medina lost and found | directory | Medina | https://petkey.org/lost-and-found/medina_mn | own site | no | lost, found | search | Tripped over; third-party list |
| Access Veterinary Care Facebook page | facebook-page | Crystal | https://www.facebook.com/MyAccessVetCare | Facebook | unknown | shelter-stray | search | linked from the organisation's own site, not opened |
| Bloomington city Facebook page | facebook-page | Bloomington | https://www.facebook.com/blm.mn | Facebook | unknown | found | search | linked from the organisation's own site, not opened; general city page |
| Brooklyn Park city Facebook page | facebook-page | Brooklyn Park | https://www.facebook.com/brooklynparkmn/ | Facebook | unknown | shelter-stray | search | linked from the organisation's own site, not opened |
| Corcoran city Facebook page | facebook-page | Corcoran | https://www.facebook.com/CorcoranMN/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Crystal police Facebook page | facebook-page | Crystal | https://www.facebook.com/crystalmnpolice/ | Facebook | unknown | lost, found | search | linked from the organisation's own site, not opened |
| Golden Valley city social media (Facebook link) | facebook-page | Golden Valley | https://goldenvalleymn.gov/facebook | Facebook | unknown | found | search | linked from the organisation's own site, not opened; CCX says found animals are posted on city social media |
| New Hope city Facebook page | facebook-page | New Hope | https://facebook.com/newhopeminnesota | Facebook | unknown | lost, found | search | linked from the organisation's own site, not opened |
| Shorewood city Facebook page | facebook-page | Shorewood | http://www.facebook.com/cityofshorewood | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Access Veterinary Care | impound-contractor | Crystal | https://myaccessvetcare.com/ | own site | no | shelter-stray | seen | Clinic site; no strays or list mentioned. Crystal's holder |
| Bloomington Animal Shelter (police Animal Control Unit) | impound-contractor | Bloomington, Richfield, Eden Prairie, airport | https://www.bloomingtonmn.gov/node/5898 | none | no | shelter-stray | seen | Contract shelter. Says found animals in Richfield, Eden Prairie, airport go to those police. No public list |
| Hopkins Pet Hospital | impound-contractor | Hopkins | https://hopkinsmn.com/413/Pets | none | no | shelter-stray | seen | Holder's page; clinic's own site not found |
| Pets Under Police Security (PUPS) on Petco Love Lost | impound-contractor | Maple Grove, Brooklyn Center, New Hope, Plymouth, Robbinsdale; Brooklyn Park leaving; Crystal left | https://petcolove.org/lost/shelters/pets-under-police-security/2122/pets/ | Petco Love Lost | no | shelter-stray | search | Link seen on New Hope's page; list page refused: 403 so contents unknown. PUPS site itself not found. Joint police pound, 5 business days |
| PawBoost Edina found dogs | national-db | Edina | https://www.pawboost.com/lost-found-pets/edina-mn-55439/all-found-stray-dogs/page-5 | PawBoost | no | found, lost | search | Already in registry as PawBoost; no official Edina page found |
| Brooklyn Center police animal impound | police-sheriff | Brooklyn Center | https://brooklyncentermn.gov/government/departments/public-safety/police/animal-impound | none | unknown | shelter-stray | unsure | Lists PUPS member cities. refused: 403 |
| Crystal police animal control | police-sheriff | Crystal | https://police.crystalmn.gov/how_do_i_/contact/animal_control | none | no | shelter-stray | seen | Left PUPS; strays cared for by Access Veterinary Care; no list |
| Hennepin County Sheriff's Office | police-sheriff | Hennepin County | https://www.hennepinsheriff.org/about/bureaus | none | unknown | shelter-stray | unsure | No stray intake found |
| Robbinsdale police | police-sheriff | Robbinsdale | https://robbinsdalemn.com/services/police-department/frequently-asked-questions | none | unknown | shelter-stray | search | Strays to PUPS, 5 days, then approved rescue; fetch returned 404 |
| South Lake Minnetonka Police Department | police-sheriff | Excelsior, Greenwood, Shorewood, Tonka Bay | https://www.southlakepd.com/?p=105 | none | no | shelter-stray | seen | Animal control; no shelter or list named |
| St. Louis Park police animal control | police-sheriff | St. Louis Park | https://www.stlouisparkmn.gov/government/departments-divisions/police-department/animal-control | none | no | shelter-stray | seen | No holder or list named |
| Three Rivers Park District public safety | police-sheriff | Hennepin County parks | https://www.threeriversparks.org/node/64 | none | unknown | sighting | unsure | No stray-dog intake or list found |

### Anoka, Ramsey and Washington counties

69 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Afton Animal Control | city-program | Afton | https://aftonmn.gov/animal | none | no | shelter-stray | seen | CACC contract; interim Northwoods impound in 2025; may be outdated |
| Andover animal control | city-program | Andover | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Arden Hills Lost and Stray Pets | city-program | Arden Hills | https://cityofardenhills.org/902/Lost-Stray-Pets | own site | no | shelter-stray | seen | Ramsey Sheriff animal control; says AHS Woodbury and links AHS strays search; CACC lists it impound-only: conflict |
| Bayport animal control | city-program | Bayport | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Birchwood Village animal control | city-program | Birchwood Village | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Blaine animal control | city-program | Blaine | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only. Registry has Blaine home page only |
| Columbus animal control | city-program | Columbus | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Coon Rapids animal control | city-program | Coon Rapids | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Cottage Grove animal control | city-program | Cottage Grove | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only; search text said Greenhill Humane Society after a police hold |
| Dellwood animal control | city-program | Dellwood | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Forest Lake animal control | city-program | Forest Lake | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Fridley Animals | city-program | Fridley | https://www.fridleymn.gov/Public-Safety/Animals | none | no | shelter-stray | seen | CSOs; strays to Companion Animal Care Oakdale; no list; links city Facebook only |
| Ham Lake animal control | city-program | Ham Lake | https://hamlakemn.gov/node/46 | none | no | shelter-stray | seen | County Sheriff handles contained strays; facility not named; no list |
| Hugo animal control | city-program | Hugo | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Lake Elmo animal control contract | city-program | Lake Elmo | https://miweblink.metro-inet.us/LakeElmoPublic/0/edoc/471614/05%20-%20Animal%20Control%20Contract%20Update.pdf | none | no | shelter-stray | search | CACC impound agreement per council packet (empty on fetch); holder's page lists Lake Elmo full service |
| Lakeland animal control | city-program | Lakeland | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Landfall animal control | city-program | Landfall | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Linwood Township animal control | city-program | Linwood Township | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Little Canada animal control | city-program | Little Canada | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Mahtomedi animal control | city-program | Mahtomedi | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Maplewood Animal Control | city-program | Maplewood | https://maplewoodmn.gov/461/Animal-Control | none | no | shelter-stray | seen | Police CSOs; page says strays go to Woodbury Humane Society, CACC lists Maplewood as impound-only: conflict, page may be out of date |
| Marine on St. Croix animal control | city-program | Marine on St. Croix | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Mounds View animal impound | city-program | Mounds View | https://moundsviewmn.org/i_want_to/learn_about/dog_license_information.php | none | no | shelter-stray | search | Old text names Otter Lake clinic (stopped 2025); redirects to moundsviewmn.gov (rate-limited, unread); CACC lists impound-only |
| Newport animal control | city-program | Newport | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| North Oaks Animal Control | city-program | North Oaks, Vadnais Heights, White Bear Township | https://www.northoaksmn.gov/animal-control/links/animal-control-website | none | no | shelter-stray | search | Page 404 on fetch. Sheriff animal control officer; CACC lists North Oaks, Vadnais Heights, White Bear Township impound-only |
| North St. Paul animal control | city-program | North St. Paul | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Nowthen animal control | city-program | Nowthen | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Oak Park Heights animal control | city-program | Oak Park Heights | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Oakdale Animal Control | city-program | Oakdale | https://oakdalemn.gov/903/Animal-Control | none | no | shelter-stray | seen | Police; CACC and AHS both named |
| Ramsey (city) Animal Control | city-program | Ramsey | https://www.cityoframseymn.gov/home-property-community/animal-services/animal-control/ | none | no | shelter-stray | search | Dogs to Anoka police containment centre; no list |
| Roseville Animal Control | city-program | Roseville | https://www.cityofroseville.com/3219/Animal-Control | none | no | shelter-stray | seen | CSOs and police; dogs to Companion Animal Center from 2026-01-01; no list on page |
| Saint Paul Animal Care and Control lost and found pets | city-program | Saint Paul | https://www.stpaul.gov/departments/safety-inspections/animal-control-information/lost-and-found-pets | none | no | shelter-stray, found | seen | Registry has home page only; this is the better page. No own list; found animals posted on PawBoost; links AHS lost-and-found. Facility move planned Q1 2026 |
| Saint Paul animal shelter services | city-program | Saint Paul | https://www.stpaul.gov/departments/safety-inspections/animal-control/animal-shelter-services | none | no | shelter-stray | search | Intake and fees; no public list |
| Scandia animal control | city-program | Scandia | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Shoreview Animals | city-program | Shoreview | https://www.shoreviewmn.gov/Services/Animals | own site | no | shelter-stray | seen | Ramsey Sheriff animal control; strays to CACC (5 business days); links CACC animals-in-care |
| Spring Lake Park animal control | city-program | Spring Lake Park | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| St. Francis Animal Control | city-program | St. Francis | https://www.stfrancismn.gov/police/page/animal-control | none | no | shelter-stray | search | Page 404 in pass 2; search text: contained strays via county non-emergency, North Metro ended 2022-06-01 |
| Stillwater (city) animal control | city-program | Stillwater | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Stillwater Township Animal Control | city-program | Stillwater Township | https://stillwatertownshipmn.gov/animal-control | none | no | shelter-stray | seen | Township CSO; page still names Otter Lake clinic, which stopped impound 2025: out of date |
| Vadnais Heights animal control | city-program | Vadnais Heights | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| White Bear Township animal control | city-program | White Bear Township | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only |
| Willernie animal control | city-program | Willernie | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC full service |
| Woodbury animal control | city-program | Woodbury | https://companionanimalcontrol.com/service-areas | none | no | shelter-stray | seen | holder's page: CACC impound-only. Registry has Woodbury home page only; no Woodbury page found |
| PawBoost found dogs Fridley | classifieds | Fridley and nearby | https://www.pawboost.com/lost-found-pets/fridley-mn-55432/all-found-stray-dogs/page-5 | PawBoost | no | found | search | PawBoost already in registry; per-ZIP found-dog pages; Saint Paul posts there; pass 2 fetch rate-limited |
| Companion Animal Center Facebook page | facebook-page | Oakdale | https://www.facebook.com/profile.php?id=61562152240168 | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Companion Animal Control Facebook page | facebook-page | CACC service area | https://www.facebook.com/CompanionAnimalControl | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Maplewood police Facebook page | facebook-page | Maplewood | https://www.facebook.com/MaplewoodMNPS | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| North Metro Animal Care and Control Facebook page | facebook-page | Northern Anoka County | https://www.facebook.com/Andover.AnimalControl/ | Facebook | unknown | found | search | linked from GiveMN profile, not opened |
| Saint Paul city Facebook page | facebook-page | Saint Paul | https://www.facebook.com/cityofsaintpaul/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened; general city page, not shown to post found dogs |
| Anoka Police Animal Containment Center (via Ramsey page) | impound-contractor | Anoka, Ramsey city | https://www.cityoframseymn.gov/emergency-services-safety/police-services/animal-services/animal-control/ | none | no | shelter-stray | search | Page 404 on fetch; no public list; no own page found |
| Brighton Veterinary Hospital animal control | impound-contractor | New Brighton, Hilltop, Roseville, Fridley, Mounds View (old) | https://www.adoptapet.com/shelter/82889 | Adopt-a-Pet | no | shelter-stray | search | Old directory listing; likely dated; New Brighton not named by CACC |
| Companion Animal Care and Control animals in care | impound-contractor | Over 70 municipalities in MN and WI | https://companionanimalcontrol.com/animals-in-care | own site | no | shelter-stray, found | seen | No login; no embed or iframe, listing appears part of the page (Squarespace-looking site); not confirmed as a third-party platform. Holds strays for the cities on its service-areas page |
| Companion Animal Care and Control lost and found | impound-contractor | CACC service area | https://companionanimalcontrol.com/service-areas | own site | no | shelter-stray, found, lost | seen | Areas We Serve page. Site also has /lost-animal, /lost-pets (photos of lost pets), /foundanimal, /report-lost-pet; those relative links were not opened |
| Dover Kennel Animal Control and Impound Services | impound-contractor | Blaine (2018 contract) | https://mccmeetingspublic.blob.core.usgovcloudapi.net/springlkmn-meet-c2bb42ec097244759793fa746a941d3d/ITEM-Attachment-001-ba06436ea3b44cde9cfdb2dd9b1818a6.pdf | none | no | shelter-stray | unsure | Andover; 2021 Blaine memo; likely superseded |
| North Metro Animal Care and Control | impound-contractor | Northern Anoka County and nearby | https://www.givemn.org/organization/North-Metro-Acc | none | unknown | shelter-stray | seen | Nonprofit in Andover; website northmetroacc.org had a DNS error in pass 2; St. Francis says its contract ended 2022-06-01; no list |
| Otter Lake Animal Care Clinic | impound-contractor | Hugo, Stillwater Township (historical) | https://www.otterlakeanimalcare.com/ | own site | no | shelter-stray | search | Linked from Stillwater Township page; Afton says it stopped impounding 2025-01-01 |
| Pet911 Coon Rapids found | national-db | Coon Rapids area | https://pet911.org/coon-rapids/found | unknown | unknown | found | search | City-level found list; pass 2 fetch rate-limited |
| Anoka County Sheriff jurisdictions | police-sheriff | Andover, Bethel, Columbus, East Bethel, Ham Lake, Linwood Township, Nowthen, Oak Grove | https://www.anokacountymn.gov/3716/Jurisdictions-and-Municipalities | none | no | shelter-stray | seen | Law enforcement coverage only; no animal info. Contained strays by non-emergency dispatch per Ham Lake and St. Francis. Registry has county home page only |
| Blaine Police lost pets news | police-sheriff | Blaine | https://minneapolimedia.town.news/g/coon-rapids-mn/n/373233/blaine-police-warn-spring-surge-lost-pets-warm-weather-returns | none | no | found, lost | search | Local news item about lost pets surge; not a list. Blaine strays: CACC impound-only |
| Oak Grove Law Enforcement | police-sheriff | Oak Grove | https://oakgrovemn.gov/police | none | no | shelter-stray | seen | Sheriff contract; animal control via CACC; animals at the Companion Animal Center, 5-day hold |
| Ramsey County Sheriff Animal Control | police-sheriff | Ramsey County contract cities | https://ramseycounty.us/node/5786 | none | no | shelter-stray | search | Page moved and the new address returned 404. Search text said contract-city strays go to AHS Woodbury; CACC pages say CACC. Registry has county home page only |
| Washington County Sheriff Patrol Division | police-sheriff | Washington County contract cities | https://www.washingtoncountymn.gov/3462/Patrol-Division | none | no | shelter-stray | seen | Law enforcement contracts only; no animal info. Registry has county home page only |
| White Bear Lake Police found dogs | police-sheriff | White Bear Lake | https://whitebearlakemag.com/?p=2485 | Facebook | no | found | seen | 2020 news item: police hold dogs at the station and post on their Facebook page; verify still true. URL is the article, not the page |
| Animal Humane Society lost and found pets | shelter | Twin Cities metro | https://www.animalhumanesociety.org/lost/lost-and-found-pets | unknown | unknown | found, lost | search | Linked from Saint Paul page; not opened. Registry has AHS home page only |
| Animal Humane Society strays list | shelter | Ramsey Sheriff contract cities, Oakdale, others | https://www.animalhumanesociety.org/strays | unknown | unknown | shelter-stray, found | search | Linked from Arden Hills page. refused: 403 on fetch |
| Animal Humane Society Woodbury (Adopt-a-Pet) | shelter | Ramsey and Washington cities | https://www.adoptapet.com/shelter78198-pets.html | Adopt-a-Pet | no | shelter-stray | search | Adoptables listing of the Woodbury shelter, not strays |
| Companion Animal Center | shelter | Oakdale | https://www.companionanimalcenter.com | own site | no | shelter-stray | seen | Boarding and daycare site of CACC's centre; no list; points to companionanimalcontrol.com |
| Greenhill Humane Society (via Cottage Grove code) | shelter | Cottage Grove | https://codelibrary.amlegal.com/codes/cottagegrovemn/latest/cottagegrove_mn/0-0-0-2744 | unknown | unknown | shelter-stray | unsure | Named by a search summary only; URL is the Cottage Grove ordinance, not the shelter |
| Northwoods Humane Society | shelter | Interim CACC impound 2025; Wyoming MN area | https://petfinder.com/member/us/mn/wyoming/northwoods-humane-society-mn34 | Petfinder | no | shelter-stray | search | Page refused 403 in pass 2; no stray list seen |

### Dakota, Scott and Carver counties

50 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Belle Plaine Police Animal Control | city-program | Belle Plaine | https://www.bpks.org/police-department/animal-control | none | no | shelter-stray | search | City pound houses dogs at large; fetch got 404; New Prague FAQ also lists MN Critter Getter as serving Belle Plaine (conflict or both); no list |
| Burnsville Animal Control (pet licence page) | city-program | Burnsville | https://www.burnsvillemn.gov/191/Pet-and-Kennel-Licenses | none | no | shelter-stray | seen | Lists American Boarding Kennels as Animal Control; does not state impound role; no list |
| Chanhassen Animal Control | city-program | Chanhassen | https://www.chanhassenmn.gov/departments/public-safety/law-enforcement/animal-control | none | no | shelter-stray, found | search | Carver County Sheriff enforces; dogs only impounded, at 4 Paws; stray cats go to Animal Humane Society; fetch of lost-found page got 403 |
| Elko New Market Animal Control | city-program | Elko New Market | https://elkonewmarketmn.gov/animalcontrol | none | no | shelter-stray, found | seen | Contracts Minnesota Critter Getter (Henderson); offers lost and found service; no list |
| Hastings Lost and Found Pets (City of Hastings) | city-program | Hastings | https://www.hastingsmn.gov/home-living/animals-and-pets/lost-and-found-pets/ | none | no | shelter-stray, found | seen | Contracts River Bluff Humane Society to hold found animals; no list on page |
| Inver Grove Heights Police Animal Control | city-program | Inver Grove Heights | https://ighmn.gov/1350 | none | no | shelter-stray | seen | Unowned animals go to South Saint Paul Animal Hospital; no public list; call police |
| Jordan Animal Control (city code) | city-program | Jordan | https://codelibrary.amlegal.com/codes/jordan/latest/jordan_mn/0-0-0-7514 | none | no | shelter-stray | unsure | Code allows a contracted agency or police officer; New Prague FAQ lists Minnesota Critter Getter as serving Jordan (holder's page: the New Prague FAQ); Pass 2: code page answered 403 |
| Lakeville Animal Control (City of Lakeville) | city-program | Lakeville | https://lakevillemn.gov/1507/Animal-Control | none | no | shelter-stray | seen | Already in registry as city home page only; this is the exact page. Police house no animals; names no shelter; links AHS lost-and-found resources. No public list |
| Mendota Heights lost and found (via 4 Paws) | city-program | Mendota Heights | https://wspmn.gov/389/Lost-Found-Pets | none | no | shelter-stray | seen | Source is the West St. Paul page, which says Mendota Heights contracts with 4 Paws; city's own page not located |
| New Prague FAQ (animal control) | city-program | New Prague | https://newpraguemn.gov/faqs | none | no | shelter-stray | seen | Pass 2: FAQ lists MN Critter Getter (Scott County) serving Belle Plaine, Jordan, New Prague, Elko New Market, Montgomery, Le Sueur and Le Sueur County (dogs only); does not say where animals are held; links http://www.mncrittergetter.com/ |
| Norwood Young America animal code | city-program | Norwood Young America | https://cityofnya.com/wp-content/uploads/2025/01/2025.09-chapter-5.pdf | PDF | no | shelter-stray | unsure | Code defines a designated City Pound; facility not named in what I saw |
| Prior Lake Animal Control and Pet Information | city-program | Prior Lake | https://www.priorlakemn.gov/government/departments/police/animal-control-pet-information | none | no | shelter-stray, found | search | Works with Spot's Last Stop for dogs and cats incl. impounding strays; my fetch got 404 so URL may have moved |
| Savage Animal Control (contact directory) | city-program | Savage | https://cityofsavage.com/Home/Components/FacilityDirectory/FacilityDirectory/72/1099 | none | no | shelter-stray | search | Search summary: contracts with 4 Paws. Spot's Last Stop's own site now lists Savage and Prior Lake as its animal-control cities, so the holder may have changed (conflict). Pass 2: the page redirected to savagemn.gov and then answered 403 (refused); city pets page also 403 |
| Shakopee Pets and Animals (newer page) | city-program | Shakopee | https://shakopeemn.gov/living-here/pets-animals | none | no | shelter-stray | search | Search summary says 4 Paws in Savage; conflicts with the old page; Pass 2: answered 404, so the claim stays unconfirmed |
| Shakopee Pets and Animals (old page) | city-program | Shakopee | https://www.shakopeemn.gov/residents/pets_animals.php | none | no | shelter-stray | seen | Says found dogs go to Bloomington Animal Control, accepted only from law enforcement; call police first; no list; may be stale |
| West St. Paul Animal Control | city-program | West St. Paul | https://wspmn.gov/389/Lost-Found-Pets | none | no | shelter-stray, found | seen | Police impound; held at South Saint Paul Animal Hospital; licence-tag owners called; links lost-and-found resources |
| Carver County code (animal control) | county-program | Carver County unincorporated | https://codelibrary.amlegal.com/codes/carvercounty/latest/carverco_mn/0-0-0-12898 | PDF | no | shelter-stray | unsure | County animal ordinance; holder not seen |
| American Boarding Kennels Facebook | facebook-page | Burnsville | https://www.facebook.com/people/American-Boarding-Kennels-Burnsville/61553771223151/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Animal Ark Facebook | facebook-page | Hastings | https://www.facebook.com/AnimalArkMN/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Carver-Scott Humane Society Facebook | facebook-page | Carver and Scott counties | https://www.facebook.com/CarverScottHumaneSociety | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| City of Hastings Facebook page | facebook-page | Hastings | https://www.facebook.com/cityhastingsmn | Facebook | unknown | found | unsure | Linked from the lost-and-found page; unknown whether it posts found dogs |
| River Bluff Humane Society Facebook | facebook-page | Hastings, Goodhue County | https://www.facebook.com/HumaneSocietyGC?mibextid=ZbWKwL | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| South Saint Paul Animal Hospital Facebook | facebook-page | West St. Paul, Inver Grove Heights | https://www.facebook.com/SouthStPaulAnimalHospital/ | Facebook | unknown | found, shelter-stray | search | linked from the organisation's own site, not opened; West St. Paul says staff post adoptable unclaimed pets on a Facebook account |
| Spot's Last Stop Facebook | facebook-page | Savage, Prior Lake | https://www.facebook.com/SpotsLastStop/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| 4 Paws Animal Control | impound-contractor | Chanhassen, Savage, Mendota Heights, possibly Shakopee, Farmington, Prior Lake, Chaska | https://www.chanhassenmn.gov/departments/public-safety/law-enforcement/animal-control/lost-found-animals | none | no | shelter-stray | search | No own website seen; Savage/Shakopee area; dogs adoptable after 10 business days (Chanhassen contract, 2020); my fetch of this page got 403; 2011 directory list of cities is old |
| American Boarding Kennels | impound-contractor | Burnsville | https://www.americanboardingkennel.com/ | none | no | shelter-stray | seen | Pass 2: site is a private boarding and daycare business and says nothing about animal control or impound; the Burnsville city page is the only link to strays; no list. Burnsville FAQ page (faq.aspx?TID=47) answered 404 |
| Bloomington Animal Control | impound-contractor | Shakopee (per old page) | https://www.shakopeemn.gov/residents/pets_animals.php | none | no | shelter-stray | unsure | Hennepin County facility; another researcher's area; named only by the old Shakopee page |
| Minnesota Critter Getter | impound-contractor | Elko New Market, New Prague, Jordan, Belle Plaine | https://elkonewmarketmn.gov/animalcontrol | none | unknown | shelter-stray | seen | Henderson is in Sibley County; New Prague FAQ lists it for Belle Plaine, Jordan, New Prague and Elko New Market; its own site http://www.mncrittergetter.com/ failed with an expired certificate (not retried) |
| River Bluff Humane Society | impound-contractor | Hastings (Red Wing is in Goodhue County) | https://rbhspets.org/adopt/ | own site | no | shelter-stray | seen | Pass 2: site shows adoptables only (own WordPress site); no lost-and-found, stray list or served-cities list; holder role for Hastings comes from the Hastings page; outside the three counties |
| South Saint Paul Animal Hospital | impound-contractor | West St. Paul, Inver Grove Heights, South St. Paul (unconfirmed) | https://sspah.com | none | no | shelter-stray | seen | Pass 2: its own site mentions no strays, impound, cities served or lost-and-found list; the holder role comes only from the West St. Paul and IGH city pages |
| Spot's Last Stop Animal Control | impound-contractor | Savage, Prior Lake | https://spotslaststop.org/animal-control/ | own site | no | shelter-stray, found | seen | Pass 2: own site says it provides animal control for the cities of Savage and Prior Lake; found pets are reported by phone or email, call ahead; the page shows no public list of held or found dogs. Petfinder page answered 403 |
| Patch Mendota Heights pets | media | Mendota Heights | https://patch.com/minnesota/mendotaheights/pets | own site | no | found, lost | search | Local news items on found dogs from police; not a feed; not opened |
| America's National Lost and Found Pet Database | national-db | national | http://www.lostfoundpets.us/ | own site | unknown | found, lost | search | Linked from the West St. Paul page; not opened |
| NoKill Network Lakeville lost and found | national-db | Lakeville | https://www.nokillnetwork.org/lostandfound/minnesota/lakeville | own site | no | found, lost | search | Many entries old |
| PawBoost Jordan found stray dogs | national-db | Jordan | https://www.pawboost.com/lost-found-pets/jordan-mn-55352/all-found-stray-dogs/page-1 | own site | no | found | search | PawBoost already in registry generically; this is a per-city page |
| Pet911 Lakeville found dogs | national-db | Lakeville | https://pet911.org/lakeville/found-dogs | own site | no | found | search | Reports mostly old; third-party aggregator |
| PetKey Lakeville lost and found | national-db | Lakeville and nearby Dakota cities | https://petkey.org/lost-and-found/lakeville_mn | own site | no | found, lost | search | Per-city pages also exist for Apple Valley, Farmington and Rosemount |
| Carver County Sheriff's Office (animal control, dispatch) | police-sheriff | Carver County (Chanhassen and other cities) | https://www.chanhassenmn.gov/departments/public-safety/law-enforcement/animal-control/animal-complaints | none | no | shelter-stray, found, lost | search | Sheriff enforces animal law; dispatch takes stray reports and says whether a pet was picked up; own page not found |
| Chaska Police (animal questions) | police-sheriff | Chaska | https://chaskamn.gov/m/faq?cat=38 | none | no | shelter-stray | seen | Uses county dispatch for missing animals; no impound named; no list |
| Eagan Police Department Animal Control | police-sheriff | Eagan | https://search.211unitedway.org/search/4bb0338f-95d5-56c4-9e8b-8be4f1cb8b43 | none | no | shelter-stray, found | search | Police officers impound loose dogs, 5 business day hold; impound facility not found; city page not located; 211 listing updated April 2025 |
| Farmington Police (stray dogs) | police-sheriff | Farmington | https://farmingtonmn.gov/m/faq?cat=34 | none | no | shelter-stray | seen | Call 911; officer picks up and helps return; holding place not stated; licensing ended 2024 |
| Hastings Police Animal Control | police-sheriff | Hastings | https://hastingsmn.gov/city-government/city-departments/police-department/services/animal-control | none | no | shelter-stray | seen | Loose or unlicensed dogs go to a pound the page does not name (the Lost and Found page names River Bluff); no list |
| Rosemount Police (dog licensing and animal calls) | police-sheriff | Rosemount | https://search.211unitedway.org/search/809c9f71-ab38-5c2f-8a32-c8241eb0c50a | none | no | shelter-stray | unsure | Police handle licensing; ordinance covers impound; holding facility not found |
| Spot's Last Stop available dogs | rescue | Savage, Prior Lake | https://spotslaststop.org/available-dogs/ | own site | no | unknown | search | linked from Spot's Last Stop's page; adoptable foster dogs only, not opened; also on Adopt-a-Pet (https://www.adoptapet.com/shelter/91075) |
| Wags and Whiskers Animal Rescue | rescue | Farmington | https://mn.gov/adresources/search/64e6469e-57cb-5ab8-9531-d42799c70cea | unknown | unknown | shelter-stray | search | State directory listing; surrender by appointment; not a pound. A second Farmington listing, Last Hope Inc, is a no-kill with no shelter site and no surrenders (no URL seen) |
| Animal Ark (Hastings) | shelter | Hastings, Dakota County, Minnesota | https://animalarkmn.org/adopt/ | own site | no | shelter-stray | seen | Pass 2: no-kill; site says it accepts sick and injured strays from its immediate area; adoptables only on the site (platform not shown); no lost-and-found page; also on Petfinder (https://petfinder.com/member/us/mn/hastings/animal-ark-mn88) |
| Animal Humane Society Lost and Found resources | shelter | Minnesota | https://www.animalhumanesociety.org/lost-and-found/lost-and-found-pet-resources | own site | no | found, lost | seen | Linked by Lakeville and WSP; AHS is already in registry as home page only; this is the exact page |
| Carver-Scott Humane Society | shelter | Carver, Scott, Dakota and Hennepin counties (per Adopt-a-Pet), Chaska | https://www.carverscotths.org/adopt | own site | no | shelter-stray | seen | Pass 2: its site has an adopt section and a Pet Support folder that holds no pages; no lost-and-found reporting page found (the earlier 211 claim is unconfirmed by its own site); cares for dumped dogs; also Adopt-a-Pet (https://www.adoptapet.com/shelter/76720); Petfinder page answered 403 |
| Minnesota Humane Society lost and found | shelter | Minnesota (St. Paul) | https://mnhumane.org/companion-animals/#134 | own site | unknown | found, lost | search | Linked from the West St. Paul page; outside assignment |
| Shakopee Mdewakanton Sioux Community Public Works (animal control) | tribal | SMSC reservation lands | https://shakopeedakota.org/department/public-works/ | none | unknown | shelter-stray, found | seen | Pass 2: page only names animal control among Public Works duties; no stray page or list; departments page also has no animal control link |

### North-east and north-central Minnesota

74 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aitkin City Dog Pound | city-program | Aitkin | https://www.adoptapet.com/shelter/78075 | Adopt-a-Pet | no | shelter-stray | seen | Profile opened: no website or Facebook listed; no list |
| Biwabik (strays) | city-program | Biwabik | https://mesabihumanesociety.org/programs/animal-control/ | own site | no | shelter-stray | seen | Holder's page: Mesabi Humane Society |
| Chisholm (strays) | city-program | Chisholm | http://www.pphsc.com | own site | no | shelter-stray | seen | Holder's page: Precious Paws |
| City of Aitkin animal code | city-program | Aitkin | https://codelibrary.amlegal.com/codes/aitkin/latest/aitkin_mn/0-0-0-1474 | none | no | shelter-stray | search | City code on release and fees |
| City of Bemidji lost and found | city-program | Bemidji | http://www.ci.bemidji.mn.us/index.asp?Type=B_BASIC&SEC={CDF0D0BD-1347-41CB-875F-B3F80796E717} | own site | unknown | lost, found | search | linked from Great River Rescue's page; Bemidji strays go to the City Pound per that page |
| Duluth Animal Control (City of Duluth Police) | city-program | Duluth | https://duluthmn.gov/police/information-services/animal-control/ | none | no | shelter-stray | seen | Holds lost/found pets 5 days then transfers adoptable to a local shelter; no public list; city home page already in registry, this page is new |
| Gilbert (strays) | city-program | Gilbert | https://mesabihumanesociety.org/programs/animal-control/ | own site | no | shelter-stray | seen | Holder's page: Mesabi Humane Society |
| Grand Rapids Domestic Animal Control Facility | city-program | Grand Rapids; county strays per a dated 2016 document | https://cityofgrandrapidsmn.com/node/2390 | own site | no | shelter-stray | seen | Police-run; no list on page |
| Hermantown (strays) | city-program | Hermantown | https://www.animalallies.net/found-pet-resources | own site | no | shelter-stray | seen | Holder: Hermantown Police Department per Animal Allies; holder's page is Animal Allies guidance, police page not found |
| Hibbing Animal Control (City of Hibbing) | city-program | Hibbing | https://hibbingmn.gov/FormCenter/PBA-13/Report-an-Animal-Incident-62 | own site | no | shelter-stray | seen | Report form; strays taken to Hibbing Animal Intake; no public list |
| International Falls City Animal Pound | city-program | International Falls | https://search.211unitedway.org/search/c5068301-fed9-5f6b-8bd9-af5672aae865 | none | no | shelter-stray | search | 211 listing, undated; no public list |
| Keewatin (strays) | city-program | Keewatin | http://www.pphsc.com | own site | no | shelter-stray | seen | Holder's page: Precious Paws |
| Mountain Iron (strays) | city-program | Mountain Iron | https://mesabihumanesociety.org/programs/animal-control/ | own site | no | shelter-stray | seen | Holder's page: Mesabi Humane Society |
| Nashwauk (strays) | city-program | Nashwauk | http://www.pphsc.com | own site | no | shelter-stray | seen | Holder's page: Precious Paws |
| Proctor (strays) | city-program | Proctor | https://www.animalallies.net/found-pet-resources | own site | no | shelter-stray | seen | Holder: Proctor Police Department per Animal Allies; holder's page is Animal Allies guidance |
| Tenstrike (strays) | city-program | Tenstrike | https://www.greatriverrescue.com/about/lost-found/ | own site | no | shelter-stray | seen | Holder: Township Pound at a Bemidji veterinary clinic per Great River Rescue; holder's page is that page |
| Virginia (strays) | city-program | Virginia | https://mesabihumanesociety.org/pet-information/what-to-do-missing-and-stray-animals/ | none | no | shelter-stray | seen | City ended its Mesabi contract and handles animal services through City Hall; city page not found |
| Craigslist Duluth lost and found | classifieds | Duluth | http://duluth.craigslist.org/laf/ | unknown | no | lost, found | search | linked from Animal Allies' page |
| Animal Allies on Adopt-a-Pet | directory | Duluth | https://www.adoptapet.com/shelter/70045 | Adopt-a-Pet | no | shelter-stray | search | Adoptables only |
| Grand Rapids Animal Control on Adopt-a-Pet | directory | Grand Rapids | https://adoptapet.com/shelter/69937-city-of-grand-rapids-animal-control-for-lost-found-pets-only-no-adoptions-grand-rapids-minnesota | Adopt-a-Pet | no | shelter-stray | search | Listing says lost and found only |
| HART on Adopt-a-Pet | directory | Brainerd | https://www.adoptapet.com/shelter/65202 | Adopt-a-Pet | no | shelter-stray | search | Adoptables only |
| No Kill Network lost and found Mora | directory | Mora | https://www.nokillnetwork.org/lostandfound/minnesota/mora | unknown | unknown | lost, found | search | Aggregator |
| Petkey Duluth lost and found | directory | Duluth | https://petkey.org/lost-and-found/duluth_mn | unknown | unknown | lost, found | search | Aggregator from pass 1; not opened |
| Alerting the Citizens of the Iron Range | facebook-group | Iron Range | https://www.facebook.com/groups/160568857638394/ | Facebook | unknown | lost, found | search | linked from Mesabi Humane Society's page, not opened |
| Bemidji Area Lost/Found Animals | facebook-group | Bemidji area | https://www.facebook.com/groups/204050392994912 | Facebook | unknown | lost, found | search | linked from Great River Rescue's page, not opened |
| Facebook group linked from Lake of the Woods Humane Society | facebook-group | Lake of the Woods County | https://www.facebook.com/groups/242482485879233/ | Facebook | unknown | lost, found | search | linked from Lake of the Woods Humane Society's page, group name not seen, not opened |
| Iron Range Lost and Found Pets | facebook-group | Iron Range | https://www.facebook.com/groups/513629141999019/ | Facebook | unknown | lost, found | search | linked from Mesabi Humane Society's page, not opened |
| Lost and Found Pets Iron Range | facebook-group | Iron Range | https://www.facebook.com/groups/982358661858092 | Facebook | unknown | lost, found | search | linked from Mesabi Humane Society's page, not opened |
| Lost Dogs of Minnesota | facebook-group | Minnesota | https://www.facebook.com/LDoMN | Facebook | unknown | lost, found | search | linked from Animal Allies' page; likely the "Lost Dogs Minnesota" registry entry, now with a real URL |
| Missing Pets of the Northland | facebook-group | Duluth, Cloquet, Northland | https://www.facebook.com/CloquetLostPets/ | Facebook | unknown | lost, found | search | linked from Animal Allies' and Mesabi Humane Society's pages, not opened; Facebook URL path suggests Cloquet origin |
| Animal Allies Facebook | facebook-page | Duluth area | http://www.facebook.com/animalallies | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Grand Rapids Animal Control Facebook | facebook-page | Grand Rapids | https://www.facebook.com/cityofgranimalcontrol | Facebook | unknown | found, shelter-stray | search | linked from the organisation's own site, not opened |
| Great River Rescue Facebook | facebook-page | Bemidji | https://www.facebook.com/greatriverrescue | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| HART Facebook | facebook-page | Crow Wing, Cass, Aitkin | https://www.facebook.com/HARTPETS | Facebook | unknown | found, shelter-stray | search | linked from the organisation's own site, not opened; where HART advertises strays |
| Headwaters Animal Shelter Facebook | facebook-page | Park Rapids | https://www.facebook.com/HASParkRapids | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Lake of the Woods Humane Society Facebook | facebook-page | Baudette | http://www.facebook.com/low.humanesociety | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Mesabi Humane Society Facebook | facebook-page | Virginia area | https://www.facebook.com/themesabihumanesociety/ | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened; page asks people to post lost/found photos there |
| Precious Paws Facebook | facebook-page | Chisholm area | https://www.facebook.com/preciouspawschisholm/ | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Range Regional Animal Rescue Facebook | facebook-page | Hibbing | https://www.facebook.com/profile.php?id=61563607858591 | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| The Babinski Foundation Facebook | facebook-page | Pequot Lakes | https://www.facebook.com/TheBabinskiFoundation/ | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Wadena County Humane Society Facebook | facebook-page | Wadena | https://www.facebook.com/wadenacountyhumanesociety | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| HART found-a-stray page | impound-contractor | Brainerd, Crow Wing County, contracted municipalities, Cass, Aitkin | https://hartpets.org/found-a-stray-animal | Facebook | no | shelter-stray, found | seen | Says strays are advertised on Facebook as a courtesy; municipalities not named on site; state directory said about 18 |
| Hometown Focus classifieds | media | Iron Range | http://www.hometownfocus.us/ | own site | unknown | lost, found | search | linked from Mesabi Humane Society's page; home page only |
| Mesabi Tribune classifieds | media | Iron Range | http://www.virginiamn.com/ | own site | unknown | lost, found | search | linked from Mesabi Humane Society's page as place for classified ads; home page only |
| Pine Knot News animal coverage | media | Carlton County | https://pineknotnews.com/story/2022/02/25/news/wanted-a-place-for-lost-dogs-and-cats/6796.html | own site | unknown | found | search | News story, not a notice page |
| WTIP community radio law enforcement log | media | Cook County, Grand Marais | https://archive.wtip.org/look-law-enforcement-log-june-2020 | own site | no | found, shelter-stray | search | Sheriff-log posts mention strays going to a local pound or rescue; no lost-pet page |
| Mesabi Humane Society on Petfinder | national-db | Virginia | https://www.petfinder.com/member/us/mn/virginia/mesabi-humane-society-mn397/ | Petfinder | no | shelter-stray | search | Linked from Mesabi's Pet Finder page; adoptables only |
| Lost Dogs MN | other | Minnesota | http://lostdogsmn.com/ | own site | unknown | lost, found | search | linked from Great River Rescue's page |
| Great Tails Animal Rescue | rescue | Itasca County | https://startpage.mapquest.com/us/minnesota/great-tails-animal-rescue-661531930 | unknown | unknown | shelter-stray | unsure | Directory listing only |
| Northern Lakes Rescue | rescue | Brainerd | https://petfinder.com/member/us/mn/brainerd/northern-lakes-rescue-mn441 | Petfinder | no | shelter-stray | search | Adoptables only |
| Paws and Claws Rescue and Resort | rescue | Hackensack, Leech Lake region | https://adoptapet.com/adoption_rescue/190647-paws-and-claws-rescue-resort-hackensack-minnesota | Adopt-a-Pet | no | shelter-stray | search | Adoptables only |
| Range Regional Animal Rescue | rescue | Hibbing | https://rangerescuehibbing.wixsite.com/rrar | own site | no | shelter-stray | seen | Site does not say it takes strays; adoptables on Adopt-a-Pet, Petfinder and own page; shares location with city intake per pass 1 |
| Road to Home Rescue Minnesota | rescue | Grand Rapids | https://adoptapet.com/shelter/102478-road-to-home-rescue-minnesota-grand-rapids-minnesota | Adopt-a-Pet | no | shelter-stray | search | Adoptables only |
| Almost Home Animal Shelter | shelter | Mora, Kanabec County | https://adoptapet.com/shelter/76981-almost-home-animal-shelter-mora-minnesota | Adopt-a-Pet | no | shelter-stray | seen | Profile opened; no own website or Facebook listed |
| Animal Allies found-pet guidance | shelter | Duluth, Hermantown, Proctor, southern St. Louis County | https://www.animalallies.net/found-pet-resources | own site | no | found | seen | Says which agency covers each area; links local Facebook groups |
| Animal Allies Humane Society lost and found | shelter | Southern St. Louis County, Duluth area | https://www.animalallies.net/lost-and-found-pets | own site | no | found, lost | seen | Resource pages plus Petco Love Lost links; found-animal list not seen separately |
| Borderland Humane Society | shelter | International Falls, Koochiching County | https://www.adoptapet.com/shelter/77049 | Adopt-a-Pet | no | shelter-stray | search | Own site not reachable (DNS failure); adoptables only |
| Contented Critters Animal Shelter | shelter | Ely | https://www.petfinder.com/member/us/mn/ely/contented-critters-animal-shelter-mn11/ | Petfinder | no | shelter-stray | search | Appointment only; own site not checked |
| Great River Rescue lost and found | shelter | Bemidji, Beltrami County (named townships) | https://www.greatriverrescue.com/about/lost-found/ | own site | no | found, lost, shelter-stray | seen | Formerly Beltrami Humane Society; found strays on its Stray Pets category; form on Petstablished |
| Great River Rescue lost/found form | shelter | Bemidji area | https://petstablished.com/petlover/general_form/42321 | Petstablished | no | lost, found | search | linked from Great River Rescue's page; submission form, not a list |
| Great River Rescue stray pets | shelter | Bemidji area | https://www.greatriverrescue.com/category/lost-and-found/ | own site | no | shelter-stray | search | Linked from its lost and found page; not opened |
| Headwaters Animal Shelter | shelter | Park Rapids, Hubbard County, parts of Becker, Cass, Beltrami, Clearwater | https://headwatersanimalshelter.org/ | own site | no | shelter-stray | seen | Home page only; no stray page found; service area from Adopt-a-Pet |
| Itasca County planned shelter (Cohasset) | shelter | Itasca County | https://www.northernnewsnow.com/2025/09/02/first-look-long-awaited-itasca-county-animal-shelter/ | unknown | unknown | shelter-stray | search | 2025-09-02 news; 2026 status unchecked |
| Lake of the Woods Humane Society lost and found | shelter | Baudette, Lake of the Woods County | http://www.lowhumanesociety.com/lostfound.html | own site | no | found, lost | seen | Posts lost/found on its site and Facebook; Petfinder for adoptables |
| Mesabi Humane Society animal control | shelter | Mountain Iron, Gilbert, Biwabik, St. Louis County | https://mesabihumanesociety.org/programs/animal-control/ | own site | no | shelter-stray | seen | Names communities it provides animal control for |
| Mesabi Humane Society current lost and found pets | shelter | Virginia area, St. Louis County | https://mesabihumanesociety.org/pet-information/current-lost-and-found-pets/ | own site | no | found, lost | seen | Image-link list; listings not readable in text so unclear whether dogs found or lost |
| Mesabi Humane Society what to do | shelter | Iron Range | https://mesabihumanesociety.org/pet-information/what-to-do-missing-and-stray-animals/ | own site | no | found, lost | seen | Links Iron Range Facebook groups and classifieds; Virginia now handles strays itself |
| Precious Paws Humane Society of Chisholm | shelter | Chisholm, Keewatin, Nashwauk | http://www.pphsc.com | own site | no | found, lost, shelter-stray | seen | Home page only; has Lost and Found Animals and Return to Owner pages, URLs not seen |
| Star of the North Humane Society | shelter | Coleraine, Grand Rapids, Cohasset, Bovey | https://adoptapet.com/shelter/71338-star-of-the-north-humane-society-coleraine-minnesota | Adopt-a-Pet | no | shelter-stray | search | Small no-kill rescue; shortened profile URL returned 404; own site not found |
| The Babinski Foundation lost and stray animals | shelter | Pequot Lakes area | https://babinskifoundation.org/lost-animals | own site | no | found, lost, shelter-stray | seen | Sections for lost animals reported and strays in its facility; hand-entered; Squarespace |
| Wadena County Humane Society stray animals | shelter | Wadena, Wadena County | https://wadenacountyhumanesociety.org/stray-animals/ | Shelterluv | no | found, shelter-stray | seen | Found Pets page powered by Shelterluv; Shelterluv list URL itself not seen |
| Leech Lake Tribal Police animal control | tribal | Leech Lake Reservation | http://www.llojibwe.org/lltpd/animalcontrol.html | own site | unknown | shelter-stray | search | linked from Great River Rescue's page; tribal programs are another researcher's job |
| Carlton County Animal Rescue | volunteer-team | Carlton County, Cloquet | https://pineknotnews.com/story/2023/03/10/news/animal-shelter-launches-in-carlton-county/8891.html | none | no | shelter-stray, found | search | Volunteers pick up loose animals; Petfinder profile refused 403; URL is a news story, not the group's page |
| The Retrievers Lost Dog Team | volunteer-team | Minnesota | https://www.facebook.com/TheRetrieversLostDogTeam/ | Facebook | unknown | lost, found | search | linked from Mesabi Humane Society's page, not opened |

### North-west and west-central Minnesota

41 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| City of Barnesville animal control | city-program | Barnesville | https://barnesvillemn.com/how-do-i/report/stray-dogs-cats | Facebook | no | shelter-stray | seen | City impound run by police animal control, 5 day hold; photos around town and on the Barnesville Animal Control Facebook page |
| City of Detroit Lakes animal control | city-program | Detroit Lakes | https://cityofdetroitlakes.com/vertical/Sites/%7BF991A069-E23D-412C-8132-49318B273050%7D/uploads/Animal_control_flyer_PD.pdf | PDF | no | shelter-stray | unsure | Police flyer, image-only PDF, unreadable; Marshmallow is the city impound (holder's page: Marshmallow row) |
| City of Fargo lost pets page | city-program | Fargo (ND) | https://fargond.gov/live/pets-stray-animals/lost-pets | own site | no | lost, found | search | North Dakota, tripped over |
| City of Fergus Falls animal control | city-program | Fergus Falls | https://fergusfallsmn.gov/animalcontrol | none | no | shelter-stray | seen | Strays go to the Humane Society of Otter Tail County (holder's page: https://www.humanesocietyotc.org/lost-found); no online found list |
| City of Glenwood strays | city-program | Glenwood | http://www.pchsmn.org/lost-and-found | Shelterluv | no | shelter-stray | seen | Named on the Pope society's page (holder's page) |
| City of Mahnomen animal ordinance | city-program | Mahnomen | https://codelibrary.amlegal.com/codes/mahnomen/latest/mahnomen_mn/0-0-0-1727 | none | no | shelter-stray | search | City code only; Marshmallow assists when called (holder's page: Marshmallow row) |
| City of Moorhead animal services (pound) | city-program | Moorhead | https://www.moorheadmn.gov/property-services/animal-services/ | none | no | shelter-stray | seen | Dispatch sends officers to the Moorhead Animal Pound; 5 day hold then a rescue; no public list; older pages name FM Animal Hospital |
| City of Starbuck animal control | city-program | Starbuck | http://www.pchsmn.org/lost-and-found | Shelterluv | no | shelter-stray | seen | Starbuck police pick up strays and Pope society holds them (holder's page); city licence $10 |
| City of Thief River Falls animal pound | city-program | Thief River Falls | https://www.trfmn.gov/node/661 | none | no | shelter-stray | search | Holds up to 5 days then the Pennington society (holder's page: Pennington row); fetch returned 404 in pass 1 |
| East Grand Forks animal pound and police | city-program | East Grand Forks | https://mn-eastgrandforks.civicplus.com/283 | own site | no | shelter-stray | search | City code, 5 business day hold; host failed to resolve in pass 2; holding facility unknown |
| Roseau County animal control officer and sheriff | county-program | Roseau County | https://tribunemn.lcp-news.com/articles/1963/view/summary-proceedings-of-the-october-28-2025-roseau-county-board-of-commissioners-meeting | none | unknown | shelter-stray | unsure | County Regulated Animal Ordinance and an animal control officer exist; no holder or list found |
| City of Barnesville Facebook page | facebook-page | Barnesville | https://www.facebook.com/barnesville | Facebook | unknown | shelter-stray | search | linked from the city's own site footer, not opened; the animal control page itself has no direct link |
| Grant County Humane Society Facebook page | facebook-page | Grant County | https://www.facebook.com/GrantCountyHumaneSocietyMN/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Humane Society of Otter Tail County Facebook page | facebook-page | Otter Tail County | http://www.facebook.com/humanesocietyotc.org | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Humane Society of the Lakes Facebook page | facebook-page | Detroit Lakes; Becker County | https://www.facebook.com/HumaneSocietyoftheLakes/ | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Lakes Area Humane Society Facebook page | facebook-page | Alexandria; Douglas County | https://www.facebook.com/lakesareahumanesociety/ | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened; accepts missing-pet photos |
| Marshmallow Animal Shelter Facebook page | facebook-page | Detroit Lakes; Becker County | http://www.facebook.com/marshmallowanimalshelter | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Pennington County Humane Society Facebook page | facebook-page | Pennington County | https://facebook.com/pawstrf/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Pope County Humane Society Facebook page | facebook-page | Pope County | https://www.facebook.com/PCHSmn | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Scruffy Tails Humane Society Facebook page | facebook-page | Crookston; Polk and Marshall | https://www.facebook.com/ScruffyTailsHumaneSociety | Facebook | unknown | found, lost | search | linked from the organisation's own site, not opened |
| Stevens Community Humane Society Facebook page | facebook-page | Stevens County | https://www.facebook.com/SCHS.Morris | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Crookston police pound contract | impound-contractor | Crookston | https://kroxam.com/?p=24350 | none | unknown | shelter-stray | unsure | KROX article says a local pound takes Crookston police finds under contract; pound unnamed, article undated |
| Marshmallow Animal Shelter (Marshmallow Foundation) | impound-contractor | Detroit Lakes; Audubon Callaway Frazee Lake Park Mahnomen Waubun when called; Becker County outside city | http://www.marshmallowfoundation.org/animals/browse?special=Recent+Arrivals | own site | no | shelter-stray, found | seen | Recent Arrivals page lists found strays, not adoptables; platform guessed as RescueGroups from page structure; found instructions at http://www.marshmallowfoundation.org/info/display?PageID=15693 |
| Valley News Live | media | Fargo-Moorhead; Clay and Wilkin | https://www.valleynewslive.com/2026/04/08/group-dumped-dogs-found-richland-wilkin-counties/?outputType=amp | own site | no | found | search | Found-dog stories; no standing lost-and-found page |
| Moorhead Police Animal Control Unit | police-sheriff | Moorhead | https://moorheadmn.gov/departments/police/records-division/animal-control-unit | none | unknown | shelter-stray | search | Search result only; fetch returned 404 in pass 1 |
| Ellie's Legacy Pet Rescue | rescue | Alexandria | https://www.ellieslegacy.org/ | unknown | unknown | shelter-stray | search | linked from Pope County Humane Society's surrounding rescues page |
| Little Rescue on the Prairie | rescue | Ortonville; Big Stone County | https://www.womenspress.com/little-rescue-on-the-prairie/ | unknown | unknown | shelter-stray | search | URL is a news article, not the rescue's page |
| Circle of Friends Animal Shelter (Grand Forks ND) | shelter | Grand Forks ND; lists Polk County MN | https://www.grandforksgov.com/government/city-departments/finance-and-administrative-services/animals-in-grand-forks/lost-and-stray-animals | unknown | no | shelter-stray | search | North Dakota, tripped over; Grand Forks city impound |
| Grant County Humane Society | shelter | Grant County; Elbow Lake | https://gchumsoc.org | own site | no | shelter-stray | seen | Site has Local Resources and adoptable animals pages (contents not opened); helps surrounding areas if room |
| Hawk Creek Animal Shelter | shelter | Willmar area | https://www.thehskmc.com/ | unknown | unknown | shelter-stray | search | Outside the 19 counties, tripped over; linked from Pope County Humane Society's surrounding rescues page |
| Homeward Animal Shelter (Fargo ND) | shelter | Fargo-Moorhead metro | https://www.homewardonline.org/resources/lost-found-pet-information.html | own site | no | found, lost | search | North Dakota, tripped over; says Moorhead and West Fargo pounds do not take dropped-off strays |
| Humane Society of Otter Tail County | shelter | Otter Tail County; Fergus Falls strays | https://www.humanesocietyotc.org/lost-found | Petango/PetPoint | no | shelter-stray, found, lost | seen | Stray list hosted on ws.petango.com (exact list URL not seen); 5 business day hold; refuses animals from outside the county; Petfinder profile returned 403 |
| Humane Society of Richland-Wilkin Counties (Wahpeton ND) | shelter | Wilkin County; Breckenridge | https://www.petfinder.com/member/us/nd/wahpeton/humane-society-of-richland-wilkin-counties-nd14 | Petfinder | no | shelter-stray | search | North Dakota, tripped over |
| Humane Society of Swift County | shelter | Swift County; Benson | https://petfinder.com/member/us/mn/benson/humane-society-of-swift-county-mn80 | Petfinder | no | shelter-stray | search | Foster-based; Petfinder profile returned 403 in pass 2; its linked website was not opened |
| Humane Society of the Lakes | shelter | Detroit Lakes; Becker County | https://www.hsofthelakes.org/lostandfound | own site | no | shelter-stray, found, lost | seen | Found list of animals on stray hold plus lost/found form; site is on Wix; old humanesocietyofthelakes.org redirects here |
| Lake of the Woods Humane Society | shelter | Lake of the Woods (Baudette) | https://www.adoptapet.com/shelter/88444 | Adopt-a-Pet | no | shelter-stray | search | Outside the 19 counties, tripped over |
| Lakes Area Humane Society | shelter | Alexandria; Douglas County; neighbouring counties | http://www.lakesareahumanesociety.org/found%2Flost-animals | own site | no | shelter-stray, found, lost | seen | Stray list on own site (empty when read, may lag); lost-pet checklist; names PawBoost; site built on GoDaddy |
| Pennington County Humane Society | shelter | Pennington County; north-west Minnesota; Kittson Marshall Red Lake per a 211 listing | https://www.adoptapet.com/shelter/67043 | Adopt-a-Pet | no | shelter-stray | seen | Own site pawstrf.org shows adoptables only, no lost-found page; Petfinder profile 403 |
| Pope County Humane Society | shelter | Pope County; Glenwood; Starbuck | http://www.pchsmn.org/lost-and-found | Shelterluv | no | shelter-stray, found, lost | seen | Found-pet and missing-pet report forms on Shelterluv (form URLs not seen); 5 day impound hold; links PawBoost and Petco Love Lost |
| Scruffy Tails Humane Society | shelter | Crookston; Polk and Marshall counties | https://scruffytails.org/lost-and-found | Shelterluv | no | shelter-stray, found, lost | seen | Site has a Lost and Found page whose content did not load; adoptable dogs via Shelterluv; formerly Humane Society of Polk County (unconfirmed same body) |
| Stevens Community Humane Society | shelter | Stevens County; Morris | https://www.stevenscommunityhumanesociety.org/ | Petfinder | no | shelter-stray | seen | Site links Petfinder for adoptables only; no lost-found procedure; own Petfinder profile 403 |

### Central Minnesota

48 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| City of Isanti animal control | city-program | Isanti | https://www.kbek.com/post/isanti-changes-animal-control-contractor-after-mistreatment-allegations | none | no | shelter-stray | search | Contractor is On-Line Retrievers per local radio; the city changed contractor |
| City of Kandiyohi animal services | city-program | City of Kandiyohi | https://www.cityofkandiyohimn.gov/animal-services | none | unknown | shelter-stray | search | Own ordinance; link to Willmar shelter not confirmed |
| City of Little Falls | city-program | Little Falls | https://www.adoptapet.com/shelter/77267-morrison-county-animal-humane-society-little-falls-minnesota | none | no | shelter-stray | search | Strays go to Morrison County Animal Humane Society under an impound agreement; no city page seen |
| City of Monticello Animal Control (impound) | city-program | Monticello plus 23 contracted cities and townships (names not published on either page) | http://www.monticellomn.gov/237/Animal-Control | none | no | shelter-stray | seen | Department page opened 2nd pass (old ci.monticello.mn.us address redirects here): names no contracted cities, no held-dog list, no platform; city blog https://monticellomn.gov/Blog.asp?IID=71 gives 23 contracts and 2022 intake 524 animals, 253 dogs |
| City of Sartell and City of Waite Park | city-program | Sartell, Waite Park | https://tricountyhumanesociety.org/pet-resources/lost-a-pet.html | none | unknown | shelter-stray | unsure | City halls listed as contacts; Waite Park strays appear on Tri-County listings; one row for two cities because only a shared listing was seen |
| Dayton (city of, Hennepin and Wright) | city-program | Dayton | https://www.daytonmn.gov/departments/police/animal_information.php | none | no | shelter-stray | seen | Contracts with Monticello Animal Impound for stray dogs only; no list; outside my counties partly, tripped over |
| Holdingford city maintenance | city-program | Holdingford | https://holdingford.gov/faqs/what-do-i-do-if-there-is-a-stray-animal-in-the-city | none | no | found | seen | City maintenance by day, Stearns County Sheriff after hours; no public list |
| Hutchinson Police animal control | city-program | Hutchinson | https://hutchinsonmn.gov/city-services/departmentsfacilities/police-services/animal-control/ | none | no | found, lost | seen | Community service officer takes found animals to an impound facility (unnamed), 7 day hold; owners told to check with police every two days; no list |
| Milaca Police Department | city-program | Milaca | https://cityofmilaca.org/documents/556/Chapter_95_Animals.pdf | none | no | shelter-stray | seen | Code makes the police chief or designee the animal control officer; code PDF only |
| Otsego animal control | city-program | Otsego | https://otsegomn.gov/259/Animal-Control | none | no | shelter-stray | seen | Contracts with the City of Monticello; page does not say where dogs are held or posted |
| St. Cloud Animal Control Division | city-program | St. Cloud | https://tricountyhumanesociety.org/report-a-lost-pet/ | none | unknown | shelter-stray | unsure | Daytime city division, police non-emergency line after hours; no own page found, listed on Tri-County page; strays go to Tri-County; no public list found |
| Chisago County (animal control contract) | county-program | Chisago County | https://chisagocountypress.com/news/2025/nov/26/county-animal-control-goes-to-oakdale-provider/ | none | no | shelter-stray | seen | County contracted Companion Animal Care and Control for 2026; sheriff presented it; no list |
| Mille Lacs County Animal Control | county-program | Mille Lacs County | https://www.cbsnews.com/minnesota/news/dogs-stolen-coffee-shop | none | no | found, shelter-stray | search | Seen only in a news story; no own page; holding place unknown |
| Lost Dogs MN found-dog report form | directory | Minnesota | http://lostdogsmn.com/file-a-found-dog-report/ | own site | no | found, lost | seen | Linked from Tri-County lost-found page; Lost Dogs Minnesota is already in registry as a Facebook entry |
| nokill Network lost and found, Elk River | directory | Elk River | https://www.nokillnetwork.org/lostandfound/minnesota/elk-river/?page=2 | unknown | unknown | lost, found | search | National directory with per-city pages; not opened |
| nokill Network lost and found, Monticello | directory | Monticello | https://www.nokillnetwork.org/lostandfound/minnesota/monticello | unknown | unknown | lost, found | search | National directory with per-city pages; not opened |
| The Center for Lost Pets | directory | national | http://thecenterforlostpets.com/index.aspx | unknown | unknown | lost, found | search | linked from Heart of Minnesota Animal Shelter's page; fetch failed (socket closed), not retried |
| Lost Dogs and Cats of Minnesota (Facebook group) | facebook-group | Minnesota | https://www.facebook.com/groups/1804132063243219 | Facebook | unknown | found, lost | seen | Linked from Tri-County lost-found page; group page not opened; size and status unknown |
| City of Monticello Facebook page | facebook-page | Monticello | https://www.facebook.com/CityofMonticello | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Hawk Creek Animal Shelter Facebook page | facebook-page | Willmar, Kandiyohi and Meeker counties | https://facebook.com/hawkcreekanimalshelter | Facebook | unknown | shelter-stray, found | search | linked from the organisation's own site, not opened |
| Heart of Minnesota Animal Shelter Facebook page | facebook-page | Hutchinson and McLeod County | https://facebook.com/heartofminnesota | Facebook | unknown | shelter-stray, found, lost | search | linked from the organisation's own site, not opened |
| KRWC 1360 Facebook page | facebook-page | Buffalo area | https://www.facebook.com/1360KRWC | Facebook | unknown | found | search | linked from KRWC's page about Crossroads, not opened; radio station page |
| Todd County Minnesota Facebook page | facebook-page | Todd County | https://www.facebook.com/Todd-County-Minnesota-352560118105719/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| Central Minnesota Animal Care and Control (Sauk Rapids) | impound-contractor | Sauk Rapids area; formerly St. Cloud | https://wjon.com/st-cloud-moving-animal-shelters-after-sauk-rapids-incident/ | none | unknown | shelter-stray | search | St. Cloud ended its contract with it, per a local news report; may no longer operate or be used; page not opened |
| Companion Animal Care and Control (Oakdale) | impound-contractor | Chisago County from 2026; also Washington, Anoka, Ramsey municipalities | https://chisagocountypress.com/news/2025/nov/26/county-animal-control-goes-to-oakdale-provider/ | none | unknown | shelter-stray | seen | Holds animals at its Oakdale shelter; also serves St. Croix and Pierce counties in Wisconsin; no public list in the article; a Spring Lake Park document calls a similar contractor MN CACC (possibly the same outfit, unconfirmed) |
| On-Line Retrievers | impound-contractor | Isanti | https://www.kbek.com/post/isanti-changes-animal-control-contractor-after-mistreatment-allegations | none | unknown | shelter-stray | search | New contractor for the city of Isanti; no website found; pays per dog collected and kenneled |
| KBEK radio (Cambridge area) | media | Isanti and Chisago area | https://kbek.com/post/isanti-moves-forward-with-new-animal-control-service | own site | no | found | unsure | News posts only; that page returned 404 on fetch; no lost-and-found board seen |
| Minnesota's New Country radio | media | Stearns County and area | https://minnesotasnewcountry.com/stearns-county-sheriff-looking-for-owners-of-these-2-dogs/ | own site | no | found | search | Carried a Stearns sheriff found-dog item; no standing lost-and-found page seen |
| Mix 94.9 radio (Todd County item) | media | Todd County area | https://mix949.com/todd-county-authorities-ask-for-help-finding-missing-dog/ | own site | no | lost | search | Carried a sheriff appeal for a missing dog; no standing board seen |
| WJON radio (St. Cloud) dog rescue tag | media | St. Cloud area | https://wjon.com/tags/dog-rescue | own site | no | found, lost | search | News tag page, not a notice board; page not opened |
| PawBoost Cambridge MN lost dogs page | national-db | Cambridge area | https://www.pawboost.com/lost-found-pets/cambridge-mn-55008/all-lost-dogs/page-1 | unknown | no | lost, found | search | PawBoost is already in registry as a site; this is a city-level page |
| Buffalo Police Department | police-sheriff | Buffalo | https://thedrummer.com/node/40784 | none | unknown | found | unsure | A newspaper piece reports police return known-missing dogs directly to owners rather than a shelter; holding place not stated |
| Elk River Police Department | police-sheriff | Elk River | https://search.211unitedway.org/search/03eff6c1-6d44-508f-bad6-746dd408a632 | none | unknown | found | unsure | 211 listing for law enforcement; no stray or impound details found; Tri-County lists Sherburne sheriff as a contact |
| Princeton Police Department (MN) | police-sheriff | Princeton | https://www.cbsnews.com/minnesota/news/dogs-stolen-coffee-shop | none | unknown | found | search | Held two recovered dogs for return; no list |
| Sauk Rapids Police Department | police-sheriff | Sauk Rapids | https://tricountyhumanesociety.org/pet-resources/lost-a-pet.html | none | unknown | found | unsure | Listed on Tri-County lost-pet page as a contact; that URL gave 404 on fetch but appeared in search |
| St. Joseph (MN) Police Department | police-sheriff | St. Joseph | https://search.211unitedway.org/search/7cfb6740-98fd-5e79-8cd6-6939e1980bbd | none | unknown | found | search | A 211 listing says the police department provides animal control and licences; page not opened; no public list |
| Stearns County Sheriff (county bulletins) | police-sheriff | Stearns County | https://content.govdelivery.com/accounts/STEARNS/bulletins/13858d0 | own site | no | found | seen | Occasional found-dog items via county bulletin; the county sometimes houses dogs itself; no standing list |
| Todd County Sheriff's Office | police-sheriff | Todd County (Long Prairie, Staples) | https://toddcountymn.gov/government/departments/sheriff/index.php | none | no | found, lost | seen | Sheriff pages opened 2nd pass: no animal control or lost-found info (dispatch, records, jail, permits only); enforces the county animal ordinance; where strays are held is unknown (a 211 listing names an unnamed shelter serving Crow Wing, Mille Lacs, Morrison and Todd) |
| Willmar Police Department animal regulations | police-sheriff | Willmar | https://willmarmn.gov/departments/willmar_police_department/animal_regulations.php | none | no | lost, found | search | Lost pet reports go to the police; points owners to Hawk Creek; running at large dogs may be impounded |
| Kathy's Animal Rescue Express (Milaca) | rescue | Mille Lacs County | https://www.adoptapet.com/shelter/78723 | Adopt-a-Pet | no | shelter-stray | search | Takes in stray, neglected and surrendered dogs per its listing; adoptable list only |
| Paws and Ears Animal Rescue and Sanctuary (Glencoe) | rescue | Glencoe area, McLeod County | https://adoptapet.com/shelter/124140-paws-and-ears-animal-rescue-and-sanctuary-glencoe | Adopt-a-Pet | no | shelter-stray | search | Volunteer group; not a city pound |
| Ruff Start Rescue (Princeton) | rescue | Benton, Isanti, Mille Lacs, Sherburne | https://search.211unitedway.org/search/ab929d66-f304-5150-b623-ff8d760b6929 | Petfinder | no | shelter-stray | search | Foster rescue; adoptable dogs, not a city pound; Petfinder id MN300 seen in search |
| Crossroads Animal Shelter and Community Veterinary Clinic (Buffalo) | shelter | Buffalo, Wright County | http://crossroadsshelter.org/ | own site | no | found | seen | Site home opened 2nd pass: pages named ./straypet and ./services (not opened, 3-page cap reached with the radio item); no platform or Facebook link; radio item https://krwc1360.com/?p=45181 says it does not impound strays; Adopt-a-Pet listing https://www.adoptapet.com/adoption_rescue/64218 |
| Heart of Minnesota Animal Shelter of McLeod County (Hutchinson) | shelter | Hutchinson and nearby communities, McLeod County | https://www.heartofminnesota.org/lost-found-animals | Petfinder | no | shelter-stray, found, lost | seen | Lost-found-animals resource page, no list of held dogs; adoptable animals at /available-pets (Petfinder id MN79); strays held 5 days then adoption; takes stray intake by appointment; says Hutchinson city impound is run by Animal Medical Center, not the shelter |
| Isanti County Humane Society (Cambridge) | shelter | Isanti County | https://pets.thecountyoffice.com/animal-shelter/isanti-county-humane-society-399959/ | unknown | unknown | shelter-stray | unsure | Third-party directory only; one map listing shows it closed; no own site or found list seen; may not be operating |
| Morrison County Animal Humane Society (Little Falls) | shelter | Little Falls and contracting cities and townships in Morrison County | https://www.adoptapet.com/shelter/77267-morrison-county-animal-humane-society-little-falls-minnesota | Adopt-a-Pet | no | shelter-stray, found | seen | Adopt-a-Pet page opened 2nd pass: adoptable only, says it serves all of Morrison County, shows no own website or Facebook, no strays or contracted cities; also on Petfinder id MN19 (https://www.petfinder.com/member/us/mn/little-falls/morrison-county-animal-humane-society-mn19/, not opened); impound agreements and 5 day period from pass-1 search |
| Tri-County Humane Society (St. Cloud) | shelter | Stearns, Benton, Sherburne and neighbours | https://tricountyhumanesociety.org/lost-found/ | own site | no | shelter-stray, found, lost | seen | Main stray intake for the St. Cloud area; 5 business day hold; strays labelled on adoption listings (Petfinder id MN52 seen in search); lost-found page itself lists no dogs; report forms at /found-a-pet/ and /report-a-lost-pet/ |
| Tri-County Humane Society report a lost pet | shelter | Stearns, Benton, Sherburne | https://tricountyhumanesociety.org/report-a-lost-pet/ | own site | no | lost | search | Form-style page, page not opened; also names city and sheriff contacts |

### South-east Minnesota

52 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Albert Lea and Humane Society partnership | city-program | Albert Lea | https://cityofalbertlea.org/?p=3795 | own site | no | shelter-stray | search | News item on the partnership |
| Cannon Falls dog pound code | city-program | Cannon Falls | https://codelibrary.amlegal.com/codes/cannonfalls/latest/cannonfalls_mn/0-0-0-2096 | none | no | shelter-stray | search | Dogs at large go to a pound, city-run or vendor; vendor not named |
| City of Albert Lea Animal Control | city-program | Albert Lea | https://www.cityofalbertlea.org/?p=36591 | own site | no | shelter-stray,found | seen | Contracts the humane society; lost or found pets reported to police; no list on page |
| City of Austin animal shelter | city-program | Austin | https://www.ci.austin.mn.us/?p=4505 | own site | no | shelter-stray | seen | City shelter next to the humane society; no impound or lost-found list on page |
| City of Hokah animal control | city-program | Hokah | https://www.cityofhokah-mn.gov/departments/animal-control/ | own site | no | found | seen | Complaints go to Houston County dispatch; no stray holding place or lost-and-found page |
| City of La Crescent Pet Licensing | city-program | La Crescent | https://www.cityoflacrescent-mn.gov/?p=3496 | own site | no | found | search | Finders told to call police; no list seen |
| City of Le Sueur animal control FAQ | city-program | Le Sueur | https://cityoflesueur.com/m/faq?cat=20 | own site | no | shelter-stray | seen | Says the city works with Minnesota Critter Getter; page does not mention stray dogs or lost and found |
| City of Red Wing animal impound | city-program | Red Wing | https://rbhspets.org/services/ | own site | no | shelter-stray | seen | Holder's page: River Bluff holds Red Wing strays by contract; city's own page not found |
| City of Winona Animal Control | city-program | Winona | https://www.winonamn.gov/267/Animal-Control | own site | no | shelter-stray | seen | Officer in police department; no holding place or found list stated; non-emergency dispatch |
| Kasson animal ordinance and registration | city-program | Kasson | https://www.cityofkasson.gov/departments/police_department/animals/ordinance_and_registration.php | own site | no | found | search | No impound contract; finders often hold dogs; police station sometimes |
| Owatonna Animal Control | city-program | Owatonna | https://owatonna.gov/188/Animal-Control | own site | no | shelter-stray | search | Community service officers; fees listed; holding place not stated |
| Rochester Animal Control (Adopt-a-Pet) | city-program | Rochester | https://www.adoptapet.com/shelter/67552 | Adopt-a-Pet | no | shelter-stray | search | Adoptable animals; may be stale |
| Rochester Animal Control and Licenses | city-program | Rochester | https://rochestermn.gov/home-property-utilities/animal-control-licenses/ | own site | no | shelter-stray | seen | New exact page (registry has Rochester home page only). No impound list; stray dogs reported to dispatch; city shelter by appointment |
| Dodge County services | county-program | Dodge County | https://dodgecountymn.gov/services/ | own site | no | found | search | Home-level only; no stray page found |
| Goodhue County Regulated Animals Ordinance | county-program | Goodhue County unincorporated | https://goodhuecountymn.gov/files/ordinances/regulated_animals_ordinances.pdf | PDF | no | shelter-stray | search | Ordinance only; no public list |
| PetRadar Rochester | directory | Rochester | https://www.petradar.org/en/lost-and-found-dogs/US/rochester | unknown | unknown | lost,found | search | Aggregator page |
| Lost and Found Pets Minnesota | facebook-group | Minnesota | https://www.facebook.com/groups/1214583558585910/ | Facebook | unknown | lost,found | search | linked from Winona Area Humane Society's page |
| Lost Pets in Winona | facebook-group | Winona | https://www.facebook.com/groups/1495292297427117 | Facebook | unknown | lost,found | search | linked from Winona Area Humane Society's page, not opened |
| City of Albert Lea Facebook | facebook-page | Albert Lea | http://www.facebook.com/cityofalbertlea | Facebook | unknown | found | search | General city page; link seen on animal control page |
| City of Austin Facebook | facebook-page | Austin | https://www.facebook.com/cityofaustinmn | Facebook | unknown | found | search | General city page; not shown to post lost pets |
| Humane Society of Freeborn County Facebook | facebook-page | Freeborn County | https://www.facebook.com/HS.Freeborn.Co/ | Facebook | unknown | shelter-stray,found | search | linked from the organisation's own site, not opened |
| La Crescent Animal Rescue Facebook | facebook-page | La Crescent | https://www.facebook.com/lacrescentanimalrescue1/ | Facebook | unknown | shelter-stray,found | search | linked from the organisation's own site, not opened |
| Lost Cats Minnesota | facebook-page | Minnesota | https://www.facebook.com/LostCatsMinnesota/ | Facebook | unknown | lost,found | search | linked from Winona Area Humane Society's page; cats, other researchers may hold it |
| Owatonna Animal Shelter Facebook | facebook-page | Owatonna | https://www.facebook.com/OwatonnaAnimalShelter?fref=ts | Facebook | unknown | shelter-stray,found | search | Linked from city page as animal control page; not opened |
| Paws and Claws Humane Society Facebook | facebook-page | Olmsted and nearby | https://www.facebook.com/pchsrochester | Facebook | unknown | found,lost | search | linked from the organisation's own site, not opened |
| Rochester Animal Control Facebook | facebook-page | Rochester | https://www.facebook.com/RochesterMNAnimalControl | Facebook | unknown | shelter-stray,found | search | Link seen on city page, not opened; whether it posts found dogs unverified |
| Winona Area Humane Society Facebook | facebook-page | Winona County | https://www.facebook.com/winonaareahumanesociety | Facebook | unknown | found,lost | search | linked from the organisation's own site, not opened |
| Canine Central (Waseca impound) | impound-contractor | Waseca city and county | https://www.southernminnesotanews.com/waseca-police-outline-new-policy-for-impounding-stray-cats/ | none | unknown | shelter-stray | search | Named as law enforcement's impound facility in a 2022 cat-policy article; no own URL found; no public list |
| Minnesota Critter Getter | impound-contractor | Le Sueur | http://www.mncrittergetter.com/ | own site | unknown | shelter-stray | search | linked from the City of Le Sueur FAQ; fetch failed (expired certificate), not retried; role in stray dogs unconfirmed |
| Lake City Graphic pet of the week | media | Lake City, Wabasha County | https://www.lakecitygraphic.com/node/10697 | own site | no | shelter-stray | search | Single profile showing sheriff routes strays to a shelter; no lost-and-found page found |
| Spring Valley kennel article | media | Spring Valley | https://fillmorecountyjournal.com/spring-valley-to-add-kennel/ | own site | no | shelter-stray | search | March 2022 council discussion of kennel for strays; outcome unknown |
| Lost Pet Network (petcolove) | national-db | national | https://lost.petcolove.org/ | unknown | unknown | lost,found | search | linked from Winona Area Humane Society's page |
| LostMyDoggie | national-db | national | https://lostmydoggie.com/ | unknown | unknown | lost,found | search | linked from Winona Area Humane Society's page |
| LostMyKitty | national-db | national | https://lostmykitty.com/ | unknown | unknown | lost,found | search | linked from Winona Area Humane Society's page; cats |
| PawBoost Austin lost dogs | national-db | Austin area | https://www.pawboost.com/lost-found-pets/austin-mn-55912/all-lost-dogs/page-1 | unknown | no | lost,found | search | Area page |
| PawBoost report and found forms | national-db | national | https://www.pawboost.com/?utm_source=shelter_referral&status=101 | PawBoost | no | found,lost | search | linked from Winona Area Humane Society's page; PawBoost already in registry |
| PawBoost Rochester lost dogs | national-db | Rochester area | https://www.pawboost.com/lost-found-pets/rochester-mn-55901/all-lost-dogs/page-1 | unknown | no | lost,found | search | Area page; PawBoost already in registry generically |
| Petkey Rochester | national-db | Rochester | https://petkey.org/Lost-And-Found/rochester_mn | unknown | no | lost,found | search | Listings seen dated 2020 and 2024; likely stale |
| Le Sueur County Sheriff | police-sheriff | Le Sueur County | https://www.lesueurcounty.gov/716/About-Us | own site | no | found | search | No animal control listed; county Facebook index at https://www.lesueurcounty.gov/facebook not read |
| Winona Police Department | police-sheriff | Winona | https://www.winonamn.gov/Directory.aspx?did=28 | own site | no | found | search | Directory entry lists animal control office; no found-dog list seen |
| Bentleys Outpost | rescue | Faribault | https://www.adoptapet.com/shelter/75166-bentleys-outpost-faribault-minnesota | Adopt-a-Pet | no | shelter-stray | unsure | No adoptable pets shown; may be inactive |
| La Crescent Animal Rescue | rescue | La Crescent | https://www.lacrescentanimalrescue.com/contact | own site | no | shelter-stray | seen | Shelters strays found in the city of La Crescent; report during hours, else city police; no lost-pet list; adoptables on own site (/cats, /dogs); also Adopt-a-Pet 77181 |
| S.A.F.E. Sanctuary | rescue | Faribault | https://www.adoptapet.com/shelter/79455 | Adopt-a-Pet | no | shelter-stray | search | Rescue listing; stray intake unconfirmed |
| Humane Society of Freeborn County | shelter | Albert Lea, Freeborn County | https://www.freeborncountyhs.org/adoption | Shelterluv | no | shelter-stray | seen | Own site has no stray, found or lost page; adoption forms link Shelterluv (https://www.shelterluv.com/matchme/adopt/HSFC/Dog), so listing platform is inferred; runs the city shelter by contract; also Adopt-a-Pet 69047 |
| Mower County Humane Society | shelter | Mower County | https://mchs.rescuegroups.org/ | RescueGroups | no | shelter-stray | seen | Own site on RescueGroups; adoptable animals under an Adoption Info menu; no lost or found page, no Facebook link; also Adopt-a-Pet 12088; 2015 article says dogs came from the city pound |
| Northfield Animal Shelter | shelter | Northfield | https://www.adoptapet.com/shelter/66724-northfield-animal-shelter-northfield-minnesota | Adopt-a-Pet | no | shelter-stray | search | Lists cats and dogs; may be same as Prairie's Edge or a separate listing (unsure) |
| Paws and Claws Humane Society | shelter | Olmsted, Dodge, Freeborn, Goodhue, Mower, Rice, Steele, Wabasha | http://www.pawsandclaws.org/found-dogs | own site | no | found,lost,shelter-stray | seen | Own site has Lost Dogs, Found Dogs, Lost Cats, Found Cats pages (relative links /found-dogs etc); the found-dogs page showed a heading but no list in the fetch (may load by script); adoptables are on Petango; also Adopt-a-Pet 81529; Petfinder profile https://www.petfinder.com/member/us/mn/rochester/paws-and-claws-humane-society-mn131/ not opened |
| Prairie's Edge Humane Society | shelter | Rice County | https://www.adoptapet.com/shelter/77601 | Adopt-a-Pet | no | shelter-stray | seen | Profile page opened; own site http://www.prairiesedgehs.org returned only the word Home to the fetch (script-built), nothing readable; strays and surrenders by appointment |
| River Bluff Humane Society | shelter | Red Wing, Goodhue County, Hastings MN, River Falls WI, some townships | https://rbhspets.org/services/ | own site | no | shelter-stray | seen | Own site (old address hsgcpets.org redirects here); services page describes impound contracts, 5-day stray hold in MN and how to reclaim; no list of strays; adoptables on own site https://rbhspets.org/adopt/; also Adopt-a-Pet 75372; Lake City likely nearest (unconfirmed) |
| Steele County Humane Society | shelter | Steele County outside Owatonna | https://www.adoptapet.com/shelter/4349 | Adopt-a-Pet | no | shelter-stray | seen | Profile opened and links own site http://www.steelecountyhumanesociety.org (fetch failed on DNS, not retried); no Facebook link on profile; foster homes only per May 2026 state listing |
| Waseca County Animal Humane Society | shelter | Waseca County, Le Sueur County | https://www.petfinder.com/member/us/mn/waseca/waseca-county-animal-humane-society-mn184/ | Petfinder | no | shelter-stray | search | refused: 403 on Petfinder profile in pass 2; not retried; foster-based, no shelter location; Le Sueur listed in 211 service area (Oct 2024) |
| Winona Area Humane Society | shelter | Winona County | https://winonahumane.org/lostandfoundpets | own site | no | found,lost,shelter-stray | seen | Page is instructions plus links, no list of found animals ("No results found"); site also has /reclaims, /dogs and /cats on its own site (no outside platform); no cities named |

### South-central and south-west Minnesota

31 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| City of Dawson animal services | city-program | Dawson, Lac qui Parle County | https://dawsonmn.municipalimpact.com/animal-services | own site | no | shelter-stray | search | Police department handles strays and impounds. Holding place not seen. Second-pass fetch failed (HTTP 521), not retried. |
| City of Fairmont animal control | city-program | Fairmont | https://fairmont.org/?p=9420 | none | no | shelter-stray | seen | Report strays to the police department by phone; strays boarded at the humane society. No found list. |
| City of Mankato animal control | city-program | Mankato | https://www.petfinder.com/member/us/mn/mankato/blue-earth-nicollet-county-humane-society-mn133/ | Petfinder | no | shelter-stray | search | No city page seen; strays go to BENCHS under contract. URL is the contractor's. |
| City of North Mankato animal control | city-program | North Mankato | https://www.petfinder.com/member/us/mn/mankato/blue-earth-nicollet-county-humane-society-mn133/ | Petfinder | no | shelter-stray | search | No city page seen; BENCHS contract. URL is the contractor's. |
| City of Springfield animal code | city-program | Springfield | https://springfieldmn.org/?p=19535 | none | no | shelter-stray | seen | City code chapter: police impound, pound at a place set by council resolution; unclaimed animals may go to the Brown County Humane Society. No list or links. |
| New Ulm Animal Control (police department) | city-program | New Ulm | https://www.newulmmn.gov/235/Animal-Control | own site | no | shelter-stray | seen | City pound for animals found inside city limits. No list on page; found animals posted on the police Facebook page. Fee and hold details from 2018 and 2021 columns may be out of date. |
| Worthington Police animal control | city-program | Worthington and surrounding area | https://www.worthingtonmn.gov/Departments/Police-Department/Special-Units/Animal-Control | none | no | shelter-stray | seen | Animal control officer under police. Page names no holding place or found list. |
| Petkey lost and found Mankato | classifieds | Mankato | https://petkey.org/lost-and-found/mankato_mn | own site | no | lost, found | search | Newest entries from April 2021; looks stale. |
| Jackson County Sheriff animal control | county-program | Jackson County | https://www.jacksoncountyso.com/animal-control | own site | no | shelter-stray | unsure | Search result; may belong to a different Jackson County. Not opened. |
| No Kill Network lost and found Minnesota | directory | Minnesota | https://nokillnetwork.org/lostandfound/minnesota/?page=5 | own site | no | lost, found | search | Statewide, tripped over; another researcher likely has it. |
| Friends of the Animal Shelter (Redwood Area Animal Shelter Facebook) | facebook-page | Redwood Falls | https://www.facebook.com/thefriendsoftheanimalshelter/ | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| K9 Rescue of Faribault County Facebook | facebook-page | Faribault County | https://www.facebook.com/k9rescueoffaribaultcounty | Facebook | unknown | found | search | linked from the organisation's own site, not opened |
| New Ulm Police Department Facebook page | facebook-page | New Ulm | https://www.facebook.com/NewUlmPoliceDepartment | Facebook | unknown | found | search | URL taken from the city page; Facebook not opened. |
| Windom radio (Jackson County Sheriff weekly report PDF) | media | Jackson County | https://windomradio.com/wp-content/uploads/2026/05/Jackson-County-Sheriffs-Office-Report-May-11th-to-May-14th-.pdf | PDF | no | found | unsure | Radio site hosts sheriff activity reports as PDFs. Fetched, but the PDF text could not be decoded, so whether it mentions found animals is unknown. |
| Fairmont Police Department | police-sheriff | Fairmont | https://fairmontpolice.org/ | own site | no | found | seen | Home page only; linked from the city page. No found-dog page seen. |
| Cottonwood County Animal Rescue | rescue | Cottonwood County, Windom | https://www.petfinder.com/member/us/mn/windom/cottonwood-county-animal-rescue-mn384 | Petfinder | no | shelter-stray | search | Foster-based, no building. Lists stray dogs for adoption; no found list seen. Petfinder profile refused in pass 2: 403; own site not reached. |
| DarciDog Sanctuary | rescue | Jackson | https://www.adoptapet.com/shelter/267180 | Adopt-a-Pet | no | shelter-stray | unsure | Described as a rescue in Jackson, Minnesota; not verified. |
| Giles Dog Rescue | rescue | Pipestone, south-west Minnesota | https://adoptapet.com/shelter/79456-giles-dog-rescue-pipestone-minnesota | Adopt-a-Pet | no | shelter-stray | seen | Profile page read; links own site http://www.gilesdogrescue.com (DNS lookup failed, not read). No Facebook link on profile. Takes strays and surrenders; no municipal contract seen. |
| Hope For Homes Animal Rescue | rescue | Mankato, North Mankato, Eagle Lake, Madelia, Lake Crystal, Madison Lake | https://adoptapet.com/adoption_rescue/100855-hope-for-homes-animal-rescue-lake-crystal-minnesota | Adopt-a-Pet | no | shelter-stray | search | Adoption rescue based in Lake Crystal; not a pound. |
| K9 Rescue of Faribault County | rescue | Mountain Lake, Winnebago, Blue Earth (Faribault County) | http://caninerescueoffaribaultcounty.weebly.com/ | Petfinder | no | shelter-stray | seen | Foster-based dog rescue; lists available dogs on Petfinder only, no found or lost page. Adopt-a-Pet profile: https://www.adoptapet.com/shelter/105975 |
| K9 Rescue of Faribault County Petfinder | rescue | Faribault County | https://www.petfinder.com/member/us/mn/winnebago/k9-rescue-of-faribault-county-mn338/ | Petfinder | no | shelter-stray | search | linked from the organisation's page; adoptable animals only. |
| Blue Earth Nicollet County Humane Society (BENCHS) | shelter | Mankato, North Mankato, Blue Earth and Nicollet counties | https://www.petfinder.com/member/us/mn/mankato/blue-earth-nicollet-county-humane-society-mn133/ | Petfinder | no | shelter-stray | search | Petfinder profile refused in pass 2: 403, so own site not reached. City contract since 2020 for Mankato and North Mankato. Petfinder lists adoptable animals; no separate stray list seen. Own website not seen. |
| Brown County Humane Society | shelter | Brown County (animals found outside New Ulm; unclaimed pound animals) | http://www.bchsnu.com/ | unknown | unknown | shelter-stray | seen | Own site (linked from the directory page); fetch returned only the site title, so no list or links were visible. Home page only. No Facebook link on the directory page. |
| Faribault County Humane Society (New Chances Humane Society) | shelter | Blue Earth, Faribault County | https://www.nokillnetwork.org/d/Minnesota/Faribault-County-Humane-Society-(FCHS | unknown | unknown | shelter-stray | seen | Directory page lists own site fchs-mn.org, but that domain now redirects (301) to an unrelated domain, so the site is gone or hijacked and was not followed. Petfinder profile (https://www.petfinder.com/shelters/MN262.html) refused: 403. Activity unknown. |
| Hawk Creek Animal Shelter | shelter | Renville and Lac qui Parle area (unconfirmed) | https://www.petfinder.com/shelters/MN54.html | Petfinder | no | shelter-stray | unsure | Surfaced in Renville and Lac qui Parle searches; location and service area not confirmed. |
| Humane Society of Renville and Sibley Counties | shelter | Renville and Sibley counties (Gibbon) | https://adoptapet.com/shelter/76567-humane-society-of-renvillesibley-counties-gibbon-minnesota | Adopt-a-Pet | no | shelter-stray | search | Says it helps locate owners of lost pets; fee to drop off animals. Gibbon is outside my counties, so the Renville link is by name only. |
| Jackson County Animal Protection Society | shelter | Jackson, Jackson County | https://www.petfinder.com/member/us/mn/jackson/jackson-county-animal-protection-society-mn483/ | Petfinder | no | shelter-stray | search | Petfinder profile only; activity unknown. |
| Martin County Humane Society | shelter | Martin County, Fairmont | https://adoptapet.com/shelter/69524-martin-county-humane-society-fairmont-minnesota | Adopt-a-Pet | no | shelter-stray | seen | Profile page read: no own website or Facebook linked. Holds Fairmont strays. Nov 2024 report: overcrowded, not taking strays. Current status unknown. |
| Redwood Area Animal Shelter (Duke Memorial Animal Shelter) | shelter | Redwood Falls, Redwood County, Olivia, Hector | https://www.redwoodareaanimalshelter.org/ | Shelterluv | no | shelter-stray | seen | Own site; the same Adopt-a-Pet profile links it, so the two names are one shelter. Site has no found or stray page and names no cities; adoption applications go to Shelterluv (organisation id DMRA), adoptable animals only. Adopt-a-Pet profile: https://adoptapet.com/shelter/84395-duke-memorial-animal-shelter-redwood-falls-minnesota |
| Redwood Area Animal Shelter Shelterluv dog list | shelter | Redwood Falls | https://new.shelterluv.com/matchme/adopt/DMRA/Dog | Shelterluv | no | shelter-stray | search | linked from the organisation's page; adoption application page, adoptable animals only. |
| Watonwan County Humane Society | shelter | St. James, Watonwan County | https://adoptapet.com/shelter/68850-watonwan-county-humane-society-st-james-minnesota | Adopt-a-Pet | no | shelter-stray | seen | Profile page read: lists own site (http://www.watonwan.weebly.com, SSL handshake failed, not read) and adoption application page on that site. Volunteer run; has held St. James strays. City moved to evict it (undated Fox 9 report). No Facebook link on profile. Adoptable animals only on profile. |

### Facebook: statewide and the metro

10 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| City of Minneapolis | facebook-page | Minneapolis | https://www.facebook.com/cityofminneapolis | Facebook | unknown | lost, found | unsure | General city page linked from the lost-pet page; unknown whether it posts found dogs; general page |
| Duluth, MN - Lost Dogs, Cats and Pets - PawBoost | facebook-page | Duluth (outside assignment) | https://www.facebook.com/LostPetsDuluthMN/ | Facebook | unknown | lost, found | search | Outside assignment; PawBoost-run page |
| Lost Cats MN (older page URL) | facebook-page | Minnesota | https://www.facebook.com/LostCatsMN | Facebook | unknown | lost, found | unsure | Cats only; old-style URL from an aged Patch guide; may be dead |
| Lost Dogs MN (older page URL) | facebook-page | Minnesota | https://www.facebook.com/?ref=logo#!/pages/Lost-Dogs-MN/337436468302 | Facebook | unknown | lost, found | unsure | Old-style URL from an aged Patch guide; may be a legacy page, or dead; likely superseded by LDoMN |
| Lost Pets - SW Minnesota | facebook-page | Southwest Minnesota (outside assignment) | https://www.facebook.com/LostPetsSwMinnesota/ | Facebook | unknown | lost, found | search | Outside assignment; based in Worthington |
| Mille Lacs County Animal Care and Protection | facebook-page | Mille Lacs County (outside assignment) | https://www.facebook.com/millelacscountyanimalcontrol/ | Facebook | unknown | shelter-stray, found | search | Outside assignment; page for lost and stray dogs picked up in the county |
| Minneapolis, MN - Lost Dogs, Cats and Pets - PawBoost | facebook-page | Minneapolis | https://www.facebook.com/LostPetsMinneapolisMN/ | Facebook | unknown | lost, found | search | PawBoost-run page that shares reports made on PawBoost; PawBoost itself already in registry |
| Rochester, MN - Lost Dogs, Cats and Pets - PawBoost | facebook-page | Rochester (outside assignment) | https://www.facebook.com/LostPetsRochesterMN/ | Facebook | unknown | lost, found | search | Outside assignment; PawBoost-run page; showed about 4,380 likes |
| Minnetonka Police Department lost and found pet dashboard | police-sheriff | Minnetonka | https://mtka.maps.arcgis.com | other | unknown | shelter-stray, lost, found | search | ArcGIS dashboard with impounded and lost and found tabs; entries expire after 7 days; home page only (the exact dashboard path was not seen); not Facebook, a new non-registry place |
| Lost K9 | volunteer-team | Minnesota (based in Cottage Grove) | https://www.facebook.com/LostK9team/ | Facebook | unknown | lost, found, sighting | search | All-volunteer 501(c)(3) lost-dog reunification nonprofit; posts lost dog reports; Washington County based |

### National databases, apps and microchip registries

29 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FidoAlert and TabbyAlert | app | national | https://www.fidoalert.com/tabby | own site | yes | lost | seen | Free text-message alert network with QR tags and phone sign-in; TabbyAlert is now FidoAlert; no public browse |
| Ring Neighbors and Search Party | app | national | https://ring.com/search-party | app | yes | lost, sighting | seen | Lost-dog posts visible to nearby neighbours in the app; AI camera matching; no public web view documented; shares to Petco Love Lost |
| Minneapolis find a lost pet | city-program | Minneapolis | https://www.minneapolismn.gov/resident-services/animals-pets/find-lost-pet | own site | no | lost, found, shelter-stray | search | City guidance plus a found-animal form that emails finders on a match; a data dashboard exists at https://minneapolismn.gov/government/government-data/datasource/macc-dashboard/ ; tripped over |
| Animal Help Now | directory | national | http://ahnow.org/ | own site | unknown | lost | seen | animalhelpnow.org redirects here; home page showed helper login, apps and fundraising, not a lost-and-found list; home page only |
| Lost Dogs MN (Facebook page) | facebook-page | Minnesota | http://www.facebook.com/pages/Lost-Dogs-MN/337436468302 | Facebook | unknown | lost, found, sighting | search | URL taken from the Lost Dogs of America page; old-style Facebook address, may redirect; already in registry as an entry with no real URL |
| 24Petwatch (on PetPlace) | microchip-registry | national | https://petplace.com/pet-microchip-registry | own site | yes | lost, found | seen | Report-lost-or-found link; 24Petwatch search is by specialists, no public list; the old 24petwatch.com report URL redirects here |
| AAHA Universal Pet Microchip Lookup | microchip-registry | national | https://aaha.org/petmicrochiplookup | own site | no | lost | search | Lookup only, not a registry; names which registry holds a chip; page returned 403 so not opened |
| AKC Reunite Lost Pet Alert | microchip-registry | national | https://www.akcreunite.org/alert/ | own site | unknown | lost | search | Paid add-on that emails a nationwide network of shelters, rescues and vets; no public list seen; page content came back truncated |
| Found Animals Registry | microchip-registry | national | https://www.foundanimals.org | own site | unknown | lost | seen | Bought by 24Petwatch, accessed via my24pet.com; no lost list mentioned |
| HomeAgain | microchip-registry | national | https://www.homeagain.com/ | own site | unknown | lost, found | search | Registry with paid Premium lost-pet alerts and posters; per Pet FBI anyone can register a lost pet and search; not opened |
| Lost My Pet | microchip-registry | national | https://www.lostmypet.com | unknown | unknown | lost, found | unsure | refused: 403; listed as an AAHA lookup participant |
| Petkey (microchip registry) | microchip-registry | national | https://petkey.org/register-homeagain-microchip/ | own site | yes | lost, found | search | Registers chips from any brand including HomeAgain; participates in AAHA lookup; lost listing needs registration |
| PetLink lost pet gallery | microchip-registry | national | https://petlink.net/lost-pet-gallery | own site | unknown | lost | unsure | refused: 403; title suggests a public gallery; PetLink lookup at https://www.petlink.net/microchip-search/ was also refused |
| FidoFinder | national-db | national | https://www.fidofinder.com/pet/search | own site | unknown | lost, found | seen | City pages only for about 20 big cities, none seen for Minnesota; general search; sign-in; paid visibility extras; shelter registration; no API |
| Helping Lost Pets | national-db | national | https://www.helpinglostpets.com | Pet FBI | unknown | lost, found | seen | Redirects to petfbi.org; merged into Pet FBI, do not chase separately; older Lost Dogs MN posts used helpinglostpets.com/LDMN |
| Lost Dogs of America | national-db | national | https://lostdogsofamerica.org/lost-dog/ | Facebook | unknown | lost, found | seen | Run with Pet FBI; volunteers post to a Facebook page per state; found form at https://lostdogsofamerica.org/found-dog/; no on-site browse, no API |
| nØkill Network lost and found, Minneapolis | national-db | Minneapolis | https://nokillnetwork.org/lostandfound/minnesota/minneapolis | own site | no | lost, found | seen | City page under the Minnesota page; other city pages likely follow the same pattern but were not seen |
| nØkill Network lost and found, Minnesota | national-db | Minnesota | https://nokillnetwork.org/lostandfound/minnesota/ | own site | no | lost, found | seen | Filters by city, status and species; run by NK Animal Advocates; data source not named; shows a back-home count |
| Pet Alert Minneapolis | national-db | Minneapolis | https://www.petalertglobal.com/us/pet-alert/ville/minneapolis-us-mn | own site | unknown | lost, found | search | Only Minneapolis has a city page; Saint Paul, Coon Rapids, Burnsville and Lakeville only link to the state search; URL taken from a page link, not opened |
| Pet Alert Minnesota | national-db | Minnesota | https://www.petalertglobal.com/us/petalert-mn-minnesota | own site | unknown | lost, found | seen | User-submitted alerts; regional pages look auto-generated and repetitive; operator not named; partners page is a placeholder |
| Pet Radar Minneapolis | national-db | Minneapolis, Saint Paul | https://www.petradar.org/en/lost-and-found-dogs/us/minneapolis | own site | unknown | lost, found | seen | Dogs and All filters; links to a Saint Paul page; no API or feed mentioned |
| PetAmberAlert | national-db | national | https://www.petamberalert.com/view-lost-pets/ | own site | unknown | lost, found | seen | Public lost list and ZIP or town search, by-city page at /lost-and-found-pets/; paid alerts; state filter not confirmed |
| Petkey lost and found, Minnesota index | national-db | Minnesota | https://petkey.org/recovery/lostpetindex/mn | own site | no | lost, found | seen | State index; city pages follow https://petkey.org/lost-and-found/applevalley_mn style and mix lost, found, vets and shelters; no API seen |
| Tabby Tracker | national-db | national | https://www.tabbytracker.com/ | unknown | unknown | lost, found | unsure | Named by Pet FBI as like Fido Finder; fetch returned 404 so likely defunct |
| The Center for Lost Pets | national-db | national | http://thecenterforlostpets.org/ | unknown | unknown | lost, found | unsure | Pet FBI says free dogs-and-cats database; address from Pet FBI page; not opened (a fetch of the .com failed) |
| Missing Animal Response Network | other | national | https://www.missinganimalresponse.com | own site | no | lost | seen | Training site with a Pet Detective Directory; no public list of lost pets; no Minnesota page |
| nØkill Network API | platform | national | https://nokillnetwork.org/developers | own site | unknown | lost, found | seen | Documented free read-only API with lost and found reports of the last 6 months by ZIP, no owner contact data; condition is linking back to the Network page; MCP endpoint also offered; terms page not read |
| Eden Prairie lost and found pets | police-sheriff | Eden Prairie | https://www.edenprairiemn.gov/city-government/departments/police-department/regulations-and-enforcement/animal-control/lost-and-found-pets | own site | unknown | lost, found | search | Police animal-control page; tripped over, not opened |
| Minnetonka Police lost and found pets dashboard | police-sheriff | Minnetonka | https://minnetonkamn.gov/government/departments/police-department/services/animal-control | own site | no | lost, found, shelter-stray | search | Online dashboard with a map, entries kept seven days and an impounded-animals tab; earlier tool ran through Foundrop; live dashboard URL not found; another researcher may hold it |

### Classifieds, community boards, media and search teams

53 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chanhassen lost and found animals | city-program | Chanhassen | https://chanhassenmn.gov/departments/public-safety/law-enforcement/animal-control/lost-found-animals | none | no | shelter-stray,found | seen | reports via Carver County dispatch; dogs impounded at 4 Paws Animal Control, Shakopee (no own URL seen) |
| City of Hastings lost and found pets | city-program | Hastings | https://www.hastingsmn.gov/home-living/animals-and-pets/lost-and-found-pets/ | none | no | shelter-stray,found | seen | no online list; reports via dispatch; found animals go to River Bluff Humane Society |
| Eden Prairie lost and found pets | city-program | Eden Prairie | https://www.edenprairiemn.gov/city-government/departments/police-department/regulations-and-enforcement/animal-control/lost-and-found-pets | none | no | lost,found | search | police lost file; unclaimed animals go to Bloomington shelter; fetch refused: 403 |
| Minneapolis Animal Care and Control found by residents (dogs) | city-program | Minneapolis | https://24petconnect.com/MACCFoundPets?at=DOG | 24PetConnect | no | found | search | strays found by residents in the last 30 days, held at finders' homes; linked from Minneapolis' page, not opened |
| Minneapolis lost pet recovery | city-program | Minneapolis | https://www.minneapolismn.gov/resident-services/animals-pets/find-lost-pet/lost-pet-recovery/ | own site | unknown | lost | search | recovery tips page |
| West St. Paul Animal Control Services | city-program | West St. Paul | http://www.wspmn.gov/645/Animal-Control-Services | own site | unknown | shelter-stray | search | impounded animals section; linked from West St. Paul's page, fetch rate-limited |
| West St. Paul lost and found pets | city-program | West St. Paul | https://wspmn.gov/389/Lost-Found-Pets | own site | no | found,lost | seen | links animal control page and several boards; no list of its own |
| Craigslist Anoka / Chisago / Isanti sub-area | classifieds | Anoka, Chisago, Isanti counties | https://www.craigslist.org/subarea/ank | own site | no | lost,found | seen | sub-area page only |
| Craigslist Bemidji lost and found | classifieds | Bemidji area | https://www.craigslist.org/search/area/bemidji?cat=laf | own site | no | lost,found,sighting | seen | linked as a relative path on the area page |
| Craigslist Bemidji pets | classifieds | Bemidji area | https://www.craigslist.org/search/area/bemidji?cat=pet | own site | no | lost,found | seen | linked as a relative path on the area page |
| Craigslist Brainerd lost and found | classifieds | Brainerd area | https://www.craigslist.org/search/area/brainerd?cat=laf | own site | no | lost,found,sighting | seen |  |
| Craigslist Brainerd pets | classifieds | Brainerd area | https://www.craigslist.org/search/area/brainerd?cat=pet | own site | no | lost,found | seen |  |
| Craigslist Carver / Sherburne / Wright sub-area | classifieds | Carver, Sherburne, Wright counties | https://www.craigslist.org/subarea/csw | own site | no | lost,found | seen | sub-area page only |
| Craigslist Dakota / Scott sub-area | classifieds | Dakota and Scott counties | https://www.craigslist.org/subarea/dak | own site | no | lost,found | seen | sub-area page only |
| Craigslist Duluth / Superior lost and found | classifieds | Duluth, Superior WI | https://www.craigslist.org/search/area/duluth?cat=laf | own site | no | lost,found,sighting | seen |  |
| Craigslist Duluth / Superior pets | classifieds | Duluth, Superior WI | https://www.craigslist.org/search/area/duluth?cat=pet | own site | no | lost,found | seen |  |
| Craigslist Eau Claire lost and found | classifieds | Eau Claire WI and nearby MN | https://www.craigslist.org/search/area/eauclaire?cat=laf | own site | no | lost,found,sighting | seen | border area |
| Craigslist Eau Claire pets | classifieds | Eau Claire WI and nearby MN | https://www.craigslist.org/search/area/eauclaire?cat=pet | own site | no | lost,found | seen | border area |
| Craigslist Fargo / Moorhead lost and found | classifieds | Fargo, Moorhead | https://www.craigslist.org/search/area/fargo?cat=laf | own site | no | lost,found,sighting | seen | border area |
| Craigslist Fargo / Moorhead pets | classifieds | Fargo, Moorhead | https://www.craigslist.org/search/area/fargo?cat=pet | own site | no | lost,found | seen | border area |
| Craigslist Grand Forks lost and found | classifieds | Grand Forks, East Grand Forks | https://www.craigslist.org/search/area/grandforks?cat=laf | own site | no | lost,found,sighting | seen | border area; relative path on the area page |
| Craigslist Grand Forks pets | classifieds | Grand Forks, East Grand Forks | https://www.craigslist.org/search/area/grandforks?cat=pet | own site | no | lost,found | seen | border area; relative path on the area page |
| Craigslist Hennepin County sub-area | classifieds | Hennepin County | https://www.craigslist.org/subarea/hnp | own site | no | lost,found | seen | sub-area page only, not opened in pass 2 |
| Craigslist La Crosse lost and found | classifieds | La Crosse WI and SE Minnesota | https://www.craigslist.org/search/area/lacrosse?cat=laf | own site | no | lost,found,sighting | seen | border area |
| Craigslist La Crosse pets | classifieds | La Crosse WI and SE Minnesota | https://www.craigslist.org/search/area/lacrosse?cat=pet | own site | no | lost,found | seen | border area |
| Craigslist Mankato lost and found | classifieds | Mankato area | https://www.craigslist.org/search/area/mankato?cat=laf | own site | no | lost,found,sighting | seen |  |
| Craigslist Mankato pets | classifieds | Mankato area | https://www.craigslist.org/search/area/mankato?cat=pet | own site | no | lost,found | seen |  |
| Craigslist Mason City lost and found | classifieds | Mason City IA and S Minnesota | https://www.craigslist.org/search/area/masoncity?cat=laf | own site | no | lost,found,sighting | seen | border area |
| Craigslist Mason City pets | classifieds | Mason City IA and S Minnesota | https://www.craigslist.org/search/area/masoncity?cat=pet | own site | no | lost,found | seen | border area |
| Craigslist Minneapolis / St Paul lost and found | classifieds | Twin Cities | https://www.craigslist.org/search/area/minneapolis?cat=laf | own site | no | lost,found,sighting | seen | already in registry |
| Craigslist Minneapolis / St Paul pets | classifieds | Twin Cities | https://www.craigslist.org/search/area/minneapolis?cat=pet | own site | no | lost,found | seen | pets section |
| Craigslist Ramsey County sub-area | classifieds | Ramsey County | https://www.craigslist.org/subarea/ram | own site | no | lost,found | seen | sub-area page only |
| Craigslist Rochester MN lost and found | classifieds | Rochester area | https://www.craigslist.org/search/area/rmn?cat=laf | own site | no | lost,found,sighting | seen | area code rmn |
| Craigslist Rochester MN pets | classifieds | Rochester area | https://www.craigslist.org/search/area/rmn?cat=pet | own site | no | lost,found | seen | area code rmn |
| Craigslist Sioux Falls lost and found | classifieds | Sioux Falls SD and SW Minnesota | https://www.craigslist.org/search/area/siouxfalls?cat=laf | own site | no | lost,found,sighting | seen | border area |
| Craigslist Sioux Falls pets | classifieds | Sioux Falls SD and SW Minnesota | https://www.craigslist.org/search/area/siouxfalls?cat=pet | own site | no | lost,found | seen | border area |
| Craigslist Southwest MN lost and found | classifieds | Southwest Minnesota | https://www.craigslist.org/search/area/marshall?cat=laf | own site | no | lost,found,sighting | seen | area code marshall |
| Craigslist Southwest MN pets | classifieds | Southwest Minnesota | https://www.craigslist.org/search/area/marshall?cat=pet | own site | no | lost,found | seen | area code marshall |
| Craigslist St Cloud lost and found | classifieds | St Cloud area | https://www.craigslist.org/search/area/stcloud?cat=laf | own site | no | lost,found,sighting | seen |  |
| Craigslist St Cloud pets | classifieds | St Cloud area | https://www.craigslist.org/search/area/stcloud?cat=pet | own site | no | lost,found | seen |  |
| Craigslist Washington County / WI sub-area | classifieds | Washington County and nearby WI | https://www.craigslist.org/subarea/wsh | own site | no | lost,found | seen | sub-area page only |
| Hometown Source classifieds pets | classifieds | Twin Cities north and west suburbs and some regional papers | https://local.hometownsource.com/places/categories:47 | own site | no | lost,found | seen | no lost-and-found section; Pets Services category, mostly business and adoption ads; Pets Shopping is categories:27 |
| Patch Oakdale classifieds | classifieds | Oakdale and east metro | https://patch.com/minnesota/oakdale/classifieds | own site | no | lost,found | search | linked from Patch Oakdale; no lost-and-found section; other Minnesota Patch editions listed in notes above |
| In-Depth Outdoors forum | forum | Minnesota and upper Midwest hunters | https://www.in-depthoutdoors.com/community/forums/topic/huntinggen_713281/ | own site | unknown | lost | search | hunting forum; URL is a thread, board URL not seen |
| River Bluff Humane Society | impound-contractor | Hastings | https://rbhspets.org/ | own site | no | shelter-stray | seen | holds Hastings impounds; home page shows adoptables only, no lost or found list |
| KOOL 101.7 lost pet advice | media | Duluth area | https://kool1017.com/your-animal-is-missing-what-is-the-next-step-why-wont-the-radio-station-help/ | own site | no | none | seen | station says it does not air lost pets; advice page only, not a source |
| Patch Oakdale pets | media | Oakdale and east metro | https://patch.com/minnesota/oakdale/pets | own site | no | found,lost | seen | local news only, occasional found-dog article |
| WTIP Missing Pets in the Northland feature | media | Cook County and North Shore | https://wtip.org/features/missing-pets-in-the-northland/ | own site | no | lost,found | search | public radio feature page; not a report board |
| Brooklyn Park police PUPS | police-sheriff | Brooklyn Park | https://cbsnews.com/minnesota/news/brooklyn-park-police-need-help-reuniting-stray-dogs-with-their-owners | unknown | unknown | shelter-stray | search | police-run strays facility; own page not seen; city already in registry |
| Animal Ark No-Kill Shelter | shelter | Hastings and south metro | https://www.animalarkmn.org/ | unknown | unknown | shelter-stray,found | search | linked from West St. Paul's page, not opened |
| Animal Humane Society found pets search | shelter | Twin Cities metro | https://www.animalhumanesociety.org/search/found-pets | own site | no | found | search | linked from Minneapolis' page, not opened; the older node/2404 page returned 403 |
| Animal Humane Society lost and found bulletin board | shelter | Twin Cities metro | http://www.animalhumanesociety.org/lostandfound | own site | unknown | lost,found | search | linked from West St. Paul's page, not opened |
| The Retrievers | volunteer-team | Twin Cities and beyond | https://www.theretrievers.org/ | own site | no | lost | search | all-volunteer lost-dog team in St. Paul; URL linked from a KAAL story, site not opened (safety check rate-limited) |

### Statewide directories, tribal nations and border areas

1 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Minnesota Board of Animal Health | directory | Minnesota | https://www.bah.state.mn.us/ | unknown | unknown | shelter-stray | unsure | home page only; refused: bot check (Radware), so unknown whether a kennel or pound list exists; not retried |

### Shelter software platforms and the organisations on them

22 places.

| Name | Type | Area served | URL | Platform | Login | Kinds | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Minneapolis Animal Care and Control stray pets | city-program | Minneapolis | https://24petconnect.com/MACCStrayPets?at=CAT | 24PetConnect | no | shelter-stray | seen | already in registry; path /MACCStrayPets, at=CAT or DOG |
| Adopt-a-Pet Minnesota shelter directory | directory | Minnesota | https://www.adoptapet.com/animal-shelters/minnesota?page=1 | Adopt-a-Pet | no | - | seen | 5 pages of about 20; 96 shelters per snippet; adoptable pets |
| 24PetConnect | platform | national | https://www.24petconnect.com | 24PetConnect | no | shelter-stray, found, lost | seen | search by zip radius or specific shelters; Lost my pet and Found a pet menus; no API stated |
| Petco Love Lost partner API | platform | national | https://support.lost.petcolove.org/hc/en-us/articles/49905431814163-What-is-the-Petco-Love-Partner-API | none | unknown | lost, found | search | partner API for shelter software; Petco Love Lost already in registry |
| RescueGroups public API | platform | national | https://api.rescuegroups.org/v5/public/docs | RescueGroups | unknown | - | search | documented public REST API; adoptable data; not opened |
| Shelterluv | platform | national | https://www.shelterluv.com | Shelterluv | no | - | unsure | API needs shelter account key; no public stray feed found; URL not opened |
| Animal Ark | shelter | Hastings | https://www.adoptapet.com/shelter/82197-animal-ark-hastings-minnesota | Adopt-a-Pet | no | - | seen |  |
| Animal Humane Society, Coon Rapids | shelter | Anoka area | https://www.adoptapet.com/shelter/78195-animal-humane-society-coon-rapids-coon-rapids-minnesota | Adopt-a-Pet | no | - | seen |  |
| Animal Humane Society, Golden Valley | shelter | Twin Cities | https://www.adoptapet.com/shelter/77792-animal-humane-society-golden-valley-golden-valley-minnesota | Adopt-a-Pet | no | - | seen | AHS already in registry (home page only); own site 403 to me |
| Animal Humane Society, Woodbury | shelter | Washington area | https://www.adoptapet.com/shelter/78198-animal-humane-society-woodbury-woodbury-minnesota | Adopt-a-Pet | no | - | seen |  |
| Blue Earth Nicollet County Pet Shelter | shelter | Blue Earth, Nicollet | https://www.adoptapet.com/shelter/78493-blue-earth-nicollet-county-pet-shelterbenchs-mankato-minnesota | Adopt-a-Pet | no | - | seen |  |
| Carver-Scott Humane Society | shelter | Carver, Scott | https://www.adoptapet.com/shelter/76720-carver-scott-humane-society-chaska-minnesota | Adopt-a-Pet | no | - | seen | may take strays; unconfirmed |
| Duke Memorial Animal Shelter | shelter | Redwood Falls | https://www.adoptapet.com/shelter/84395-duke-memorial-animal-shelter-redwood-falls-minnesota | Shelterluv | no | - | search | listings link to Shelterluv MatchMe; stray list not seen |
| Humane Society Of Freeborn County | shelter | Freeborn | https://www.adoptapet.com/shelter/69047-humane-society-of-freeborn-county-albert-lea-minnesota | Adopt-a-Pet | no | - | seen |  |
| Humane Society Of Kandiyohi County | shelter | Kandiyohi | https://www.adoptapet.com/shelter/65493-humane-society-of-kandiyohi-county-willmar-minnesota | Adopt-a-Pet | no | - | seen |  |
| Humane Society of Otter Tail County | shelter | Otter Tail | https://www.petfinder.com/shelters/MN145.html | Petfinder | no | - | search |  |
| Lake County Humane Society | shelter | Two Harbors | https://twoharborsmn.gov/city_departments/animal_control/ | unknown | unknown | shelter-stray | search | animal control provider for Two Harbors; home page of city page only |
| Mower County Humane Society | shelter | Mower | https://www.adoptapet.com/shelter/12088-mower-county-humane-society-austin-minnesota | Adopt-a-Pet | no | - | seen |  |
| Paws And Claws Humane Society | shelter | Rochester area | https://www.adoptapet.com/shelter/81529-paws-and-claws-humane-society-rochester-minnesota | Adopt-a-Pet | no | - | seen |  |
| Pennington County Humane Society | shelter | Pennington | https://petfinder.com/member/us/mn/thief-river-falls/pennington-county-humane-society-mn102 | Petfinder | no | - | search |  |
| Prairie's Edge Humane Society | shelter | Northfield | https://www.adoptapet.com/shelter/77601-prairies-edge-humane-society-northfield-minnesota | Adopt-a-Pet | no | - | seen |  |
| Steele County Humane Society | shelter | Steele | https://www.adoptapet.com/shelter/232030-steele-county-humane-society-owatonna-minnesota | Adopt-a-Pet | no | - | seen |  |
