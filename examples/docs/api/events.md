---
marp: true
hide_table_of_contents: true
title: 'Event API'
description: 'Event API'
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

# Event API

```ts
import { gl } from 'glre'

gl({
        // init
        init() {},

        // mount
        mount() {},

        // clean
        clean() {},

        // render
        render() {},

        // mousemove
        mousemove() {},

        // resize
        resize() {},

        // scroll
        scroll() {},
})
```

## create event

```ts
import { createGL, createTF } from 'glre'

// create initialized gl event
const gl = createGL()

// create tranfrom buffer event
const tf = createTF()
```
