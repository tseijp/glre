import pages from '@hono/vite-cloudflare-pages'
import honox from 'honox/vite'
import client from 'honox/vite/client'
import { defineConfig } from 'vite'
import { getPlatformProxy } from 'wrangler'

// @ts-ignore
export default defineConfig(async ({ mode }) => {
        if (mode === 'client') {
                return {
                        build: {
                                rollupOptions: {
                                        input: [
                                                // './app/style.css',
                                                './app/client.ts',
                                        ],
                                        output: {
                                                entryFileNames:
                                                        'static/client.js',
                                                chunkFileNames:
                                                        'static/assets/[name]-[hash].js',
                                                assetFileNames:
                                                        'static/assets/[name].[ext]',
                                        },
                                },
                        },
                        plugins: [client()],
                }
        } else {
                const { env, dispose } = await getPlatformProxy()

                return {
                        server: {
                                watch: {
                                        ignored: [/\.wrangler/, /\.mf/],
                                },
                        },
                        ssr: {
                                external: ['react', 'react-dom'],
                        },
                        plugins: [
                                honox({
                                        // devServer: {
                                        //         env,
                                        //         plugins: [
                                        //                 {
                                        //                         onServerClose:
                                        //                                 dispose,
                                        //                 },
                                        //         ],
                                        // },
                                }),
                                pages(),
                        ],
                }
        }
})
