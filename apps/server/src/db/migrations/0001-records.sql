-- The records of ADR-0005 point 2: every table and field it names. snake_case here, camelCase in
-- TypeScript and JSON. Times are ISO 8601 UTC text with milliseconds, dates are YYYY-MM-DD, and
-- lists and objects are JSON text. The value sets are checked by the zod schemas in
-- packages/core on every write. A migration runs in one transaction: no BEGIN or COMMIT here.

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  region TEXT NOT NULL,
  listing_kinds TEXT NOT NULL,
  access TEXT NOT NULL,
  collector TEXT,
  checked_on TEXT,
  check_note TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  blocked_at TEXT,
  blocked_reason TEXT,
  last_read_at TEXT
) STRICT;

CREATE TABLE sweeps (
  id INTEGER PRIMARY KEY,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  counts TEXT NOT NULL,
  errors TEXT NOT NULL DEFAULT '[]'
) STRICT;

CREATE TABLE listings (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources (id),
  source_key TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL,
  species TEXT NOT NULL,
  posted_at TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  gone_at TEXT,
  place_text TEXT,
  town TEXT,
  county TEXT,
  lat REAL,
  lon REAL,
  place_precision TEXT NOT NULL,
  traits TEXT NOT NULL,
  text TEXT,
  photo_urls TEXT NOT NULL DEFAULT '[]',
  contact TEXT,
  UNIQUE (source_id, source_key)
) STRICT;

CREATE INDEX listings_last_seen_at ON listings (last_seen_at);
CREATE INDEX listings_kind ON listings (kind);
-- The Listings page's order, newest first, and its cursor.
CREATE INDEX listings_first_seen_at ON listings (first_seen_at, id);

CREATE TABLE dogs (
  id INTEGER PRIMARY KEY,
  label TEXT,
  last_seen_at TEXT NOT NULL,
  last_seen_town TEXT NOT NULL,
  last_seen_place TEXT,
  lat REAL,
  lon REAL,
  place_precision TEXT NOT NULL,
  traits TEXT NOT NULL,
  marks TEXT,
  notes TEXT,
  photos TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'missing',
  found_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

-- Deleting a listing or a dog deletes its matches.
CREATE TABLE matches (
  dog_id INTEGER NOT NULL REFERENCES dogs (id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  score REAL NOT NULL,
  band TEXT NOT NULL,
  reasons TEXT NOT NULL DEFAULT '[]',
  set_aside_reason TEXT,
  computed_at TEXT NOT NULL,
  PRIMARY KEY (dog_id, listing_id)
) STRICT;

CREATE INDEX matches_dog_id_score ON matches (dog_id, score);
CREATE INDEX matches_listing_id ON matches (listing_id);
