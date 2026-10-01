/** @jsxImportSource @solidjs/web */
import { createMemo, For, Loading } from 'solid-js'
import { fetchPosts, fetchUser } from '../api'

// Slide 7, step 2: Posts pulled out into its own component.
export default function Demo() {
  return <App userId={1} />
}

function Posts(props: { userId: number }) {
  const posts = createMemo(() => fetchPosts(props.userId))
  return (
    <ul>
      <For each={posts()}>{p => <li>{p.title}</li>}</For>
    </ul>
  )
}

function App(props: { userId: number }) {
  const user = createMemo(() => fetchUser(props.userId))
  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
      <Posts userId={props.userId} />
    </Loading>
  )
}
