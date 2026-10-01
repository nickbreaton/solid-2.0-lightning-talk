/** @jsxImportSource @solidjs/web */
import { action, affects, createStore, For, isPending, Loading, refresh } from 'solid-js'
import { fetchPosts, savePost, type Post } from '../api'

// Second-to-last slide, step 1: a non-optimistic action. `affects` marks the
// posts as pending until the save and refetch settle.
export default function Demo() {
  return <App userId={1} />
}

function App(props: { userId: number }) {
  const [posts] = createStore<Post[]>(() => fetchPosts(props.userId), [])

  const addPost = action(function* (title: string) {
    affects(posts)
    yield savePost(props.userId, title)
    refresh(posts)
  })

  return (
    <Loading fallback={<p>Loading...</p>}>
      <ul class={{ pending: isPending(() => posts.length) }}>
        <For each={posts}>{p => <li>{p.title}</li>}</For>
      </ul>
      <button onClick={() => addPost('Live from avl.js ⚡')}>Add post</button>
    </Loading>
  )
}
