import { defineConfig } from 'vitest/config'

export default defineConfig({
        test: {
                include: ['packages/core/test/**/*.test.ts'],
                exclude: ['node_modules/**', 'dist/**'],
                coverage: {
                        provider: 'v8',
                        include: ['src/node/**/*.ts'],
                        reporter: ['text', 'json', 'html'],
                        reportsDirectory: './logs/coverage',
                },
        },
})
