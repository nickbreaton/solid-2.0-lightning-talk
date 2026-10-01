/** @jsxImportSource @solidjs/web */
import { render } from '@solidjs/web'

export function mount(Component: (props: any) => any, el: HTMLElement, props: Record<string, unknown> = {}) {
  return render(() => <Component {...props} />, el)
}
