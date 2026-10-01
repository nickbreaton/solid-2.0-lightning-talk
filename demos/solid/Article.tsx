/** @jsxImportSource @solidjs/web */
import { createMemo, For, Loading } from 'solid-js'
import { fetchArticle, fetchComments } from '../api'

// Same component shape as the React waterfall: Article reads its data, then
// renders Comments below it. Here, reading a not-ready value doesn't stop
// Comments from being created, so its memo starts its own request right away.
export default function Demo() {
  return (
    <Loading fallback={<div class="card skeleton">Loading article…</div>}>
      <Article id={1} />
    </Loading>
  )
}

function Article(props: { id: number }) {
  const article = createMemo(() => fetchArticle(props.id))
  return (
    <div class="card">
      <strong>{article().title}</strong>
      <Loading fallback={<div class="muted">Loading comments…</div>}>
        <Comments id={props.id} />
      </Loading>
    </div>
  )
}

function Comments(props: { id: number }) {
  const comments = createMemo(() => fetchComments(props.id))
  return (
    <ul class="comments">
      <For each={comments()}>
        {c => (
          <li>
            <b>@{c.author}</b> {c.text}
          </li>
        )}
      </For>
    </ul>
  )
}
