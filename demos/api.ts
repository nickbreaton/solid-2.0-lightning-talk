// Fake backend shared by every demo. Each request is recorded in `requestLog`
// so the <Network> component can draw a waterfall that is framework-neutral.

export type RequestEntry = { id: number; label: string; start: number; end?: number }

type Listener = () => void
const listeners = new Set<Listener>()
let nextId = 0
let epoch = performance.now()

export const requestLog: RequestEntry[] = []

export const elapsed = () => performance.now() - epoch

export function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetLog() {
  requestLog.length = 0
  epoch = performance.now()
  listeners.forEach(fn => fn())
}

function request<T>(label: string, ms: number, value: () => T): Promise<T> {
  const entry: RequestEntry = { id: nextId++, label, start: performance.now() - epoch }
  requestLog.push(entry)
  listeners.forEach(fn => fn())
  return new Promise(resolve =>
    setTimeout(() => {
      entry.end = performance.now() - epoch
      listeners.forEach(fn => fn())
      resolve(value())
    }, ms),
  )
}

// ---------------------------------------------------------------- users

export type User = { id: number; first: string; last: string; name: string }

const people = [
  ['Ada', 'Lovelace'],
  ['Grace', 'Hopper'],
  ['Margaret', 'Hamilton'],
  ['Katherine', 'Johnson'],
  ['Barbara', 'Liskov'],
  ['Frances', 'Allen'],
]
const renamed = new Map<number, string>()

export function fetchUser(id: number): Promise<User> {
  const [first, last] = people[(id - 1) % people.length]
  return request(`user ${id}`, 900, () => ({
    id,
    first,
    last,
    name: renamed.get(id) ?? `${first} ${last}`,
  }))
}

export function renameUser(id: number, name: string): Promise<void> {
  return request(`rename ${id}`, 1200, () => {
    renamed.set(id, name)
  })
}

// ---------------------------------------------------------------- posts

export type Post = { id: number; title: string }

export function fetchPosts(userId: number): Promise<Post[]> {
  return request(`posts ${userId}`, 900, () => [
    { id: 1, title: 'Notes on the Analytical Engine' },
    { id: 2, title: 'Put it in the graph' },
  ])
}

// ---------------------------------------------------------------- geography
// TODO: swap for the real endpoints from Ryan Carniato's StackBlitz demo.

type Place = { id: string; name: string }

const geo: Record<string, { name: string; counties: Record<string, { name: string; cities: string[] }> }> = {
  NC: {
    name: 'North Carolina',
    counties: {
      buncombe: { name: 'Buncombe', cities: ['Asheville', 'Black Mountain', 'Weaverville'] },
      wake: { name: 'Wake', cities: ['Raleigh', 'Cary', 'Apex'] },
      mecklenburg: { name: 'Mecklenburg', cities: ['Charlotte', 'Huntersville', 'Matthews'] },
    },
  },
  CA: {
    name: 'California',
    counties: {
      alameda: { name: 'Alameda', cities: ['Oakland', 'Berkeley', 'Fremont'] },
      sf: { name: 'San Francisco', cities: ['San Francisco'] },
      la: { name: 'Los Angeles', cities: ['Los Angeles', 'Pasadena', 'Long Beach'] },
    },
  },
  NY: {
    name: 'New York',
    counties: {
      kings: { name: 'Kings', cities: ['Brooklyn'] },
      erie: { name: 'Erie', cities: ['Buffalo', 'Tonawanda', 'Lackawanna'] },
      monroe: { name: 'Monroe', cities: ['Rochester', 'Greece', 'Brighton'] },
    },
  },
}

export const states: Place[] = Object.entries(geo).map(([id, s]) => ({ id, name: s.name }))

export function fetchCounties(state: string): Promise<Place[]> {
  return request(`counties ${state}`, 800, () =>
    Object.entries(geo[state].counties).map(([id, c]) => ({ id, name: c.name })),
  )
}

export function fetchCities(county: string): Promise<Place[]> {
  const found = Object.values(geo).find(s => county in s.counties)!.counties[county]
  return request(`cities ${county}`, 800, () =>
    found.cities.map(name => ({ id: name.toLowerCase().replace(/\s/g, '-'), name })),
  )
}
