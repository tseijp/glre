# 🌇 glre

<strong>
<samp>

<p align="center">

[![ npm version ](https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000)](https://www.npmjs.com/package/glre)
[![ downloads ](https://img.shields.io/npm/dm/glre.svg?style=flat&colorA=000&colorB=000)](https://www.npmtrends.com/glre)
[![ license MIT ](https://img.shields.io/npm/l/glre?style=flat&colorA=000&colorB=000)](https://github.com/tseijp/glre)
[![ docs available ](https://img.shields.io/badge/docs-available-000.svg?style=flat&colorA=000)](https://glre.dev)
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
        glre simplifies WebGL2 / WebGPU programming via TypeScript, React, Solid and more.
      </td>
      <td width="2500px" valign="top">
        <a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">
        <img alt="4" src="https://i.imgur.com/Lb3h9fs.jpg"></img>
        </a>
      </td>
    </tr>
  </tbody>
</table>

<table>
<tr valign="top">
<td width="1000px">
<br />

**ESM**

---

<!-- prettier-ignore -->
```html
<script type="module">
  import { createGL } from 'https://esm.sh/glre'
  import { vec4, uv } from 'https://esm.sh/glre/node'
  createGL({ fs: vec4(uv, 0, 1) }).mount()
</script>
```

</td>
<td width="0px">
<details>
<summary>

React

---

</summary>

<!-- prettier-ignore -->
```ts
import { createRoot } from 'react-dom/client'
import { useGL } from 'glre/react'
import { vec4, uv } from 'glre/node'

const Canvas = () => {
  const gl = useGL({ fragment: vec4(uv, 0, 1) })
  return <canvas ref={gl.ref} />
}

const root = document.getElementById('root')
createRoot(root).render(<Canvas />)
```

</details>
</td>
<td width="0px">
<details>
<summary>

ReactNative

---

</summary>

<!-- prettier-ignore -->
```ts
import { GLView } from 'expo-gl'
import { registerRootComponent } from 'expo'
import { useGL } from 'glre/native'
import { vec4, uv } from 'glre/node'

const Canvas = () => {
  const gl = useGL({ fragment: vec4(uv, 0, 1) })
  return (
     <GLView
      style={{ flex: 1 }}
      onContextCreate={gl.ref}
    />
  )
}

registerRootComponent(Canvas)
```

</details>
</td>
<td width="0px">
<details>
<summary>

Solid.js

---

</summary>

<!-- prettier-ignore -->
```ts
import { render } from 'solid-js/web'
import { onGL } from 'glre/solid'
import { vec4, uv } from 'glre/node'

const Canvas = () => {
  const gl = onGL({ fragment: vec4(uv, 0, 1) })
  return <canvas ref={gl.ref} />
}

render(() => <Canvas />, document.getElementById('root'))
```

</details>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Varying](https://glre.dev/docs#varying)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const tri = attribute([
     0, 0.73,
    -1,   -1,
     1,   -1,
  ])
  const col = attribute([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ])
  const gl = useGL({
    isWebGL: true,
    triangleCount: 1,
    vertex: vec4(tri, 0, 1),
    fragment: vec4(varying(col), 1),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    triangleCount: 1,
    vertex: `
    #version 300 es
    in vec4 tri;
    in vec3 col;
    out vec3 v_col;
    void main() {
      gl_Position = tri;
      v_col = col;
    }`,
    fragment: `
    #version 300 es
    precision mediump float;
    in vec3 v_col;
    out vec4 fragColor;
    void main() {
      fragColor = vec4(v_col, 1.0);
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1,
  ])
  gl.attribute('col', [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: false,
    triangleCount: 1,
    vertex: `
    struct In {
      @location(0) tri: vec2f,
      @location(1) col: vec3f,
    }
    struct Out {
      @builtin(position) position: vec4f,
      @location(0) v_col: vec3f,
    }
    @vertex
    fn main(in: In) -> Out {
      var out: Out;
      out.position = vec4f(in.tri, 0.0, 1.0);
      out.v_col = in.col;
      return out;
    }`,
    fragment: `
    struct Out {
      @builtin(position) position: vec4f,
      @location(0) v_col: vec3f,
    }
    @fragment
    fn main(out: Out) -> @location(0) vec4f {
      return vec4f(out.v_col, 1.0);
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  gl.attribute('col', [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#varying">
<img width="256px" src="./examples/docs/static/img/readme/varying.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Uniforms](https://glre.dev/docs#uniforms)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    fragment: vec4(
      uv.sub(iMouse).fract(),
      iTime.sin().mul(0.5).add(0.5),
      1
    ),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    fragment: `
    #version 300 es
    precision mediump float;
    uniform vec2 iResolution;
    uniform vec2 iMouse;
    uniform float iTime;
    out vec4 fragColor;
    void main() {
      vec2 uv = fract(gl_FragCoord.xy / iResolution.xy - iMouse);
      fragColor = vec4(uv, sin(iTime) * 0.5 + 0.5, 1.0);
    }`,
  })
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: false,
    fragment: `
    @group(0) @binding(0) var<uniform> iResolution: vec2f;
    @group(0) @binding(1) var<uniform> iMouse: vec2f;
    @group(0) @binding(2) var<uniform> iTime: f32;
    @fragment
    fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
      let uv = fract(position.xy / iResolution - iMouse);
      return vec4f(uv, sin(iTime) * 0.5 + 0.5, 1.0);
    }`,
  })
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#uniforms">
<img width="256px" src="./examples/docs/static/img/readme/uniform.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Attributes](https://glre.dev/docs#attributes)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const tri = attribute([
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  const gl = useGL({
    isWebGL: true,
    triangleCount: 1,
    vertex: vec4(tri, 0, 1),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    triangleCount: 1,
    vertex: `
    #version 300 es
    in vec4 tri;
    void main() {
      gl_Position = tri;
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: false,
    triangleCount: 1,
    vertex: `
    @vertex
    fn main(@location(0) tri: vec2f) -> @builtin(position) vec4f {
      return vec4f(tri, 0.0, 1.0);
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#attributes">
<img width="256px" src="./examples/docs/static/img/readme/attribute.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Multiples](https://glre.dev/docs#multiples)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const tri = attribute([
       0, 0.37,
    -0.5, -0.5,
     0.5, -0.5
  ])
  const gl = useGL(
    {
      isWebGL: true,
      triangleCount: 1,
      vertex: vec4(vec2(-0.5, 0).add(tri), 0, 1),
    },
    {
      triangleCount: 1,
      vertex: vec4(vec2(0.5, 0).add(tri), 0, 1),
    }
  )
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL(
    {
      isWebGL: true,
      triangleCount: 1,
      vertex: `
      #version 300 es
      in vec2 tri;
      void main() {
        gl_Position = vec4((vec2(-0.5, 0.0) + tri), 0.0, 1.0);
      }`,
    },
    {
      triangleCount: 1,
      vertex: `
      #version 300 es
      in vec2 tri;
      void main() {
        gl_Position = vec4((vec2(0.5, 0.0) + tri), 0.0, 1.0);
      }`,
    }
  )
  gl.attribute('tri', [
       0, 0.37,
    -0.5, -0.5,
     0.5, -0.5
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL(
    {
      isWebGL: false,
      triangleCount: 1,
      vertex: `
      struct In {
        @location(0) tri: vec2f
      }
      struct Out {
        @builtin(position) position: vec4f
      }
      @vertex
      fn main(in: In) -> Out {
        var out: Out;
        out.position = vec4f((vec2f(-0.5, 0.0) + in.tri), 0.0, 1.0);
        return out;
      }`,
    },
    {
      triangleCount: 1,
      vertex: `
      struct In {
        @location(0) tri: vec2f
      }
      struct Out {
        @builtin(position) position: vec4f
      }
      @vertex
      fn main(in: In) -> Out {
        var out: Out;
        out.position = vec4f((vec2f(0.5, 0.0) + in.tri), 0.0, 1.0);
        return out;
      }`,
    }
  )
  gl.attribute('tri', [
       0, 0.37,
    -0.5, -0.5,
     0.5, -0.5
  ])
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#multiples">
<img width="256px" src="./examples/docs/static/img/readme/multiple.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Textures](https://glre.dev/docs#textures)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const iTexture = uniform('https://...')
  const gl = useGL({
    isWebGL: true,
    fragment: texture(iTexture, uv),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    fragment: `
    #version 300 es
    precision mediump float;
    uniform vec2 iResolution;
    uniform sampler2D iTexture;
    out vec4 fragColor;
    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      fragColor = texture(iTexture, uv);
    }`,
  })
  gl.texture('iTexture', 'https://...')
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: false,
    fragment: `
    @group(0) @binding(0) var<uniform> iResolution: vec2f;
    @group(1) @binding(0) var iSampler: sampler;
    @group(1) @binding(1) var iTexture: texture_2d<f32>;
    @fragment
    fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
      let uv = position.xy / iResolution;
      return textureSample(iTexture, iSampler, uv);
    }`,
  })
  gl.texture('iTexture', 'https://...')
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#textures">
<img width="256px" src="./examples/docs/static/img/readme/texture.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Instancing](https://glre.dev/docs#instancing)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const tri = attribute([
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  const pos = instance(
    Array(1000 * 2)
      .fill(0)
      .map(Math.random)
  )
  const gl = useGL({
    isWebGL: true,
    instanceCount: 1000,
    triangleCount: 1,
    vertex: vec4(
      tri.mul(0.05).sub(1).add(pos.mul(2)),
      0,
      1
    ),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: true,
    instanceCount: 1000,
    triangleCount: 1,
    vertex: `
    #version 300 es
    in vec2 tri;
    in vec2 pos;
    void main() {
      gl_Position = vec4((((tri * 0.05) - 1.0) + (pos * 2.0)), 0.0, 1.0);
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  gl.instance(
    'pos',
    Array(1000 * 2)
      .fill(0)
      .map(Math.random)
  )
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const gl = useGL({
    isWebGL: false,
    instanceCount: 1000,
    triangleCount: 1,
    vertex: `
    struct In {
      @location(0) tri: vec2f,
      @location(1) pos: vec2f
    }
    struct Out {
      @builtin(position) position: vec4f
    }
    @vertex
    fn main(in: In) -> Out {
      var out: Out;
      out.position = vec4f((((in.tri * 0.05) - 1.0) + (in.pos * 2.0)), 0.0, 1.0);
    return out;
    }`,
  })
  gl.attribute('tri', [
     0, 0.73,
    -1,   -1,
     1,   -1
  ])
  gl.instance(
    'pos',
    Array(1000 * 2)
      .fill(0)
      .map(Math.random)
  )
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#instancing">
<img width="256px" src="./examples/docs/static/img/readme/instancing.jpg" />
</a>
</td>
</tr>
</table>

---

<table>
<tr>
<td width="100%" colspan="3">

### [Computing](https://glre.dev/docs#computing)

</td>
</tr>
<tr valign="top">
<td width="1000px">
<br />

**TSL**

---

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const wave = storage(float(Array(1024)), 'wave')
  const gl = useGL({
    isWebGL: true,
    compute: Scope(() => {
      If(uint(0).equal(id.x), () => {
        wave.element(id.x).assign(iMouse.x)
      }).Else(() => {
        const prev = wave.element(id.x.sub(uint(1)))
        wave.element(id.x).assign(prev)
      })
    }),
    fragment: Scope(() => {
      const x = wave
        .element(uint(uv.y.mul(1024)))
        .sub(uv.x)
        .abs()
      return vec4(
        vec3(uv.step(vec2(smoothstep(0.01, 0, x))), 0),
        1
      )
    }),
  })
  return <canvas ref={gl.ref} />
}
```

</td>
<td width="0px">
<details>
<summary>

WebGL

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const wave = storage(float(Array(1024)), 'wave')
  const gl = useGL({
    isWebGL: true,
    compute: `
    #version 300 es
    precision highp float;
    uniform sampler2D wave;
    uniform vec2 iMouse;
    layout(location = 0) out vec4 _wave;
    void main() {
      if ((uint(0.0) == uvec3(uint(gl_FragCoord.y) * uint(32) + uint(gl_FragCoord.x), 0u, 0u).x)) {
        _wave = vec4(iMouse.x, 0.0, 0.0, 1.0);
      } else {
        _wave = vec4(texelFetch(wave, ivec2(int((uvec3(uint(gl_FragCoord.y) * uint(32) + uint(gl_FragCoord.x), 0u, 0u).x - uint(1.0))) % 32, int((uvec3(uint(gl_FragCoord.y) * uint(32) + uint(gl_FragCoord.x), 0u, 0u).x - uint(1.0))) / 32), 0).x, 0.0, 0.0, 1.0);
      };
    }`,
    fragment: `
    #version 300 es
    precision highp float;
    out vec4 fragColor;
    uniform vec2 iResolution;
    uniform sampler2D wave;
    void main() {
      fragColor = vec4(vec3(step((gl_FragCoord.xy / iResolution), vec2(smoothstep(0.01, 0.0, abs((texelFetch(wave, ivec2(int(uint(((gl_FragCoord.xy / iResolution).y * 1024.0))) % 32, int(uint(((gl_FragCoord.xy / iResolution).y * 1024.0))) / 32), 0).x - (gl_FragCoord.xy / iResolution).x))))), 0.0), 1.0);
    }`,
  })
  gl.storage('wave', Array(1024))
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
<td width="0px">
<details>
<summary>

WebGPU

---

</summary>

<!-- prettier-ignore -->
```tsx
function Canvas() {
  const wave = storage(float(Array(1024)), 'wave')
  const gl = useGL({
    isWebGL: false,
    compute: `
    struct In {
      @builtin(global_invocation_id) global_invocation_id: vec3u
    }
    @group(0) @binding(1) var<uniform> iMouse: vec2f;
    @group(2) @binding(0) var<storage, read_write> wave: array<f32>;
    @compute @workgroup_size(32)
    fn main(in: In) {
      if ((u32(0.0) == in.global_invocation_id.x)) {
        wave[in.global_invocation_id.x] = iMouse.x;
      } else {
        wave[in.global_invocation_id.x] = wave[in.global_invocation_id.x - u32(1.0)];
      };
    }`,
    fragment: `
    struct Out {
      @builtin(position) position: vec4f
    }
    @group(2) @binding(0) var<storage, read_write> wave: array<f32>;
    @group(0) @binding(0) var<uniform> iResolution: vec2f;
    @fragment
    fn main(out: Out) -> @location(0) vec4f {
      return vec4f(vec3f(step((out.position.xy / iResolution), vec2f(smoothstep(0.01, 0.0, abs((wave[u32(((out.position.xy / iResolution).y * 1024.0))] - (out.position.xy / iResolution).x))))), 0.0), 1.0);
    }`,
  })
  gl.storage('wave', Array(1024))
  return <canvas ref={gl.ref} />
}
```

</details>
</td>
</tr>
<tr>
<td colspan="3">
<a href="https://glre.dev/docs#computing">
<img width="256px" src="./examples/docs/static/img/readme/computing.jpg" />
</a>
</td>
</tr>
</table>

---

## Node System

glre's node system reconstructs shader authoring through TypeScript syntax,
dissolving the boundary between CPU logic and GPU computation.
Rather than traditional string-based shader composition,
this system materializes shaders as abstract syntax trees,
enabling unprecedented code mobility across WebGL2 and WebGPU architectures.

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

</samp>
</strong>
