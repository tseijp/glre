---
marp: true
hide_table_of_contents: true
title: "Basic API"
description: "Basic API"
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Basic API

## Set frame callback

```ts
// Schedule an update
gl.setFrame(dt => {})

// Start an update loop
gl.setFrame(dt => true)
```

[more][refr]

## Set mount and clean callback

```ts
// run when mount phase
gl.setMount(() => {})

// run when clean phase
gl.setClean(() => {})
```

[more][reev]

## Render shorthands

```ts
gl.setFrame(() => {
  gl.clear()        // to call gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport()     // to call gl.viewport(0, 0, width, height)
  gl.drawArrays()   // to call gl.drawArrays(gl.TRIANGLES, 0, count)
  // or
  gl.drawElements() // to call gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
})
```

## default uniform

uniform | type | description
:------ | :--- | :----------
`mouse` | `vec2` | mouse event values
`resolution` | `vec2` | window size values
`scroll` | `float`| scroll event value

[refr]: https://github.com/tseijp/refr
[reev]: https://github.com/tseijp/reev
