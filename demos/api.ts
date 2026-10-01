// Fake backend shared by every demo. Each request is recorded in `requestLog`
// so the <Network> component can draw a waterfall that is framework-neutral.

export type RequestEntry = { id: number; label: string; start: number; end?: number; failed?: boolean }

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
  posts = initialPosts()
  requestLog.length = 0
  epoch = performance.now()
  listeners.forEach(fn => fn())
}

function request<T>(label: string, ms: number, value: () => T): Promise<T> {
  const entry: RequestEntry = { id: nextId++, label, start: performance.now() - epoch }
  requestLog.push(entry)
  listeners.forEach(fn => fn())
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      entry.end = performance.now() - epoch
      try {
        resolve(value())
      } catch (error) {
        entry.failed = true
        reject(error)
      }
      listeners.forEach(fn => fn())
    }, ms),
  )
}

// ---------------------------------------------------------------- users

export type User = { id: number; first: string; last: string; name: string }

const people = [
  ['Blue Ridge', 'Betty'],
  ['Drum Circle', 'Dave'],
  ['South Slope', 'Sam'],
  ['Pisgah', 'Pete'],
  ['RAD', 'Rachel'],
  ['Biltmore', 'Bob'],
]

export function fetchUser(id: number): Promise<User> {
  const [first, last] = people[(id - 1) % people.length]
  return request(`user ${id}`, 900, () => ({
    id,
    first,
    last,
    name: `${first} ${last}`,
  }))
}

// ---------------------------------------------------------------- posts

export type Post = { id: number; title: string }

const initialPosts = (): Post[] => [
  { id: 1, title: 'Best trails off the Parkway' },
  { id: 2, title: 'Ranking every brewery on South Slope' },
]
let posts = initialPosts()

export function fetchPosts(userId: number): Promise<Post[]> {
  return request(`posts ${userId}`, 900, () => posts.map(p => ({ ...p })))
}

// Only the first save succeeds, so a second click shows optimistic rollback.
export function savePost(userId: number, title: string): Promise<Post> {
  return request(`save post`, 1200, () => {
    if (posts.length > initialPosts().length) throw new Error('Save failed')
    const post = { id: posts.length + 1, title }
    posts = [...posts, post]
    return post
  })
}
