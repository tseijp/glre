import { createGL } from './index'
import type { GL } from './types'
export * from './index'

export const onGL = (...args: Partial<GL>[]) => {
        return createGL(...args)
}
