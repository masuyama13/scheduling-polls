import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SERVICE_NAME } from './src/config/appConfig.ts'

// index.html cannot import appConfig.ts directly, so inject the shared service name at build time.
const serviceNamePlugin = {
  name: 'service-name',
  transformIndexHtml(html: string) {
    return html.replaceAll('%SERVICE_NAME%', SERVICE_NAME)
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceNamePlugin],
})
