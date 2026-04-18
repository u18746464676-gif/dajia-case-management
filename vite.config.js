import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
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
    VitePWA({
      registerType: 'prompt',
      updateViaCache: 'none',
      injectRegister: false,
      includeAssets: ['guohui.png', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        id: './',
        name: '打假案件管理系统',
        short_name: '案件管理',
        description: '案件处置工作台 — 循法而行，据证而断',
        lang: 'zh-CN',
        dir: 'ltr',
        theme_color: '#1e293b',
        background_color: '#f8fafc',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        orientation: 'any',
        scope: './',
        start_url: './',
        categories: ['productivity', 'utilities'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: '案件列表',
            short_name: '列表',
            description: '快速进入案件列表首页',
            url: './#/'
          },
          {
            name: '新建案件',
            short_name: '新建',
            description: '直接录入新的案件信息',
            url: './#/case/new'
          },
          {
            name: '系统设置',
            short_name: '设置',
            description: '查看同步与系统配置',
            url: './#/settings'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        swDest: 'sw.js',
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: ({ request, url }) => (
              ['style', 'script', 'worker'].includes(request.destination)
              || /\.(?:js|css)$/i.test(url.pathname)
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url, request }) => request.method === 'GET' && isApiRequest({ url, request }),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-get-network-first',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 15,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: ({ url, request }) => request.method !== 'GET' && isApiRequest({ url, request }),
            handler: 'NetworkOnly',
          },
        ]
      }
    })
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
