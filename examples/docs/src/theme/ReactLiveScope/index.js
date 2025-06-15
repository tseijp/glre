import React from 'react'
import { useGL } from 'glre/src/react'
import { useControls } from 'leva'
import { resize } from '../../../utils'

const ReactLiveScope = {
        React,
        resize,
        ...React,
        useGL,
        useControls,
}

export default ReactLiveScope
