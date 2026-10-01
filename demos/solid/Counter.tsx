/** @jsxImportSource @solidjs/web */
import { createMemo, createSignal } from 'solid-js'

// Plain synchronous state, so the async slide that follows reads as "same shape".
export default function Counter() {
  const [count, setCount] = createSignal(0)
  const doubled = createMemo(() => count() * 2)

  console.log(count())

  return (
    <button onClick={() => setCount(count() + 1)}>
      {count()} × 2 = {doubled()}
    </button>
  )
}
