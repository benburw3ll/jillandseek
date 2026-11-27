// The matcher's word tables (#19): breed words to breed families, with mixes, and colour words to
// colour families. Breed and colour words are stored as posted (ADR-0005), so every synonym lives
// here and nothing is rewritten when a post is collected. A word the tables don't know is
// unknown: it is never compared, so it never lowers a score.

/** Each breed family with the words posts use for it. The first word is how a reason names it. */
const BREED_FAMILIES: Record<string, readonly string[]> = {
  Labrador: [
    'labrador',
    'labrador retriever',
    'lab',
    'labs',
    'black lab',
    'yellow lab',
    'chocolate lab',
    'labrador mix',
  ],
  'German Shepherd': ['german shepherd', 'german shepard', 'shepherd', 'shepard', 'gsd', 'alsatian'],
  'Golden Retriever': ['golden retriever', 'golden', 'goldie'],
  Husky: ['husky', 'siberian husky', 'sibe', 'alaskan husky', 'malamute', 'alaskan malamute'],
  Beagle: ['beagle'],
  Chihuahua: ['chihuahua', 'chi', 'chiweenie'],
  'Pit Bull': [
    'pit bull',
    'pitbull',
    'pittie',
    'pitty',
    'pit',
    'american pit bull terrier',
    'staffordshire terrier',
    'amstaff',
    'american staffordshire terrier',
    'bully',
  ],
  Poodle: ['poodle', 'toy poodle', 'standard poodle', 'miniature poodle'],
  'Border Collie': ['border collie', 'collie'],
  Dachshund: ['dachshund', 'doxie', 'doxy', 'wiener dog', 'weiner dog', 'chiweenie'],
  Boxer: ['boxer'],
  Rottweiler: ['rottweiler', 'rottie', 'rott'],
  'Australian Shepherd': ['australian shepherd', 'aussie', 'aussie shepherd'],
  Corgi: ['corgi', 'pembroke welsh corgi', 'cardigan welsh corgi'],
  'Shih Tzu': ['shih tzu', 'shihtzu', 'shih-tzu'],
  Yorkie: ['yorkie', 'yorkshire terrier'],
  'Great Pyrenees': ['great pyrenees', 'pyrenees', 'pyr'],
  Hound: ['hound', 'coonhound', 'bloodhound', 'foxhound', 'beagle'],
}

/** Words that name two families at once (a cross), or a family loosely. */
const CROSS_WORDS: Record<string, readonly string[]> = {
  retriever: ['Labrador', 'Golden Retriever'],
  doodle: ['Poodle', 'Golden Retriever', 'Labrador'],
  goldendoodle: ['Poodle', 'Golden Retriever'],
  labradoodle: ['Poodle', 'Labrador'],
  'lab doodle': ['Poodle', 'Labrador'],
  sheprador: ['German Shepherd', 'Labrador'],
  pitsky: ['Pit Bull', 'Husky'],
  aussiedoodle: ['Australian Shepherd', 'Poodle'],
}

/** Endings that mark a mix, taken off before the lookup. */
const MIX_ENDINGS = [' mix', ' mixed', ' cross', ' x', ' blend', '-mix', ' mutt']

const BREED_LOOKUP = new Map<string, string[]>()
for (const [family, words] of Object.entries(BREED_FAMILIES)) {
  for (const w of words) BREED_LOOKUP.set(w, [...(BREED_LOOKUP.get(w) ?? []), family])
}
for (const [w, families] of Object.entries(CROSS_WORDS)) BREED_LOOKUP.set(w, [...families])

const clean = (word: string) =>
  word
    .toLowerCase()
    .replace(/[^a-z\s/&+,-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export type BreedRead = { families: Set<string>; mix: boolean }

/** The breed families a post's breed words name, and whether it says mix. Unknown words add nothing. */
export function readBreeds(words: readonly string[]): BreedRead {
  const families = new Set<string>()
  let mix = false
  for (const raw of words) {
    let word = clean(raw)
    for (const end of MIX_ENDINGS) {
      if (word.endsWith(end)) {
        word = word.slice(0, -end.length).trim()
        mix = true
      }
    }
    if (word === 'mix' || word === 'mixed' || word === 'mixed breed') {
      mix = true
      continue
    }
    // "lab/husky", "lab and shepherd", "lab x husky": each part is looked up on its own too.
    const parts = [word, ...word.split(/\s*(?:\/|&|\+|,| and | x )\s*/)]
    for (const part of parts) for (const f of BREED_LOOKUP.get(part) ?? []) families.add(f)
    if (parts.length > 2) mix = true
  }
  return { families, mix }
}

/** Each colour family with the words posts use for it. The first word is how a reason names it. */
const COLOR_FAMILIES: Record<string, readonly string[]> = {
  yellow: [
    'yellow',
    'tan',
    'fawn',
    'red',
    'gold',
    'golden',
    'blonde',
    'blond',
    'buff',
    'apricot',
    'wheaten',
    'sable',
    'orange',
    'caramel',
    'honey',
    'light brown',
  ],
  black: ['black', 'dark', 'jet black', 'ebony'],
  brown: ['brown', 'chocolate', 'liver', 'dark brown', 'mocha', 'chestnut', 'dark', 'light brown'],
  'black and tan': [
    'black and tan',
    'black tan',
    'black & tan',
    'tricolor',
    'tri color',
    'tri-color',
    'tri',
    'tricolour',
  ],
  white: ['white', 'cream', 'off white', 'off-white', 'ivory'],
  grey: ['grey', 'gray', 'silver', 'blue', 'slate', 'charcoal'],
  brindle: ['brindle', 'striped', 'tiger', 'tiger striped'],
  merle: ['merle', 'blue merle', 'red merle', 'dapple'],
  spotted: ['spotted', 'spots', 'speckled', 'ticked', 'roan', 'dalmatian'],
}

const COLOR_LOOKUP = new Map<string, string[]>()
for (const [family, words] of Object.entries(COLOR_FAMILIES)) {
  for (const w of words) COLOR_LOOKUP.set(w, [...(COLOR_LOOKUP.get(w) ?? []), family])
}

/** The colour families a post's colour words name. "black and white" names black and white. */
export function readColors(words: readonly string[]): Set<string> {
  const families = new Set<string>()
  for (const raw of words) {
    const word = clean(raw.replace(/&/g, ' and '))
    const whole = COLOR_LOOKUP.get(word)
    if (whole !== undefined) {
      for (const f of whole) families.add(f)
      continue
    }
    for (const part of word.split(/\s*(?:\/|,| and | with )\s*|\s+/)) {
      for (const f of COLOR_LOOKUP.get(part) ?? []) families.add(f)
    }
  }
  return families
}
