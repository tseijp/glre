import React from 'react'
import * as GLRE0 from 'glre/src/react'
import * as GLRE1 from 'glre/src/node'
import * as REGE from 'rege/react'
import { useControls } from 'leva'
import { resize } from '../../../utils'

const ReactLiveScope = {
        React,
        resize,
        ...React,
        ...GLRE0,
        ...GLRE1,
        ...REGE,
        useControls,
}

export default ReactLiveScope
