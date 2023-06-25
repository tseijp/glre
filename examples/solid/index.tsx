import { render } from 'solid-js/web'
import { createGL } from 'glre/solid'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

const iResolution = 1

const _defaultVertex = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

const _defaultFragment = `
  precision mediump float;
  uniform vec2 resolution;
  void main() {
    gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
  }
`

const App = () => {
        const self = createGL({
                fragment: _defaultFragment,
                vertex: _defaultVertex,
                count: 6,
                mount() {
                        self.attribute({ a_position })
                        self.uniform({ iResolution })
                },
                render() {
                        const gl = self.gl
                        gl.viewport(0, 0, ...self.size)
                        gl.clear(gl.COLOR_BUFFER_BIT)
                        gl.drawArrays(gl.TRIANGLES, 0, self.count)
                        return true
                },
        })
        return (
                <canvas
                        ref={self.ref}
                        style={{
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                position: 'fixed',
                                background: '#e2e2e2',
                        }}
                />
        )
}

render(() => <App />, document.getElementById('root')!)
