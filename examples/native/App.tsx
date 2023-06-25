import React from 'react'
import { View } from 'react-native'
import { GLView } from 'expo-gl'
import { createProgram, createShader } from 'glre/utils'

const vs = `
  void main(void) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 150.0;
  }
`
const fs = `
  void main(void) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`

export default function App() {
        return (
                <View
                        style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                        }}
                >
                        <GLView
                                style={{ width: 300, height: 300 }}
                                onContextCreate={onContextCreate}
                        />
                </View>
        )
}

function onContextCreate(gl) {
        createProgram(
                gl,
                createShader(gl, vs, gl.VERTEX_SHADER),
                createShader(gl, fs, gl.FRAGMENT_SHADER)
        )
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 1, 1, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.POINTS, 0, 1)
        gl.flush()
        gl.endFrameEXP()
}
