/** @jsxImportSource @solidjs/web */
import { action, affects, createOptimisticStore, createSignal, isPending, Loading, refresh } from 'solid-js'
import { fetchUser, renameUser, type User } from '../api'

// Slide 7: writes use the same model. Two flavors of the same action.
export default function Demo() {
  const [id] = createSignal(1)
  const [user, setUser] = createOptimisticStore<User>(() => fetchUser(id()), {} as User)
  let n = 0

  const renamePessimistic = action(function* (name: string) {
    affects(user)
    yield renameUser(id(), name)
    refresh(user)
  })

  const renameOptimistic = action(function* (name: string) {
    setUser(u => {
      u.name = name
    })
    yield renameUser(id(), name)
    refresh(user)
  })

  const nextName = () => ['Countess of Lovelace', 'Ada King', 'A. A. Lovelace'][n++ % 3]

  return (
    <div class="stack">
      <Loading fallback={<div class="card skeleton">Loading…</div>}>
        <div class={['card', { pending: isPending(() => user.name) }]}>
          {user.name}
          <span class="muted">{isPending(() => user.name) ? ' saving…' : ''}</span>
        </div>
      </Loading>
      <div class="row">
        <button onClick={() => renamePessimistic(nextName())}>Rename (affects)</button>
        <button onClick={() => renameOptimistic(nextName())}>Rename (optimistic)</button>
      </div>
    </div>
  )
}
