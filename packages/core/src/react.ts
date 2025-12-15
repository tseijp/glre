import { useState } from 'react'
import { createGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (...args: Partial<GL>[]) => {
        return useState(() => createGL(...args))[0]
}
