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

const width = computed(() => Math.max(props.scale, ...entries.value.map(e => e.end ?? now.value)))
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
          :class="{ inflight: e.end === undefined }"
          :style="{ left: pct(e.start), width: pct((e.end ?? now) - e.start) }"
        />
      </span>
    </div>
  </div>
</template>
