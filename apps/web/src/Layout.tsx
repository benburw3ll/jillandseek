import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/find', label: 'Find a dog' },
  { href: '/listings', label: 'Listings' },
  { href: '/sources', label: 'Sources' },
]

/** A nav item is current on its own page and on the pages under it (Find a dog's /find/:id). */
const current = (location: string, href: string) =>
  location === href || (href !== '/' && location.startsWith(`${href}/`))

/** The header with the name and the navigation, around every page. */
export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-name">
            Jill and Seek
          </Link>
          <nav aria-label="Main">
            <ul className="nav">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current(location, item.href) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
