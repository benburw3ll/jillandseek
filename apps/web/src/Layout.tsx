import type { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'

// The home screen is the search, so one item names both (#59).
const NAV = [
  { href: '/', label: 'Find a dog' },
  { href: '/listings', label: 'Listings' },
  { href: '/sources', label: 'Sources' },
]

/** A nav item is current on its own page and the pages under it. A dog's pages belong to Find a dog. */
const current = (location: string, href: string) =>
  href === '/'
    ? location === '/' || /^\/(find|dogs)(\/|$)/.test(location)
    : location === href || location.startsWith(`${href}/`)

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
