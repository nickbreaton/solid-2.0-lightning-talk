<script setup lang="ts">
// Highlights exact pieces of code (e.g. "user()") inside the code block it
// wraps, once the slide reaches click `at`. Slidev's built-in highlighting is
// line-based; this dims everything *except* the given words using the CSS
// Custom Highlight API, so it never touches the DOM (safe inside magic-move).
//
//   <WordHighlight :word="['count()', 'doubled()']" within="{count()} × 2" :at="5">
//
// `within` limits matching to the first occurrence of that snippet; `until`
// turns the highlight back off from that click on.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const props = withDefaults(defineProps<{ word: string | string[]; within?: string; at?: number; until?: number }>(), { at: 1 })
const { $clicks } = useSlideContext()
const root = ref<HTMLElement>()
const on = computed(() => $clicks.value >= props.at && (props.until === undefined || $clicks.value < props.until))

// One highlight shared by every instance; each instance adds/removes its own ranges.
function registry(): Highlight | undefined {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return
  let hl = CSS.highlights.get('word-dim')
  if (!hl) CSS.highlights.set('word-dim', (hl = new Highlight()))
  return hl
}

let ranges: Range[] = []

function clear() {
  const hl = registry()
  ranges.forEach(r => hl?.delete(r))
  ranges = []
}

function apply() {
  clear()
  const hl = registry()
  const pre = root.value?.querySelector('pre')
  if (!hl || !pre) return

  // Flatten the code's text nodes, remembering where each one starts.
  const nodes: { node: Text; start: number }[] = []
  let text = ''
  const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    nodes.push({ node, start: text.length })
    text += node.data
  }

  // Character spans to keep bright.
  const scopeStart = props.within ? Math.max(0, text.indexOf(props.within)) : 0
  const scopeEnd = props.within ? scopeStart + props.within.length : text.length
  const keep: [number, number][] = []
  for (const word of [props.word].flat()) {
    for (let i = text.indexOf(word, scopeStart); i !== -1 && i + word.length <= scopeEnd; i = text.indexOf(word, i + 1))
      keep.push([i, i + word.length])
  }
  keep.sort((a, b) => a[0] - b[0])

  // Dim the complement.
  const at = (pos: number): [Text, number] => {
    let n = nodes[0]
    for (const candidate of nodes) if (candidate.start <= pos) n = candidate
    return [n.node, pos - n.start]
  }
  let cursor = 0
  for (const [from, to] of [...keep, [text.length, text.length] as [number, number]]) {
    if (from > cursor) {
      const range = new Range()
      range.setStart(...at(cursor))
      range.setEnd(...at(from))
      ranges.push(range)
      hl.add(range)
    }
    cursor = Math.max(cursor, to)
  }
}

watch(on, async value => {
  if (!value) return clear()
  await nextTick()
  apply()
}, { immediate: true })
onBeforeUnmount(clear)
</script>

<template>
  <div ref="root" class="word-highlight"><slot /></div>
</template>
