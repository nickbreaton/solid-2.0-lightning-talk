/** @jsxImportSource @solidjs/web */
import { createMemo, createSignal, Loading } from 'solid-js'
import { fetchUser } from '../api'

// Slide 8: derived-but-writable. No synchronization Effect.
export default function Demo() {
  const [id, setId] = createSignal(1)
  const user = createMemo(() => fetchUser(id()))
  const [name, setName] = createSignal(() => user().name)

  return (
    <div class="stack">
      <Loading fallback={<div class="card skeleton">Loading…</div>}>
        <div class="card">
          <input value={name()} onInput={e => setName(e.currentTarget.value)} />
          <div class="muted">upstream: {user().name}</div>
        </div>
      </Loading>
      <button onClick={() => setId(id() + 1)}>Next user</button>
    </div>
  )
}
