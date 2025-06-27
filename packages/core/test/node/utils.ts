import { Fn, infer } from '../../src/node'
import type { NodeConfig, X } from '../../src/node'

export const fnResult = (callback: () => any) => {
        const config = {} as NodeConfig
        const ret = Fn(callback).setLayout({ name: 'fn', type: 'auto' })()
        ret.toString(config)
        const def = config.headers?.get('fn')
        return def
}

export const inferAndCode = (x: X) => {
        const type = infer(x)
        const wgsl = `${x}`
        return { type, wgsl }
}
