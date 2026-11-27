import { Route, Switch } from 'wouter'
import { Layout } from './Layout.tsx'
import { DogPage } from './pages/DogPage.tsx'
import { FindDog } from './pages/FindDog.tsx'
import { Home } from './pages/Home.tsx'
import { Listings } from './pages/Listings.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { Sources } from './pages/Sources.tsx'

/** The site's routes. Each page is its own file in pages/. */
export function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/find">{() => <FindDog key="new" />}</Route>
        <Route path="/find/:id">
          {(p) => (/^[1-9]\d{0,15}$/.test(p.id) ? <FindDog key={p.id} id={Number(p.id)} /> : <NotFound />)}
        </Route>
        <Route path="/dogs/:id">
          {(p) => (/^[1-9]\d{0,15}$/.test(p.id) ? <DogPage key={p.id} id={Number(p.id)} /> : <NotFound />)}
        </Route>
        <Route path="/listings" component={Listings} />
        <Route path="/sources" component={Sources} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}
