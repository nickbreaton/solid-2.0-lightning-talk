/** @jsxImportSource @solidjs/web */
import { createMemo, For, Loading } from 'solid-js'
import { fetchPosts, fetchUser } from '../api'

// Slide 7, step 1: both async memos in one component.
export default function Demo() {
  return <App userId={1} />
}

function App(props: { userId: number }) {
  const user = createMemo(() => fetchUser(props.userId))
  const posts = createMemo(() => fetchPosts(props.userId))
  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
      <ul>
        <For each={posts()}>{p => <li>{p.title}</li>}</For>
      </ul>
    </Loading>
  )
}
