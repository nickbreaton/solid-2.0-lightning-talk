<script setup lang="ts">
// A tiny DevTools-style network waterfall fed by demos/api.ts.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { elapsed, requestLog, subscribe, type RequestEntry } from '../demos/api'

const props = withDefaults(defineProps<{ scale?: number; filter?: string }>(), { scale: 3000 })

const now = ref(0)
const entries = ref<RequestEntry[]>([])
let raf = 0

function sync() {
  entries.value = requestLog
    .filter(e => !props.filter || new RegExp(props.filter).test(e.label))
    .map(e => ({ ...e }))
}

function tick() {
  now.value = elapsed()
  raf = requestAnimationFrame(tick)
}

let unsubscribe: () => void
onMounted(() => {
  unsubscribe = subscribe(sync)
  sync()
  tick()
})
onBeforeUnmount(() => {
  unsubscribe?.()
  cancelAnimationFrame(raf)
})

// Idle time (no request in flight) is cut out of the timeline: real time is
// mapped onto "busy time", so gaps like waiting for a click collapse to zero.
const busy = computed(() => {
  const spans = entries.value
    .map(e => [e.start, e.end ?? now.value] as [number, number])
    .sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of spans) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return merged
})

function compress(t: number) {
  let total = 0
  for (const [start, end] of busy.value) {
    if (t <= start) break
    total += Math.min(t, end) - start
  }
  return total
}

const width = computed(() => Math.max(props.scale, ...busy.value.map(([, end]) => compress(end))))
const pct = (ms: number) => `${(ms / width.value) * 100}%`
</script>

<template>
  <div class="network">
    <div class="network-title">Network</div>
    <div v-if="!entries.length" class="network-empty">no requests yet</div>
    <div v-for="e in entries" :key="e.id" class="network-row">
      <span class="network-label">{{ e.label }}</span>
      <span class="network-track">
        <span
          class="network-bar"
          :class="{ inflight: e.end === undefined, failed: e.failed }"
          :style="{ left: pct(compress(e.start)), width: pct(compress(e.end ?? now) - compress(e.start)) }"
        />
      </span>
    </div>
  </div>
</template>
