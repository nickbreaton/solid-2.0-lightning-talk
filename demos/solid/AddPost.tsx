/** @jsxImportSource @solidjs/web */
import { action, createOptimisticStore, For, Loading, refresh } from 'solid-js'
import { fetchPosts, savePost, type Post } from '../api'

// Second-to-last slide: an optimistic write inside an action.
export default function Demo() {
  return <App userId={1} />
}

function App(props: { userId: number }) {
  const [posts, setPosts] = createOptimisticStore<Post[]>(() => fetchPosts(props.userId), [])

  const addPost = action(function* (title: string) {
    setPosts(posts => {
      posts.push({ id: Date.now(), title })
    })
    yield savePost(props.userId, title)
    refresh(posts)
  })

  return (
    <Loading fallback={<p>Loading...</p>}>
      <ul>
        <For each={posts}>{p => <li>{p.title}</li>}</For>
      </ul>
      <button onClick={() => addPost('Live from avl.js ⚡')}>Add post</button>
    </Loading>
  )
}
