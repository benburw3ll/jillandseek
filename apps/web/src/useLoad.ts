import { useEffect, useState } from 'react'

/** Where one load stands: loading, failed, or ready with its data. */
export type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: T }

/** Runs `load` once when the page mounts, and cancels it when the page goes away. */
export function useLoad<T>(load: (signal: AbortSignal) => Promise<T>): Load<T> {
  const [result, setResult] = useState<Load<T>>({ state: 'loading' })
  // biome-ignore lint/correctness/useExhaustiveDependencies: each page passes a fixed loader and loads once.
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => setResult({ state: 'ready', data }),
      () => {
        if (!controller.signal.aborted) setResult({ state: 'error' })
      },
    )
    return () => controller.abort()
  }, [])
  return result
}
