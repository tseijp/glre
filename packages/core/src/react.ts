import { useState } from 'react'
import { createGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (...args: Partial<GL>[]) => {
        const [, set] = useState(null) // for error boundary // ref: https://github.com/facebook/react/issues/14981
        if (args[0] && !args[0].error)
                args[0].error = (error = '') =>
                        set(() => {
                                throw new Error(error)
                        })
        return useState(() => createGL(...args))[0]
}
