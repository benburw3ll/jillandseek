import { Link } from 'wouter'
import memorial from '../content/memorial.md?raw'

/** The memorial file's heading and paragraphs, with its comments left out. */
export function readMemorial(text: string): { heading: string | null; paragraphs: string[] } {
  const blocks = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b !== '')
  const first = blocks[0]
  const heading = first?.startsWith('# ') ? first.slice(2).trim() : null
  return { heading, paragraphs: heading === null ? blocks : blocks.slice(1) }
}

export function Home() {
  const { heading, paragraphs } = readMemorial(memorial)
  return (
    <>
      <h1>Jill and Seek</h1>
      <p className="lead">
        Jill and Seek is a lost-dog finder for Minnesota. When a dog goes missing, it gathers the shelter stray lists
        and lost-and-found posts it is allowed to read into one place, ranks each listing against the missing dog and
        says why. A match is a ranking, never an identification: go and see the dog in person.
      </p>
      <p>
        <Link href="/find" className="button">
          Find a dog
        </Link>
      </p>
      <section className="memorial" aria-labelledby="memorial-heading">
        <h2 id="memorial-heading">{heading ?? 'Jill'}</h2>
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
    </>
  )
}
