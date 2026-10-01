/** @jsxImportSource @solidjs/web */
import { createMemo, createSignal, For, isPending, Loading } from 'solid-js'
import { fetchCities, fetchCounties, states } from '../api'

// Slide 9: state → counties (async) → county (writable derived)
//                 → cities (async) → city (writable derived)
export default function Demo() {
  const [state, setState] = createSignal('NC')
  const counties = createMemo(() => fetchCounties(state()))
  const [county, setCounty] = createSignal(() => counties()[0].id)
  const cities = createMemo(() => fetchCities(county()))
  const [city, setCity] = createSignal(() => cities()[0].id)

  return (
    <Loading fallback={<div class="card skeleton">Loading…</div>}>
      <div class="cascade">
        <label>State</label>
        <select onChange={e => setState(e.currentTarget.value)}>
          <For each={states}>{s => <option value={s.id} selected={s.id === state()}>{s.name}</option>}</For>
        </select>
        <span />

        <label>County</label>
        <select class={{ pending: isPending(() => county()) }} onChange={e => setCounty(e.currentTarget.value)}>
          <For each={counties()}>{c => <option value={c.id} selected={c.id === county()}>{c.name}</option>}</For>
        </select>
        <span class="muted">{isPending(() => county()) ? 'updating…' : ''}</span>

        <label>City</label>
        <select class={{ pending: isPending(() => city()) }} onChange={e => setCity(e.currentTarget.value)}>
          <For each={cities()}>{c => <option value={c.id} selected={c.id === city()}>{c.name}</option>}</For>
        </select>
        <span class="muted">{isPending(() => city()) ? 'updating…' : ''}</span>
      </div>
    </Loading>
  )
}
