---
marp: true
hide_table_of_contents: true
title: 'Configuration'
description: 'Configuration'
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

# Configuration

| `GLConfig`                | default      | description                   |
| :------------------------ | :----------- | :---------------------------- |
| `el: Element`             |              | canvas element                |
| `fs: string`              | [more][frag] | fragment shader               |
| `vs: string`              | [more][vert] | vertex shader                 |
| `frag: string`            | [more][frag] | fragment shader               |
| `vert: string`            | [more][vert] | vertex shader                 |
| `fragment: string`        | [more][frag] | fragment shader               |
| `vertex: string`          | [more][vert] | vertex shader                 |
| `size: [number, number]`  | `[1, 1]`     | init window resolution values |
| `mouse: [number, number]` | `[0, 0]`     | init mouse position values    |
| `count: number`           | `6`          | vertex count number           |

[frag]: https://github.com/tseijp/glre/blob/main/packages/core/index.ts
[vert]: https://github.com/tseijp/glre/blob/main/packages/core/index.ts
