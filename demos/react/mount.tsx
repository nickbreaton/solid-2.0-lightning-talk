import { createRoot } from 'react-dom/client'
import type { ComponentType } from 'react'

export function mount(Component: ComponentType<any>, el: HTMLElement, props: Record<string, unknown> = {}) {
  const root = createRoot(el)
  root.render(<Component {...props} />)
  return () => root.unmount()
}
