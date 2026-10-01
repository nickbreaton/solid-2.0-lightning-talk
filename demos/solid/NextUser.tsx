/** @jsxImportSource @solidjs/web */
import { createMemo, createSignal, isPending, latest, Loading } from 'solid-js'
import { fetchUser } from '../api'

// Slide 6: change the input to an async value. No startTransition anywhere.
export default function Demo() {
  const [id, setId] = createSignal(1)
  const user = createMemo(() => fetchUser(id()))
  const name = createMemo(() => `${user().first} ${user().last}`)

  return (
    <div class="stack">
      <Loading fallback={<div class="card skeleton">Loading…</div>}>
        <div class={['card', { pending: isPending(() => user()) }]}>
          {name()}
          <span class="muted">{isPending(() => user()) ? ' updating…' : ''}</span>
        </div>
      </Loading>
      <div class="row">
        <button onClick={() => setId(id() + 1)}>Next user</button>
        <span class="muted">selected: {latest(id)} · committed: {id()}</span>
      </div>
    </div>
  )
}
