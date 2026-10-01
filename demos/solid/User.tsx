/** @jsxImportSource @solidjs/web */
import { createMemo, Loading } from 'solid-js'
import { fetchUser } from '../api'

// Slide 6: the same user fetch as slide 2, as an async memo.
export default function Demo() {
  return <App userId={1} />
}

function App(props: { userId: number }) {
  const user = createMemo(() => fetchUser(props.userId))

  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
    </Loading>
  )
}
