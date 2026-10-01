/** @jsxImportSource @solidjs/web */
import { createMemo, For, Loading } from 'solid-js'
import { fetchPosts, fetchUser } from '../api'

// Slide 7, step 3: the same Posts → User → App tree as the React waterfall.
// Reading a not-ready value doesn't stop Posts from being created, so its
// memo starts its own request right away.
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

function User(props: { userId: number }) {
  const user = createMemo(() => fetchUser(props.userId))
  return (
    <>
      <p>{user().name}</p>
      <Posts userId={props.userId} />
    </>
  )
}

function App(props: { userId: number }) {
  return (
    <Loading fallback={<p>Loading...</p>}>
      <User userId={props.userId} />
    </Loading>
  )
}
