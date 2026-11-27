import { Link } from 'wouter'

export function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        There is no page here. <Link href="/">Go to the home page</Link>.
      </p>
    </>
  )
}
