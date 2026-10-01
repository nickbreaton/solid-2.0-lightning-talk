import { Suspense, useState } from 'react'
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query'
import { fetchUser } from '../api'

// Slide 2, step 3: the loading branch moves to a Suspense boundary.
export default function Demo() {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <App id={1} />
    </QueryClientProvider>
  )
}

function App({ id }: { id: number }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <User id={id} />
    </Suspense>
  )
}

function User({ id }: { id: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  })

  return <p>{user.name}</p>
}
