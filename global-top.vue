<script setup lang="ts">
// A subtle count-up timer on every slide. It uses Slidev's shared stopwatch,
// so it stays in sync with presenter mode (whose controls reset/pause it).
// Starts on first load; click to pause/resume, right-click to reset to 0:00.
import { computed, onMounted } from 'vue'
import { useTimer } from '@slidev/client/composables/useTimer.ts'

const { timer, status, resume, reset, toggle } = useTimer()

function restart() {
  reset()
  resume()
}

onMounted(() => {
  if (status.value !== 'running' && status.value !== 'paused') resume()
})

const label = computed(() => {
  const { h, m, s } = timer.value
  return h ? `${h}:${m}:${s}` : `${m}:${s}`
})
</script>

<template>
  <button class="slide-timer" :class="{ paused: status === 'paused' }" title="Click to pause/resume · right-click to reset" @click="toggle" @contextmenu.prevent="restart">
    {{ label }}
  </button>
</template>

<style>
.slide-timer {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  z-index: 10;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.3;
  transition: opacity 150ms;
}
.slide-timer:hover { opacity: 0.7; }
.slide-timer.paused { opacity: 0.15; }
</style>
