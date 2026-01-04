import React from 'react'
import * as GLRE0 from 'glre/src/react'
import * as GLRE1 from 'glre/src/node'
import * as GLRE2 from 'glre/src/addons'
import * as GLRE3 from 'glre/src/buffers'
import { useDrag } from 'reev/gesture/drag/react'
import { useHover } from 'reev/gesture/hover/react'
import { usePinch } from 'reev/gesture/pinch/react'
import { mat4 as m } from 'gl-matrix'
import { vec3 as v } from 'gl-matrix'
import { useControls } from 'leva'
import { resize } from '../../../utils'

const ReactLiveScope = {
        React,
        resize,
        ...React,
        ...GLRE0,
        ...GLRE1,
        ...GLRE2,
        ...GLRE3,
        m,
        v,
        useControls,
        useDrag,
        useHover,
        usePinch,
}

export default ReactLiveScope
