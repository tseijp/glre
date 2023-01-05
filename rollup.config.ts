import path from 'path'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const _babelOptions = () => {
        const presets = [
                ['@babel/preset-env', { loose: true, modules: false }],
                '@babel/preset-react',
                '@babel/preset-typescript'
        ]
        return {
                babelrc: false,
                babelHelpers: 'bundled',
                comments: false,
                extensions,
                ignore: ['**/node_modules/**'],
                presets,
        }
}

module.exports = () => {
        const cwd = process.cwd();
        const pkg = require(path.resolve(cwd, './package.json'))
        const input = 'index.ts'
        const external = Object.keys({...pkg.dependencies, ...pkg.devDependencies})
        const _plugins = () => [ // @ts-ignore
                babel(_babelOptions()),
                commonjs({ extensions }),
                resolve({ extensions }),
                terser()
        ]
        const _config = (file = '', format = '', other = {}) => {
                const ret = { input, output: { file, format }, ...other }
                // @ts-ignore
                if (format === "umd") ret.output.name = input
                return ret
        }
        return [
                _config(pkg.umd, 'umd', { external, plugins: _plugins() }),
                _config(pkg.main, 'cjs', { external, plugins: _plugins() }),
                _config(pkg.module, 'esm', { external, plugins: _plugins() }),
        ]
}