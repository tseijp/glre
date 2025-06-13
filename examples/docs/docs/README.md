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
import { useGL, vec4, fract, fragCoord, iResolution } from 'glre/react'
const frag = vec4(fract(fragCoord.xy / iResolution), 0, 1)

const App = () => {
        const gl = useGL({ frag })
        return <canvas ref={gl.ref} />
}

createRoot(document.getElementById('root')).render(<App />)
```

## react-native supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-react-native-test-k2vfvk))

```ts
import { GLView } from 'expo-gl'
import { registerRootComponent } from 'expo'
import { useGL, vec4, fract, fragCoord, iResolution } from 'glre/native'
const frag = vec4(fract(fragCoord.xy / iResolution), 0, 1)

const App = () => {
        const { gl, ref } = useGL({ frag })
        return <GLView style={{ flex: 1 }} onContextCreate={ref} />
}

registerRootComponent(App)
```

## solid js supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-solid-test-qgzhxh))

```ts
import { render } from 'solid-js/web'
import { onGL, vec4, fract, fragCoord, iResolution } from 'glre/solid'
const frag = vec4(fract(fragCoord.xy / iResolution), 0, 1)

const App = () => {
        const gl = onGL({ frag })
        return <canvas ref={gl.ref} />
}

render(() => <App />, document.getElementById('root'))
```

## esm supported ([codesandbox demo](https://codesandbox.io/s/glre-basic-demo3-3bhr3y))

```html
<script type="module">
        import createGL from 'https://esm.sh/glre'
        import { vec4, fract, fragCoord, iResolution } from 'https://esm.sh/glre'
        const frag = vec4(fract(fragCoord.xy / iResolution), 0, 1)
        function App() {
                const el = document.createElement('canvas')
                createGL({ el, frag }).mount()
                document.body.append(el)
        }
        document.addEventListener('DOMContentLoaded', App)
</script>
```
