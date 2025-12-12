# 🌇 glre

<strong>
<samp>

<p align="center">

[![ npm version ](https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000)](https://www.npmjs.com/package/glre)
[![ downloads ](https://img.shields.io/npm/dm/glre.svg?style=flat&colorA=000&colorB=000)](https://www.npmtrends.com/glre)
[![ license MIT ](https://img.shields.io/npm/l/glre?style=flat&colorA=000&colorB=000)](https://github.com/tseijp/glre)
[![ docs available ](https://img.shields.io/badge/docs-available-000.svg?style=flat&colorA=000)](https://glre.tsei.jp/>)
[![ bundle size ](https://img.shields.io/bundlephobia/minzip/glre?style=flat&colorA=000&colorB=000)](https://bundlephobia.com/package/glre@latest)

glre is a simple glsl and wgsl Reactive Engine on the web and native via TypeScript, React, Solid and more.

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

###### 🔮 [refr][refr]: request animation frame

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

## What does it look like?

<table>
  <tbody>
    <tr>
      <td width="7500px" align="center" valign="center">
        glre simplifies WebGl2 / WebGPU programming via TypeScript, React, Solid and more (<a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">live demo</a>).
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
import { vec4, uv } from 'glre/node'
const Canvas = () => {
        const gl = useGL({ frag: vec4(uv, 0, 1) })
        return <canvas ref={gl.ref} />
}

createRoot(document.getElementById('root')).render(<Canvas />)
```

<details>
<summary>

react-native supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-react-native-test-k2vfvk))

</summary>

```ts
import { GLView } from 'expo-gl'
import { registerRootComponent } from 'expo'
import { useGL } from 'glre/native'
import { vec4, uv } from 'glre/node'
const Canvas = () => {
        const gl = useGL({ frag: vec4(uv, 0, 1) })
        return <GLView style={{ flex: 1 }} onContextCreate={gl.ref} />
}

registerRootComponent(Canvas)
```

</details>
<details>
<summary>

solid js supported ([codesandbox demo](https://codesandbox.io/p/sandbox/glre-solid-test-qgzhxh))

</summary>

```ts
import { render } from 'solid-js/web'
import { onGL } from 'glre/solid'
import { vec4, uv } from 'glre/node'
const Canvas = () => {
        const gl = onGL({ frag: vec4(uv, 0, 1) })
        return <canvas ref={gl.ref} />
}

render(() => <Canvas />, document.getElementById('root'))
```

</details>
<details>
<summary>

esm supported ([codesandbox demo](https://codesandbox.io/s/glre-basic-demo3-3bhr3y))

</summary>

```html
<script type="module">
        import { createGL } from 'https://esm.sh/glre'
        import { vec4, uv } from 'https://esm.sh/glre/node'
        createGL({ fs: vec4(uv, 0, 1) }).mount()
</script>
```

</details>
</samp>
</strong>

## Node System

glre's node system reconstructs shader authoring through TypeScript syntax,
dissolving the boundary between CPU logic and GPU computation.
Rather than traditional string-based shader composition,
this system materializes shaders as abstract syntax trees,
enabling unprecedented code mobility across WebGL2 and WebGPU architectures.

```ts
// Shader logic materializes through method chaining
const fragment = vec4(fract(position.xy.div(iResolution)), 0, 1)
        .mul(uniform(brightness))
        .mix(texture(backgroundMap, uv()), blend)
```

The system operates through proxy objects that capture mathematical operations
as node graphs, later transpiled to target shader languages.
This deconstructed approach eliminates the traditional separation
between shader compilation and runtime execution.

### Type System Deconstruction

Traditional shader types dissolve into factory functions that generate node proxies:

```ts
// Types emerge from function calls rather than declarations
const position = vec3(x, y, z) // Becomes position node
const transform = mat4().mul(modelView) // Matrix composition
const sampled = texture(map, uv()) // Sampling operation
```

Each operation generates immutable node structures,
building computation graphs that exist independently of their eventual compilation target.

### Function Composition Reimagined

The `Fn` constructor dissolves function boundaries, creating reusable computation patterns:

```ts
// Functions exist as first-class node compositions
const noise = Fn(([coord]) => {
        return sin(coord.x.mul(12.9898))
                .add(sin(coord.y.mul(78.233)))
                .mul(43758.5453)
                .fract()
})

// Composition becomes transparent
const surface = noise(position.xz.mul(scale)).mix(noise(position.xz.mul(scale.mul(2))), 0.5)
```

### Control Flow Dissolution

Traditional control structures become node compositions, eliminating imperative sequence:

```ts
// Conditional logic as expression trees
If(height.greaterThan(waterLevel), () => {
        return grassTexture.sample(worldUV)
}).Else(() => {
        return waterTexture.sample(worldUV.add(wave))
})

// Loops decompose into iteration patterns
Loop(samples, ({ i }) => {
        accumulator.assign(accumulator.add(sample(position.add(offsets.element(i)))))
})
```

### Reactive Uniform Architecture

Uniforms transcend static parameter passing, becoming reactive data channels:

```ts
const time = uniform(0) // Creates reactive binding
const amplitude = uniform(1) // Automatic GPU synchronization

// Values flow reactively without explicit updates
const wave = sin(time.mul(frequency)).mul(amplitude)

// Runtime updates propagate automatically
time.value = performance.now() / 1000
```

### Attribute Data Streams

Vertex attributes dissolve into data stream abstractions:

```ts
// Attributes become typed data channels
const positions = attribute(vertexData) // Raw data binding
const normals = attribute(normalData) // Parallel stream
const uvs = attribute(textureCoords) // Coordinate mapping

// Streams compose transparently
const worldPosition = positions.transform(modelMatrix)
const viewNormal = normals.transform(normalMatrix)
```

## PRs

###### welcome✨

## LICENSE

###### MIT⚾️
