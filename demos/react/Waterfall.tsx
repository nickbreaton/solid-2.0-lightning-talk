import { Suspense, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  usePrefetchQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { fetchArticle, fetchComments } from '../api'

// Slides 3 & 4: a Suspenseful parent query and an *independent* child query.
// With `prefetch`, the comments query is started above the boundary.

const articleQuery = (id: number) => ({ queryKey: ['article', id], queryFn: () => fetchArticle(id) })
const commentsQuery = (id: number) => ({ queryKey: ['comments', id], queryFn: () => fetchComments(id) })

export default function Demo({ prefetch = false }: { prefetch?: boolean }) {
  const client = new QueryClient()
  return (
    <QueryClientProvider client={client}>
      {prefetch ? <PrefetchingPage /> : <Page />}
    </QueryClientProvider>
  )
}

function Page() {
  const [id] = useState(1)
  return <Boundary id={id} />
}

function Boundary({ id }: { id: number }) {
  return (
    <Suspense fallback={<div className="card skeleton">Loading article…</div>}>
      <Article id={id} />
    </Suspense>
  )
}

function PrefetchingPage() {
  const [id] = useState(1)
  usePrefetchQuery(commentsQuery(id))
  return <Boundary id={id} />
}

function Article({ id }: { id: number }) {
  const { data } = useSuspenseQuery(articleQuery(id))
  return (
    <div className="card">
      <strong>{data.title}</strong>
      <Suspense fallback={<div className="muted">Loading comments…</div>}>
        <Comments id={id} />
      </Suspense>
    </div>
  )
}

function Comments({ id }: { id: number }) {
  const { data } = useSuspenseQuery(commentsQuery(id))
  return (
    <ul className="comments">
      {data.map(c => (
        <li key={c.id}>
          <b>@{c.author}</b> {c.text}
        </li>
      ))}
    </ul>
  )
}
