import { defineConfig } from 'tsup'
import type { Options } from 'tsup'
import type { Plugin } from 'esbuild'

/**
 * Internal modules to exclude from framework bundles
 */
const INTERNAL_MODULES = ['./node', './utils', './index', './types', './webgl', './webgpu']
const FRAMEWORK_ENTRIES = ['react', 'native', 'solid']

const BUILD_TARGETS: Options[] = [
        { format: 'cjs' },
        {
                format: 'esm',
                dts: { compilerOptions: { moduleResolution: 'node' } },
        },
]

const BASE_CONFIG: Options = {
        outDir: './dist',
        splitting: false,
        target: 'es2020',
        external: ['react', 'react-dom', 'react-native', 'reev', 'refr'],
}

const createConfig = (override: Options, options: Options): Options[] =>
        BUILD_TARGETS.map((target) => ({
                ...options,
                ...target,
                ...override,
                ...BASE_CONFIG,
                sourcemap: !options.watch,
                clean: !options.watch,
                minify: !options.watch,
        }))

/**
 * Check if module path should be treated as external
 */
const isExternalModule = (path: string) => !INTERNAL_MODULES.some((pattern) => path.startsWith(pattern))

const createExcludePlugin = (entryName: string): Plugin => ({
        name: `exclude-internal-${entryName}`,
        setup(build) {
                build.onResolve({ filter: /.*/ }, (args) => {
                        if (args.kind === 'entry-point') return
                        if (isExternalModule(args.path)) return
                        if (args.path === './index') args.path = './index.js'
                        return { path: args.path, external: true }
                })
        },
})

export default defineConfig((options) => {
        const indexConfig = createConfig({ entry: ['src/index.ts'] }, options)
        const entryConfigs = FRAMEWORK_ENTRIES.map((framework) => {
                return createConfig(
                        {
                                entry: [`src/${framework}.ts`],
                                esbuildPlugins: [createExcludePlugin(framework)],
                        },
                        options
                )
        })

        return [...indexConfig, ...entryConfigs.flat()]
})
