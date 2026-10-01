import { Suspense, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  usePrefetchQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { fetchPosts, fetchUser } from '../api'

// Slides 3 & 4: slide 2's App → User, plus an *independent* child Posts query.
// With `prefetch`, App starts the posts query above the boundary.
export default function Demo({ prefetch = false }: { prefetch?: boolean }) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      {prefetch ? <PrefetchingApp userId={1} /> : <App userId={1} />}
    </QueryClientProvider>
  )
}

function App({ userId }: { userId: number }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <User userId={userId} />
    </Suspense>
  )
}

function PrefetchingApp({ userId }: { userId: number }) {
  usePrefetchQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  })

  return <App userId={userId} />
}

function User({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return (
    <>
      <p>{user.name}</p>
      <Posts userId={userId} />
    </>
  )
}

function Posts({ userId }: { userId: number }) {
  const { data: posts } = useSuspenseQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  })

  return (
    <ul>
      {posts.map(p => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}
