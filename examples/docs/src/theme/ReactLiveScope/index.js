import React from 'react'
import * as GLRE from 'glre/src/react'
import * as REGE from 'rege/react'
import { useControls } from 'leva'
import { resize } from '../../../utils'

const ReactLiveScope = {
        React,
        resize,
        ...React,
        ...GLRE,
        ...REGE,
        useControls,
}

export default ReactLiveScope
