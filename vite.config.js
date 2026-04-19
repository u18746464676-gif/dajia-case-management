import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const apiHosts = new Set([
  'hsfovbgeeqomtvaegfqb.supabase.co',
  'poll.kuaidi100.com',
  'ark.cn-beijing.volces.com',
])

function isApiRequest({ url, request }) {
  if (!url || !request) return false

  return apiHosts.has(url.hostname)
    || url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/rest/v1/')
    || url.pathname.startsWith('/storage/v1/')
    || url.pathname.startsWith('/functions/v1/')
}

export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000
  }
})
