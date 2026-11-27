import { z } from 'zod'
import { ListingKind, SourceId } from './kinds.ts'
import { CalendarDate, Instant } from './time.ts'

// A source is one place listings come from (ADR-0005 point 2, ADR-0002). The registry owns every
// field except `status` going to `blocked`, `blockedAt`, `blockedReason` and `lastReadAt`, which
// belong to the sweep. A registry sync never clears them; only the owner clears a block.

export const Access = z.enum(['automatic', 'capture', 'link'])
export type Access = z.infer<typeof Access>

export const SourceStatus = z.enum(['active', 'blocked', 'retired'])
export type SourceStatus = z.infer<typeof SourceStatus>

export const BlockedReason = z.enum(['http-403', 'http-429', 'challenge', 'robots'])
export type BlockedReason = z.infer<typeof BlockedReason>

const registryFields = {
  id: SourceId,
  name: z.string().trim().min(1).max(200),
  url: z.httpUrl(),
  /** The state, county or city it covers, or `national`. */
  region: z.string().trim().min(1).max(100),
  listingKinds: z.array(ListingKind).min(1),
  access: Access,
  /** The collector's id when `access` is `automatic`, otherwise null. */
  collector: z.string().min(1).max(80).nullable(),
  /** The robots and terms check (ADR-0002 point 2). */
  checkedOn: CalendarDate.nullable(),
  checkNote: z.string().max(2000).nullable(),
  notes: z.string().max(2000).nullable(),
}

/** An automatic source names its collector; a capture or link source has none (ADR-0005). */
function checkCollector(source: { access: Access; collector: string | null }, ctx: z.RefinementCtx): void {
  if ((source.access === 'automatic') !== (source.collector !== null)) {
    ctx.addIssue({ code: 'custom', path: ['collector'], message: 'set only when access is automatic' })
  }
}

/** One registry entry: what the registry owns. A registry entry is never `blocked`. */
export const SourceEntry = z
  .object({
    ...registryFields,
    collector: registryFields.collector.default(null),
    checkedOn: registryFields.checkedOn.default(null),
    checkNote: registryFields.checkNote.default(null),
    notes: registryFields.notes.default(null),
    status: z.enum(['active', 'retired']).default('active'),
  })
  .superRefine(checkCollector)
export type SourceEntry = z.infer<typeof SourceEntry>
export type SourceEntryInput = z.input<typeof SourceEntry>

/** A source as stored: the registry's fields plus the sweep's. */
export const Source = z
  .object({
    ...registryFields,
    status: SourceStatus,
    blockedAt: Instant.nullable(),
    blockedReason: BlockedReason.nullable(),
    lastReadAt: Instant.nullable(),
  })
  .superRefine(checkCollector)
export type Source = z.infer<typeof Source>
