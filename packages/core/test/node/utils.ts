import { Fn } from '../../src/node'
import type { NodeConfig } from '../../src/node'

export const fnResult = (callback: () => any) => {
        const config = {} as NodeConfig
        const ret = Fn(callback).setLayout({ name: 'fn', type: 'auto' })()
        const run = ret.toString(config)
        const def = config.headers?.get('fn')
        return [run, def] // ['fn()', 'void fn() {}']
}
