import type { AiClient } from '../ai/client.ts'
import type { Repository } from '../db/repository.ts'

/** What every route file is given: the repository, the clock and the facts health reports. */
export type RouteDeps = {
  repo: Repository
  /** The clock. Every "now" comes from here, so tests can fix it. */
  now: () => Date
  version: string
  schemaVersion: number
  /** Whether the data home can be written to right now. */
  dataHomeWritable: () => boolean
  /** The one capped client (ADR-0007). With AI off it refuses every call. */
  ai: AiClient
}
