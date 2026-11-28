// The records, their zod schemas and matching. Pure: no file, network or database access and no
// clock reads (the time is passed in). Each record's type is inferred from its schema.
export * from './dog.ts'
export * from './kinds.ts'
export * from './listing.ts'
export * from './match/index.ts'
export * from './match.ts'
export * from './photoRead.ts'
export * from './source.ts'
export * from './sweep.ts'
export * from './time.ts'
export * from './towns.ts'
export * from './traits.ts'

/** The API's whole-number version (ADR-0005 point 5). A breaking change to any route raises it. */
export const API_VERSION = 1
