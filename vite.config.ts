import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import react from '@vitejs/plugin-react'

// Slidev itself is Vue. Live demos are compiled by their own framework's JSX
// plugin, scoped by directory so the two JSX transforms never overlap.
export default defineConfig({
  plugins: [
    solid({ include: /demos\/solid\/.*\.[jt]sx$/ }),
    react({ include: /demos\/react\/.*\.[jt]sx$/ }),
  ],
})
