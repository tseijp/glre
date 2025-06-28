import { Fn, infer } from './src/node'
import type { NodeContext, X } from './src/node'

export const build = (fun: () => any) => {
        const config = {} as NodeContext
        const ret = Fn(fun).setLayout({ name: 'fn', type: 'auto' })()
        ret.toString(config)
        const def = config.headers?.get('fn')
        return def
}

export const inferAndCode = (x: X) => {
        const type = infer(x)
        const wgsl = `${x}`
        return { type, wgsl }
}
