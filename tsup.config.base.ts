import type { Options } from 'tsup'

/**
 * ref: https://github.com/pmndrs/react-spring/blob/main/tsup.config.base.ts
 */
interface BuildTarget {
        format: 'cjs' | 'esm'
        dts?: object
}

const BUILD_TARGETS: BuildTarget[] = [
        {
                format: 'cjs',
        },
        {
                format: 'esm',
                // https://github.com/egoist/tsup/issues/618
                dts: {
                        compilerOptions: {
                                moduleResolution: 'node',
                        },
                },
        },
]

export interface Config {
        (options: Options): Options
}

export const defaultConfig = (override: Options, options: Options) => {
        const ret: Options[] = BUILD_TARGETS.map((target) => {
                return {
                        ...options,
                        ...target,
                        ...override,
                        outDir: './dist',
                        splitting: false,
                        sourcemap: !options.watch,
                        clean: !options.watch,
                        minify: !options.watch,
                        target: 'es2020',
                        external: ['react', 'react-dom', 'react-native', 'reev', 'refr'],
                        moduleResolution: 'NodeNext',
                }
        })

        return ret
}
