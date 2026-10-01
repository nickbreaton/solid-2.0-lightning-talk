import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchUser } from '../api'

// Slide 2, step 2: TanStack Query owns the loading state.
export default function Demo() {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <App userId={1} />
    </QueryClientProvider>
  )
}

function App({ userId }: { userId: number }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <p>Loading...</p>

  return <p>{user!.name}</p>
}
