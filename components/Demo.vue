<script setup lang="ts">
// Mounts a Solid or React demo from /demos into a Vue-owned div.
// Demos only run while their slide is active, and remount fresh on every
// visit, so network timelines always start from zero.
import { onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'
import { resetLog } from '../demos/api'

// `height` reserves the demo's fully loaded height (px) so content arriving
// doesn't push anything below it (like a <Network> waterfall) down the slide.
const props = defineProps<{ name: string; props?: Record<string, unknown>; height?: number }>()

const modules = import.meta.glob(['../demos/solid/*.tsx', '../demos/react/*.tsx', '!**/mount.tsx'])
const mounts = {
  solid: () => import('../demos/solid/mount'),
  react: () => import('../demos/react/mount'),
}

const el = ref<HTMLElement>()
const active = useIsSlideActive()
let dispose: (() => void) | undefined
let generation = 0

async function start() {
  stop()
  const gen = ++generation
  const [framework] = props.name.split('/') as [keyof typeof mounts]
  const load = modules[`../demos/${props.name}.tsx`]
  if (!load) throw new Error(`Unknown demo: ${props.name}`)
  const [mod, { mount }] = await Promise.all([load() as Promise<any>, mounts[framework]()])
  if (gen !== generation || !el.value) return
  resetLog()
  dispose = mount(mod.default, el.value, props.props)
}

function stop() {
  generation++
  dispose?.()
  dispose = undefined
  if (el.value) el.value.innerHTML = ''
}

watch([active, el, () => props.name], ([isActive, node]) => (isActive && node ? start() : stop()), {
  immediate: true,
})
onBeforeUnmount(stop)
</script>

<template>
  <div class="demo-frame" :data-framework="props.name.split('/')[0]">
    <button class="demo-replay" title="Replay demo" @click="start">↻</button>
    <div ref="el" class="demo" :style="height ? { minHeight: `${height}px` } : undefined" />
  </div>
</template>
