---
marp: true
hide_table_of_contents: true
title: 'Introduction'
description: 'Introduction'
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Introduction

## What does it look like?

<table>
  <tbody>
    <tr>
      <td width="7500px" align="center" valign="center">
        glre simplifies glsl programming via TypeScript, React, Solid and more (<a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">live demo</a>).
      </td>
      <td width="2500px" valign="top">
        <a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">
          <img alt="4" src="https://i.imgur.com/Lb3h9fs.jpg"></img>
        </a>
      </td>
    </tr>
  </tbody>
</table>

```ts
import { createRoot } from 'react-dom/client'
import { useGL } from 'glre/react'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const gl = useGL({ fragment })
        return <canvas ref={gl.ref} />
}

createRoot(document.getElementById('root')).render(<App />)
```

## react-native supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-react-native-test-k2vfvk))

```ts
import { GLView } from 'expo-gl'
import { useGL } from 'glre/native'
import { registerRootComponent } from 'expo'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const { gl, ref } = useGL({
                fragment,
                render() {
                        gl.flush()
                        gl.endFrameEXP()
                },
        })
        return <GLView style={{ flex: 1 }} onContextCreate={ref} />
}

registerRootComponent(App)
```

## solid js supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-solid-test-qgzhxh))

```ts
import { render } from 'solid-js/web'
import { onGL } from 'glre/solid'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const gl = onGL({ fragment })
        return <canvas ref={gl.ref} />
}

render(() => <App />, document.getElementById('root'))
```

## pure js supported ([codesandbox demo](https://codesandbox.io/s/glre-basic-demo3-3bhr3y))

```html
<canvas id="canvas" style="top: 0; left: 0; position: fixed" />
<script type="module">
        import self from 'https://cdn.skypack.dev/glre@latest'
        const fragment = `
          precision highp float;
          uniform vec2 iResolution;
          void main() {
            gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
          }
        `
        function App() {
                const el = document.getElementById('canvas')
                const gl = el.getContext('webgl2')
                self({ el, gl, fragment }).mount
        }
        document.addEventListener('DOMContentLoaded', App)
</script>
```
