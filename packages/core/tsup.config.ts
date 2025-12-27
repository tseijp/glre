import { defineConfig } from 'tsup'
import type { Options } from 'tsup'
import type { Plugin } from 'esbuild'

/**
 * Internal modules to exclude from framework bundles
 */
const BUILD_TARGETS: Options[] = [{ format: 'cjs' }, { format: 'esm', dts: { compilerOptions: { moduleResolution: 'node' } } }]

const BASE_CONFIG: Options = {
        outDir: './dist',
        splitting: false,
        target: 'es2020',
        external: ['react', 'react-dom', 'react-native', 'reev', 'refr'],
}

const MODULE_ENTRIES = {
        addons: 'src/addons/index.ts',
        buffers: 'src/buffers/index.ts',
        node: 'src/node/index.ts',
        index: 'src/index.ts',
        native: 'src/native.ts',
        react: 'src/react.ts',
        solid: 'src/solid.ts',
} as const

type ModuleEntriesKey = keyof typeof MODULE_ENTRIES

const MODULE_ENTRIES_KEYS = Object.keys(MODULE_ENTRIES) as ModuleEntriesKey[]

/**
 * Get exclusion patterns for each entry point
 */
const isEntryPoint = (kind: string) => kind === 'entry-point'

const isModuleEntry = (path: string) => MODULE_ENTRIES_KEYS.some((p) => path.includes(p))

const createPlugin = (entry: string, ext: string): Plugin => {
        return {
                name: `exclude-internal-${entry}`,
                setup(build) {
                        build.onResolve({ filter: /.*/ }, ({ kind, path }) => {
                                if (isEntryPoint(kind)) return
                                if (!isModuleEntry(path)) return
                                path = path.replace(/^\.\.\//, './')
                                path += ext
                                return { path, external: true }
                        })
                },
        }
}

/**
 * Create build configuration for each entry point
 */
const createConfig = (options: Options, entry: ModuleEntriesKey): Options[] => {
        return BUILD_TARGETS.map((target) => {
                const ext = target.format === 'cjs' ? '.cjs' : '.js'
                return {
                        ...options,
                        ...target,
                        ...BASE_CONFIG,
                        entry: { [entry]: MODULE_ENTRIES[entry] },
                        esbuildPlugins: [createPlugin(entry, ext)],
                        sourcemap: !options.watch,
                        clean: !options.watch,
                        minify: !options.watch,
                }
        })
}

export default defineConfig((options) => {
        return MODULE_ENTRIES_KEYS.map(createConfig.bind(null, options)).flat()
})
