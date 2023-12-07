# 🌇 glre

<strong>
<samp>


<p align="center">

[![ npm version ](https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000)](https://www.npmjs.com/package/glre)
[![ downloads ](https://img.shields.io/npm/dm/glre.svg?style=flat&colorA=000&colorB=000)](https://www.npmtrends.com/glre)
[![ license MIT ](https://img.shields.io/npm/l/glre?style=flat&colorA=000&colorB=000)](https://github.com/tseijp/glre)
[![ docs available ](https://img.shields.io/badge/docs-available-000.svg?style=flat&colorA=000)](https://glre.tsei.jp/>)
[![ bundle size ](https://img.shields.io/bundlephobia/minzip/glre?style=flat&colorA=000&colorB=000)](https://bundlephobia.com/package/glre@latest)

glre is a simple glsl Reactive Engine on the web and native via TypeScript, React, Solid and more.

</p>
<p align="center" valign="top">
  <a href="https://codesandbox.io/s/glre-test1-skyl9p">
    <img alt="test1" width="256" src="https://user-images.githubusercontent.com/40712342/212297558-15a1e721-55d6-4b6f-aab4-9f5d7cede2cb.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-test2-c1syho">
    <img alt="test2" width="256" src="https://user-images.githubusercontent.com/40712342/212297576-e12cef1b-b0e0-40cb-ac0f-7fb387ae6da8.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-test3-ntlk3l">
    <img alt="test3" width="256" src="https://user-images.githubusercontent.com/40712342/212297587-0227d536-5cef-447a-be3e-4c93dad002a2.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test-q8pyxv" target="_blank" rel="noopener">
    <img alt="raymarch1" width="256" src="https://user-images.githubusercontent.com/40712342/215024903-90f25934-1018-4f2a-81e6-f16e5c64c378.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test2-fcds29" target="_blank" rel="noopener">
    <img alt="raymarch2" width="256" src="https://user-images.githubusercontent.com/40712342/215024942-27766b2b-7b85-4725-bb3d-865bf137ea29.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test3-nx6ggi" target="_blank" rel="noopener">
    <img alt="raymarch3" width="256" src="https://user-images.githubusercontent.com/40712342/215025052-c2fa46e5-5e0e-4de8-baee-869ca6135a61.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test4-cy1wpp" target="_blank" rel="noopener">
    <img alt="raymarch4" width="256" src="https://user-images.githubusercontent.com/40712342/215025289-132b4213-aabc-48f2-bbe3-05764a8dae42.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test5-19v0g7" target="_blank" rel="noopener">
    <img alt="raymarch5" width="256" src="https://user-images.githubusercontent.com/40712342/215025456-8ab75328-ca7a-41f6-b5fe-98dd58410b38.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-raymarch-test6-jew0it" target="_blank" rel="noopener">
    <img alt="raymarch6" width="256" src="https://user-images.githubusercontent.com/40712342/215025517-343fdfbf-af54-497c-a759-267acc450366.gif"></img>
  </a>
</p>

## Installation

```ruby
npm install glre
```

<table>
<td width="1000px" valign="top">

## Documentation

###### [Docs][docs] : glre Introduction

###### [API][api] : glre API and feature

###### [Guide][guide] : Creating a scene

[docs]: https://glre.tsei.jp/docs
[api]: https://glre.tsei.jp/api
[guide]: https://glre.tsei.jp/guide

</td>
<td width="1000px" valign="top">

## Ecosystem

###### ⛪️ [reev][reev]: reactive event state manager

###### 🌃 [refr][refr]: request animation frame

[reev]: https://github.com/tseijp/reev
[refr]: https://github.com/tseijp/refr

</td>
<td width="1000px" valign="top">

## Staying informed

###### [github discussions][github] welcome✨

###### [@tseijp][twitter] twitter

###### [tsei.jp][articles] articles

[github]: https://github.com/tseijp/glre/discussions
[twitter]: https://twitter.com/tseijp
[articles]: https://tsei.jp/articles

</td>
</table>

## PRs

###### welcome✨

## What does it look like?

<table>
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
</table>

```ts
import { createRoot } from 'react-dom/client'
import { useGL, useFrame } from 'glre/react'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const gl = useGL({ fragment })
        useFrame(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
        return <canvas ref={gl.ref} />
}

createRoot(document.getElementById('root')).render(<App />)
```

<details>
<summary>

react-native supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-react-native-test-k2vfvk))

</summary>

```ts
import { GLView } from 'expo-gl'
import { useGL, useFrame } from 'glre/native'
import { registerRootComponent } from 'expo'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const self = useGL({ fragment })
        useFrame(() => {
                self.clear()
                self.viewport()
                self.drawArrays()
                self.gl.flush()
                self.gl.endFrameEXP()
        })
        return <GLView style={{ flex: 1 }} onContextCreate={self.ref} />
}

registerRootComponent(App)
```

</details>
<details>
<summary>

solid js supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-solid-test-qgzhxh))

</summary>

```ts
import { render } from 'solid-js/web'
import { onGL, onFrame } from 'glre/solid'

const fragment = `
precision highp float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const App = () => {
        const gl = onGL({ fragment })
        onFrame(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
        return <canvas ref={gl.ref} />
}

render(() => <App />, document.getElementById('root'))
```

</details>
<details>
<summary>

pure js supported ([codesandbox demo](https://codesandbox.io/s/glre-basic-demo3-3bhr3y))

</summary>

```html
<canvas id="id" style="top: 0; left: 0; position: fixed" />
<script type="module">
        import self from 'https://cdn.skypack.dev/glre@latest'
        const fragment = `
          precision highp float;
          uniform vec2 iResolution;
          void main() {
            gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
          }
        `
        function setup() {
                const el = document.getElementById('id')
                const gl = el.getContext('webgl2')
                self({ el, gl, fragment })
                self.init()
                self.resize()
                draw()
        }
        function draw() {
                requestAnimationFrame(draw)
                self.render()
                self.clear()
                self.viewport()
                self.drawArrays()
        }
        document.addEventListener('DOMContentLoaded', setup)
</script>
```

</details>
</samp>
</strong>
