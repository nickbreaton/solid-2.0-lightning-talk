import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchUser } from '../api'

// Slide 2, step 2: TanStack Query owns the loading state.
export default function Demo() {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <User id={1} />
    </QueryClientProvider>
  )
}

function User({ id }: { id: number }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  })

  if (isLoading) return <p>Loading...</p>

  return <p>{user!.name}</p>
}
