import { Suspense, useState } from 'react'
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query'
import { fetchUser } from '../api'

// Slide 2, step 3: the loading branch moves to a Suspense boundary.
export default function Demo() {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <App userId={1} />
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

function User({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return <p>{user.name}</p>
}
