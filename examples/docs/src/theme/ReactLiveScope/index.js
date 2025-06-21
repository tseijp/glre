import React from 'react'
import * as GLRE from 'glre/src/react'
import { useControls } from 'leva'
import { resize } from '../../../utils'

const ReactLiveScope = {
        React,
        resize,
        ...React,
        ...GLRE,
        useControls,
}

export default ReactLiveScope
