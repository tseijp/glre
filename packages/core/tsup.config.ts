import { defineConfig } from 'tsup'
import type { Options } from 'tsup'
import type { Plugin } from 'esbuild'

/**
 * Internal modules to exclude from framework bundles
 */
const INTERNAL_MODULES = ['./node', './utils', './index', './types', './webgl', './webgpu']

const FRAMEWORK_ENTRIES = ['index', 'react', 'native', 'solid']

const BUILD_TARGETS: Options[] = [
        { format: 'cjs' },
        { format: 'esm', dts: { compilerOptions: { moduleResolution: 'node' } } },
]

const BASE_CONFIG: Options = {
        outDir: './dist',
        splitting: false,
        target: 'es2020',
        external: ['react', 'react-dom', 'react-native', 'reev', 'refr'],
}

/**
 * Check if module path should be treated as external
 */
const isExternalModule = (path: string) => !INTERNAL_MODULES.some((str) => path.startsWith(str))

const createExcludePlugin = (entry: string): Plugin => {
        return {
                name: `exclude-internal-${entry}`,
                setup(build) {
                        build.onResolve({ filter: /.*/ }, (args) => {
                                if (args.kind === 'entry-point') return
                                if (isExternalModule(args.path)) return
                                if (args.path === './index') args.path = './index.js'
                                return { path: args.path, external: true }
                        })
                },
        }
}

/**
 * Create build configuration for each entry point
 */
const createConfig = (options: Options, entry: string): Options[] => {
        return BUILD_TARGETS.map((target) => ({
                ...options,
                ...target,
                ...BASE_CONFIG,
                entry: [`src/${entry}.ts`],
                esbuildPlugins: entry === 'index' ? void 0 : [createExcludePlugin(entry)],
                sourcemap: !options.watch,
                clean: !options.watch,
                minify: !options.watch,
        }))
}

export default defineConfig((options) => {
        return FRAMEWORK_ENTRIES.map(createConfig.bind(null, options)).flat()
})
