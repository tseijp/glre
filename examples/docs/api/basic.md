---
marp: true
hide_table_of_contents: true
title: 'Basic API'
description: 'Basic API'
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2025-06-12
---

# Basic API

## Set gl config

```ts
const gl = createGL({ frag: `...` })
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
gl.queue((dt) => {})

// Start an update loop
gl.queue((dt) => true)
```

[more][refr]

[refr]: https://github.com/tseijp/refr
[reev]: https://github.com/tseijp/reev
