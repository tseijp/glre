---
marp: true
hide_table_of_contents: true
title: 'Basic API'
description: 'Basic API'
image: https://github.com/tseijp.png
keywords:
        [
                glsl,
                webgl,
                hooks,
                react,
                reactjs,
                reactive,
                solid,
                solidjs,
                typescript,
        ]
date: 2023-01-01
---

# Basic API

## Set gl config

```ts
gl('count', 6) // or
gl({ count: 6 })
```

## Set buffer object

```ts
// set uniform
gl.uniform('iTime', performance.now() / 1000) // or
gl.uniform({ iTime: performance.now() / 1000 })

// set attribute
gl.attribute('a_position', [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) // or
gl.attribute({ a_position: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1] })
```

## Set mount and clean callback

```ts
// run when mount phase
gl('mount', () => {})

// run when clean phase
gl('clean', () => {})
```

[more][reev]

## Set frame callback

```ts
// Schedule an update
gl.frame((dt) => {})

// Start an update loop
gl.frame((dt) => true)
```

[more][refr]

## Render shorthands

```ts
gl.frame(() => {
        gl.clear() // ...... to call gl.clear(gl.COLOR_BUFFER_BIT)
        gl.viewport() // ... to call gl.viewport(0, 0, width, height)
        gl.drawArrays() // . to call gl.drawArrays(gl.TRIANGLES, 0, count)
        // or
        gl.drawElements() // to call gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
})
```

## Shader Inputs

| uniform type        | uniform key             | description                                              | availability |
| :------------------ | :---------------------- | :------------------------------------------------------- | :----------: |
| `uniform vec3`      | `iResolution`           | viewport resolution (in pixels)                          |      ✔       |
| `uniform float`     | `iTime`                 | shader playback time (in seconds)                        |      ✔       |
| `uniform float`     | `iTimeDelta`            | render time (in seconds)                                 |      ✔       |
| `uniform float`     | `iFrameRate`            | shader frame rate                                        |      ❌      |
| `uniform int`       | `iFrame`                | shader playback frame                                    |      ❌      |
| `uniform float`     | `iChannelTime[4]`       | channel playback time (in seconds)                       |      ✔       |
| `uniform vec3`      | `iChannelResolution[4]` | channel resolution (in pixels)                           |      ❌      |
| `uniform vec4`      | `iMouse`                | mouse pixel coords. xy: current (if MLB down), zw: click |      ✔       |
| `uniform samplerXX` | `iChannel0..3`          | input channel. XX = 2D/Cube                              |      ❌      |
| `uniform vec4`      | `iDate`                 | (year, month, day, time in seconds)                      |      ❌      |
| `uniform float`     | `iSampleRate`           | sound sample rate (i.e., 44100)                          |      ❌      |

[refr]: https://github.com/tseijp/refr
[reev]: https://github.com/tseijp/reev
