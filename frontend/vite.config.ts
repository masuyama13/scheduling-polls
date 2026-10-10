import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SERVICE_NAME } from './src/config/appConfig.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const beaconToken = env.VITE_CLOUDFLARE_BEACON_TOKEN

  // index.html cannot import appConfig.ts directly, so inject shared values at build time.
  const htmlConfigPlugin = {
    name: 'html-config',
    transformIndexHtml(html: string) {
      const beaconScript = beaconToken
        ? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: beaconToken }).replaceAll('&', '&amp;').replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}'></script>`
        : ''

      return html.replaceAll('%SERVICE_NAME%', SERVICE_NAME).replace('<!-- CLOUDFLARE_WEB_ANALYTICS -->', beaconScript)
    },
  }

  return {
    plugins: [react(), tailwindcss(), htmlConfigPlugin],
  }
})
