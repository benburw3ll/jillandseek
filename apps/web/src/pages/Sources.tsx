import type { Source } from '@jillandseek/core'
import { fetchSources } from '../api/sources.ts'
import { useLoad } from '../useLoad.ts'

const ACCESS_WORDS: Record<Source['access'], string> = {
  automatic: 'Read automatically',
  capture: 'Captured from your browser',
  link: 'Link only',
}

/** Every source in the registry. O3 (#16) adds the coverage summary and last reads. */
export function Sources() {
  const load = useLoad<Source[]>((signal) => fetchSources(signal))
  return (
    <>
      <h1>Sources</h1>
      {load.state === 'loading' && <p aria-busy="true">Loading sources…</p>}
      {load.state === 'error' && (
        <p role="alert">The sources could not be loaded. Check that Jill and Seek's server is running.</p>
      )}
      {load.state === 'ready' && load.data.length === 0 && (
        <div className="empty">
          <p>No sources yet.</p>
          <p>
            Sources appear here once the registry of every place Jill and Seek knows about is added: what each one
            covers, and whether it is read automatically, captured from your browser or only linked to.
          </p>
        </div>
      )}
      {load.state === 'ready' && load.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <caption className="visually-hidden">Sources in the registry</caption>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Covers</th>
                <th scope="col">Access</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {load.data.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href={s.url} rel="noreferrer noopener" target="_blank">
                      {s.name}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </td>
                  <td>{s.region}</td>
                  <td>{ACCESS_WORDS[s.access]}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
