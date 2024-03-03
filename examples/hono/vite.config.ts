import pages from '@hono/vite-cloudflare-pages'
import honox from 'honox/vite'
import client from 'honox/vite/client'
import { defineConfig } from 'vite'

// @ts-ignore
export default defineConfig(({ mode }) => {
        if (mode === 'client') {
                return {
                        plugins: [client()],
                }
        } else {
                return {
                        ssr: {
                                external: ['react', 'react-dom'],
                        },
                        plugins: [honox(), pages()],
                }
        }
})
