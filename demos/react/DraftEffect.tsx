import { Suspense, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query'
import { fetchUser } from '../api'

// Slide 8: an editable draft seeded from upstream data, kept in sync by an Effect.
export default function Demo() {
  const [client] = useState(() => new QueryClient())
  const [id, setId] = useState(1)
  return (
    <QueryClientProvider client={client}>
      <div className="stack">
        <Suspense fallback={<div className="card skeleton">Loading…</div>}>
          <Editor id={id} />
        </Suspense>
        <button onClick={() => setId(id + 1)}>Next user</button>
      </div>
    </QueryClientProvider>
  )
}

function Editor({ id }: { id: number }) {
  const { data: user } = useSuspenseQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) })
  const [name, setName] = useState(user.name)

  useEffect(() => {
    setName(user.name)
  }, [user.name])

  return (
    <div className="card">
      <input value={name} onChange={e => setName(e.target.value)} />
      <div className="muted">upstream: {user.name}</div>
    </div>
  )
}
