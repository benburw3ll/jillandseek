import type { SourceEntryInput } from '@jillandseek/core'

// The registry: every source Jill and Seek knows about, read or not (ADR-0002 point 6). Each entry
// says how it may be read and, where it was checked, what robots rules and terms said and when.
// Only checked facts go in `checkNote`; anything not checked says so. No person's name, and no
// group's member details, ever go here.

// What the robots files said on 2026-11-26 (#15), and what every link entry below has in common.
const ADMIN = 'Robots disallow only admin, search and event-view paths.'
const NO_ROBOTS = 'The site serves no robots file (404).'
const REFUSED = 'Its robots file answered a plain request with 403, so the site is not read.'
const CHALLENGE = 'Its robots file answered with a bot check (403), so the site is not read.'
const NO_LIST = 'Terms were not read, and no page listing impounded dogs was found, so it stays a link.'

function county(id: string, name: string, url: string, robots: string): SourceEntryInput {
  return {
    id,
    name: `${name} animal control and shelters`,
    url,
    region: name,
    listingKinds: ['shelter-stray'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: `${robots} ${NO_LIST}`,
    notes: 'The county site. Which page lists impounded dogs is not yet confirmed.',
  }
}

function city(id: string, name: string, url: string, robots: string): SourceEntryInput {
  return {
    id: `${id}-animal-control`,
    name: `${name} animal control`,
    url,
    region: name,
    listingKinds: ['shelter-stray'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: `${robots} ${NO_LIST}`,
    notes: 'The city site. Which page lists impounded dogs is not yet confirmed.',
  }
}

export const registryEntries: SourceEntryInput[] = [
  // The cities and shelters.
  {
    id: 'macc-strays',
    name: 'Minneapolis Animal Care and Control: stray dogs',
    url: 'https://24petconnect.com/MACCStrayPets?at=DOG',
    region: 'Minneapolis',
    listingKinds: ['shelter-stray'],
    access: 'automatic',
    collector: 'macc-strays',
    checkedOn: '2026-11-26',
    checkNote:
      '24petconnect.com serves no robots file (404). Its terms of use (the PDF linked from the page, revised April 2017) allow downloading material for personal, non-commercial use and forbid use that could damage or impair the site; they say nothing against automated reading. The list page answered a plain request with no bot check and is titled "Stray Pets at MACC". Read at most once every 30 minutes, the list page only.',
    notes:
      "The stray list on 24PetConnect. On 2026-11-26 the page showed one tab, the strays, and no list of residents' found dogs.",
  },
  {
    id: 'animal-humane-society',
    name: 'Animal Humane Society',
    url: 'https://www.animalhumanesociety.org/',
    region: 'Twin Cities metro',
    listingKinds: ['shelter-stray', 'found', 'lost'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote:
      'Robots allow the generic agent and block a list of named crawlers. Its lost-and-found page answered a plain fetch with 403 (ADR-0002), so it is not read.',
  },
  {
    id: 'saint-paul-animal-control',
    name: 'Saint Paul Animal Care and Control',
    url: 'https://www.stpaul.gov/',
    region: 'Saint Paul',
    listingKinds: ['shelter-stray'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: `Robots allow the generic agent (rules list only theme files). ${NO_LIST}`,
    notes: 'The city site. The page that lists impounded dogs is not yet confirmed.',
  },

  // The seven metro counties (robots read on 2026-11-26, #15).
  county('anoka-county', 'Anoka County', 'https://www.anokacountymn.gov/', ADMIN),
  county('carver-county', 'Carver County', 'https://www.carvercountymn.gov/', REFUSED),
  county('dakota-county', 'Dakota County', 'https://www.co.dakota.mn.us/', NO_ROBOTS),
  county(
    'hennepin-county',
    'Hennepin County',
    'https://www.hennepincounty.gov/',
    'The old domain redirects here. Robots allow everything.',
  ),
  county(
    'ramsey-county',
    'Ramsey County',
    'https://www.ramseycountymn.gov/',
    'The old domain redirects here. Robots disallow search, admin, login, /sites/ and every .pdf and .aspx path.',
  ),
  county('scott-county', 'Scott County', 'https://www.scottcountymn.gov/', CHALLENGE),
  county('washington-county', 'Washington County', 'https://www.washingtoncountymn.gov/', ADMIN),

  // The 10 largest Minnesota cities after Minneapolis (Saint Paul is above; robots read on 2026-11-26, #15).
  city(
    'rochester',
    'Rochester',
    'https://www.rochestermn.gov/',
    'Robots disallow only system paths (/bin/, /config/, /install/, /umbraco/, /views/, /sandbox/).',
  ),
  city('duluth', 'Duluth', 'https://duluthmn.gov/', NO_ROBOTS),
  city(
    'bloomington',
    'Bloomington',
    'https://www.bloomingtonmn.gov/',
    'Robots allow the generic agent (rules list only theme files).',
  ),
  city('brooklyn-park', 'Brooklyn Park', 'https://www.brooklynpark.org/', 'Robots disallow only event-calendar views.'),
  city('plymouth', 'Plymouth', 'https://www.plymouthmn.gov/', REFUSED),
  city('woodbury', 'Woodbury', 'https://www.woodburymn.gov/', CHALLENGE),
  city('maple-grove', 'Maple Grove', 'https://www.maplegrovemn.gov/', ADMIN),
  city('blaine', 'Blaine', 'https://www.blainemn.gov/', ADMIN),
  city('lakeville', 'Lakeville', 'https://www.lakevillemn.gov/', ADMIN),

  // Lost-pet sites and groups.
  {
    id: 'lost-dogs-minnesota',
    name: 'Lost Dogs Minnesota',
    url: 'https://www.facebook.com/',
    region: 'Minnesota',
    listingKinds: ['lost', 'found', 'sighting'],
    access: 'capture',
    notes: "Its posts are in Facebook groups, so it waits on the owner's Facebook decision (ADR-0002 point 5).",
  },
  {
    id: 'pawboost',
    name: 'PawBoost',
    url: 'https://www.pawboost.com/',
    region: 'national',
    listingKinds: ['lost', 'found'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: 'Robots allow everything, yet its pages answered a plain fetch with 403 (ADR-0002), so it is not read.',
  },
  {
    id: 'petco-love-lost',
    name: 'Petco Love Lost',
    url: 'https://lost.petcolove.org/',
    region: 'national',
    listingKinds: ['lost', 'found'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: 'Its pages answered a plain fetch with a bot check (ADR-0002), so it is not read.',
  },
  {
    id: 'pet-fbi',
    name: 'Pet FBI',
    url: 'https://petfbi.org/',
    region: 'national',
    listingKinds: ['lost', 'found'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote:
      'Robots allow everything for the generic agent. Its terms were not read and its listing pages not tried, so it stays a link.',
  },
  {
    id: 'facebook-groups',
    name: 'Facebook lost and found pet groups',
    url: 'https://www.facebook.com/',
    region: 'Minnesota',
    listingKinds: ['lost', 'found', 'sighting'],
    access: 'capture',
    checkedOn: '2026-11-26',
    checkNote:
      "Robots disallow everything for the generic agent and say automated collection is prohibited (ADR-0002). Capture waits on the owner's decision.",
  },
  {
    id: 'nextdoor',
    name: 'Nextdoor',
    url: 'https://nextdoor.com/',
    region: 'Minnesota',
    listingKinds: ['lost', 'found', 'sighting'],
    access: 'capture',
    checkedOn: '2026-11-26',
    checkNote:
      "Robots disallow everything for the generic agent except two paths with no lost-pet posts (ADR-0002). Capture waits on the owner's decision.",
  },
  {
    id: 'craigslist-minneapolis',
    name: 'Craigslist Minneapolis: lost and found',
    url: 'https://minneapolis.craigslist.org/',
    region: 'Twin Cities metro',
    listingKinds: ['lost', 'found'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: 'Robots disallow a few paths (replies and flags), not the listing pages. Its terms were not checked.',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com/',
    region: 'national',
    listingKinds: ['lost', 'found', 'sighting'],
    access: 'link',
    checkedOn: '2026-11-26',
    checkNote: 'Robots disallow everything for the generic agent (ADR-0002), so it is not read.',
  },
]
