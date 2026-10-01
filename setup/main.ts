// @vitejs/plugin-react expects its Fast Refresh preamble to run before any
// module it transforms, but Slidev serves its own index.html. Load it here,
// ahead of any slide (and therefore any demo) being imported.
import '@vitejs/plugin-react/preamble'
import { defineAppSetup } from '@slidev/types'

export default defineAppSetup(() => {})
