import { Sweep } from '@jillandseek/core'
import { z } from 'zod'
import { getJson } from './client.ts'

const SweepList = z.object({ items: z.array(Sweep) })

/** GET /api/sweeps: the recent sweeps, newest first. */
export async function fetchSweeps(signal?: AbortSignal): Promise<Sweep[]> {
  return (await getJson('/sweeps', SweepList, signal)).items
}
