import type { SourceEntryInput } from '@jillandseek/core'

// The registry: every source Jill and Seek knows about, read or not (ADR-0002 point 6). Each entry
// says how it may be read and, where it was checked, what robots rules and terms said and when.
// Only checked facts go in `checkNote`; anything not checked says so. No person's name, and no
// group's member details, ever go here.

export const registryEntries: SourceEntryInput[] = [
  // The cities and shelters.
  {
    id: 'macc-strays',
    name: 'Minneapolis Animal Care and Control: stray dogs',
    url: 'https://24petconnect.com/MACCStrayPets?at=DOG',
    region: 'Minneapolis',
    listingKinds: ['shelter-stray'],
    access: 'link',
    notes: 'The stray list is published on 24PetConnect. The collector arrives with #14.',
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
    notes: 'The city site. The page that lists impounded dogs is not yet confirmed.',
  },

  // The seven metro counties, as links until checked (#15).
  county('anoka-county', 'Anoka County', 'https://www.anokacountymn.gov/'),
  county('carver-county', 'Carver County', 'https://www.carvercountymn.gov/'),
  county('dakota-county', 'Dakota County', 'https://www.co.dakota.mn.us/'),
  county('hennepin-county', 'Hennepin County', 'https://www.hennepin.us/'),
  county('ramsey-county', 'Ramsey County', 'https://www.ramseycounty.us/'),
  county('scott-county', 'Scott County', 'https://www.scottcountymn.gov/'),
  county('washington-county', 'Washington County', 'https://www.washingtoncountymn.gov/'),

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

function county(id: string, name: string, url: string): SourceEntryInput {
  return {
    id,
    name: `${name} animal control and shelters`,
    url,
    region: name,
    listingKinds: ['shelter-stray'],
    access: 'link',
    notes: 'The county site. Which page lists impounded dogs is not yet confirmed.',
  }
}
