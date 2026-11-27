import type { DatabaseSync } from 'node:sqlite'
import { BlockedReason, Instant, Source, SourceEntry, type SourceEntryInput } from '@jillandseek/core'
import { json, type Row, transaction } from './rows.ts'

// The sources table. The registry owns every field but the sweep's: `status` going to `blocked`,
// `blocked_at`, `blocked_reason` and `last_read_at`. A sync never clears those.

export function sourceFromRow(row: Row): Source {
  return Source.parse({
    id: row.id,
    name: row.name,
    url: row.url,
    region: row.region,
    listingKinds: json(row.listing_kinds),
    access: row.access,
    collector: row.collector,
    checkedOn: row.checked_on,
    checkNote: row.check_note,
    notes: row.notes,
    status: row.status,
    blockedAt: row.blocked_at,
    blockedReason: row.blocked_reason,
    lastReadAt: row.last_read_at,
  })
}

export type SyncResult = { added: number; updated: number; retired: number }

export function sourcesRepository(db: DatabaseSync) {
  return {
    /**
     * Writes the registry into the sources table, in one transaction. A source missing from the
     * registry is marked `retired` (its listings keep pointing at it); a blocked source stays
     * blocked, and the sweep's fields are never touched.
     */
    syncSources(entries: SourceEntryInput[]): SyncResult {
      const parsed = entries.map((e) => SourceEntry.parse(e))
      const ids = new Set(parsed.map((e) => e.id))
      if (ids.size !== parsed.length) throw new Error('the registry lists a source id twice')
      return transaction(db, () => {
        const known = new Set((db.prepare('SELECT id FROM sources').all() as { id: string }[]).map((r) => r.id))
        const upsert = db.prepare(`
          INSERT INTO sources (id, name, url, region, listing_kinds, access, collector, checked_on, check_note, notes, status)
          VALUES (:id, :name, :url, :region, :listing_kinds, :access, :collector, :checked_on, :check_note, :notes, :status)
          ON CONFLICT (id) DO UPDATE SET
            name = excluded.name, url = excluded.url, region = excluded.region,
            listing_kinds = excluded.listing_kinds, access = excluded.access, collector = excluded.collector,
            checked_on = excluded.checked_on, check_note = excluded.check_note, notes = excluded.notes,
            status = CASE WHEN sources.status = 'blocked' THEN 'blocked' ELSE excluded.status END`)
        for (const e of parsed) {
          upsert.run({
            id: e.id,
            name: e.name,
            url: e.url,
            region: e.region,
            listing_kinds: JSON.stringify(e.listingKinds),
            access: e.access,
            collector: e.collector,
            checked_on: e.checkedOn,
            check_note: e.checkNote,
            notes: e.notes,
            status: e.status,
          })
        }
        const gone = [...known].filter((id) => !ids.has(id))
        const retire = db.prepare("UPDATE sources SET status = 'retired' WHERE id = ? AND status = 'active'")
        const retired = gone.reduce((n, id) => n + Number(retire.run(id).changes), 0)
        const added = parsed.filter((e) => !known.has(e.id)).length
        return { added, updated: parsed.length - added, retired }
      })
    },

    /** Every source, by name. */
    listSources(): Source[] {
      return (db.prepare('SELECT * FROM sources ORDER BY name, id').all() as Row[]).map(sourceFromRow)
    },

    /** The sweep's mark that it began a read of a source, so the next one waits its interval. */
    markRead(id: string, now: string): void {
      Instant.parse(now)
      db.prepare('UPDATE sources SET last_read_at = ? WHERE id = ?').run(now, id)
    },

    /** Marks a source blocked (ADR-0002 point 3). Only the owner clears it, with `clearBlock`. */
    blockSource(id: string, reason: BlockedReason, now: string): void {
      Instant.parse(now)
      BlockedReason.parse(reason)
      db.prepare("UPDATE sources SET status = 'blocked', blocked_at = ?, blocked_reason = ? WHERE id = ?").run(
        now,
        reason,
        id,
      )
    },

    /** The owner's clearing of a block, from POST /api/sources/:id/clear-block (#35). */
    clearBlock(id: string): void {
      db.prepare(
        "UPDATE sources SET status = 'active', blocked_at = NULL, blocked_reason = NULL WHERE id = ? AND status = 'blocked'",
      ).run(id)
    },

    getSource(id: string): Source | null {
      const row = db.prepare('SELECT * FROM sources WHERE id = ?').get(id) as Row | undefined
      return row ? sourceFromRow(row) : null
    },
  }
}
