---
marp: true
hide_table_of_contents: true
title: 'APIs'
description: 'APIs'
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# API

## Set gl config

```ts
import { createGL } from 'glre'
import { useGL } from 'glre/react'

useGL({ count: 6 }) // or

createGL({ count: 6 })
```

# Configuration

| `GLConfig`                | default      | description                   |
| :------------------------ | :----------- | :---------------------------- |
| `el: Element`             |              | canvas element                |
| `frag: string`            | [here][frag] | fragment shader               |
| `vert: string`            | [here][vert] | vertex shader                 |
| `size: [number, number]`  | `[1, 1]`     | init window resolution values |
| `mouse: [number, number]` | `[0, 0]`     | init mouse position values    |
| `count: number`           | `6`          | vertex count number           |

[frag]: https://github.com/tseijp/glre/blob/main/packages/core/index.ts
[vert]: https://github.com/tseijp/glre/blob/main/packages/core/index.ts

## Hooks

```ts
// initialize gl
const gl = useGL(config: GLConfig): GL

// Schedule an update
gl.queue(() => {})

// Start an update loop
gl.queue(() => true)

// set uniform
gl.uniform(uniform: Record<string, number | number[]>): GL

// set texture
gl.texture(texture: Record<string, string>): GL

// set attribute
gl.attribute(attribute: Record<string, number[]>): GL
```
